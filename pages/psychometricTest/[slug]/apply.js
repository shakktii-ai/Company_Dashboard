
// // pages/interview/[slug]/apply.js
// import { useRouter } from "next/router";
// import { useState, useEffect } from "react";

// export default function ApplyPage() {
//   const router = useRouter();
//   const { slug } = router.query;

//   const [form, setForm] = useState({ name: "", email: "", phone: "" });
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [jobInfo, setJobInfo] = useState(null);

//   useEffect(() => {
//     if (!slug) return;
//     const fetchJob = async () => {
//       try {
//         const res = await fetch(`/api/job-by-slug/${slug}`);
//         if (res.ok) {
//           const j = await res.json();
//           if (j.ok) setJobInfo(j.job);
//         }
//       } catch (e) {}
//     };
//     fetchJob();
//   }, [slug]);

//   // VALIDATION FUNCTION
//   const validate = () => {
//     let errs = {};

//     if (!form.name.trim()) errs.name = "Name is required";

//     if (!form.email.trim()) {
//       errs.email = "Email is required";
//     } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
//       errs.email = "Enter a valid email address";
//     }

//     if (!form.phone.trim()) {
//       errs.phone = "Phone number is required";
//     } else if (!/^[0-9]{10}$/.test(form.phone)) {
//       errs.phone = "Phone must be 10 digits only";
//     }

//     return errs;
//   };

// async function handleSubmit(e) {
//   e.preventDefault();

//   const v = validate();
//   if (Object.keys(v).length > 0) {
//     setErrors(v);
//     return;
//   }

//   // store candidate temporarily
//   localStorage.setItem("candidateForm", JSON.stringify(form));

//   // go to rules page
//   router.push(`/psychometricTest/${slug}/psychometricTest`);
// }

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
//       <div className="w-full max-w-xl bg-white shadow-md rounded-xl p-8">

//         {/* Heading */}
//         <h1 className="text-2xl font-bold text-gray-900 mb-4">
//           Apply for Psychometric Test
//         </h1>
//  <h1 className="text-md font-emibold text-gray-900 mb-4">
//             Please provide your details to start the test.
//         </h1>
        

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="space-y-4">

//           {/* NAME */}
//           <div>
//             <input
//               placeholder="Full Name"
//               value={form.name}
//               onChange={(e) => setForm({ ...form, name: e.target.value })}
//               className={`w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 
//                 ${errors.name ? "border-red-500 focus:ring-red-400" : "focus:ring-blue-400"}`}
//             />
//             {errors.name && (
//               <p className="text-red-500 text-sm mt-1">{errors.name}</p>
//             )}
//           </div>

//           {/* EMAIL */}
//           <div>
//             <input
//               placeholder="Email Address"
//               value={form.email}
//               onChange={(e) => setForm({ ...form, email: e.target.value })}
//               className={`w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 
//                 ${errors.email ? "border-red-500 focus:ring-red-400" : "focus:ring-blue-400"}`}
//             />
//             {errors.email && (
//               <p className="text-red-500 text-sm mt-1">{errors.email}</p>
//             )}
//           </div>

//           {/* PHONE */}
//           <div>
//             <input
//               placeholder="Phone Number"
//               value={form.phone}
//               onChange={(e) => setForm({ ...form, phone: e.target.value })}
//               className={`w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 
//                 ${errors.phone ? "border-red-500 focus:ring-red-400" : "focus:ring-blue-400"}`}
//             />
//             {errors.phone && (
//               <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
//             )}
//           </div>

//           {/* BUTTON */}
//           <button
//             type="submit"
//             disabled={loading}
//             className={`w-full py-3 text-white rounded-lg font-semibold shadow 
//               ${loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
//           >
//             {loading ? "Starting.." : "Start"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function ApplyPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ FETCH LOGGED-IN EMPLOYEE
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include"
        });

        const data = await res.json();

        if (data.ok) {
          setUser(data.user);
        } else {
          router.push("/login");
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // ✅ START TEST
  function handleStart() {
    const payload = {
      name: user.name,
      email: user.email,
      userId: user._id,
      profileType: "employee"
    };

    localStorage.setItem("candidateForm", JSON.stringify(payload));

    router.push(`/psychometricTest/${slug}/psychometricTest`);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

      <div className="bg-white shadow-md rounded-xl p-8 max-w-md w-full">

        <h1 className="text-xl font-bold mb-4">
          Start Psychometric Test
        </h1>

        <p className="text-sm text-gray-600 mb-6">
          You are about to start your assigned test.
        </p>

        {/* USER INFO (READ ONLY) */}
        <div className="bg-gray-50 border rounded-lg p-4 mb-6">
          <p className="text-sm"><b>Name:</b> {user?.name}</p>
          <p className="text-sm"><b>Email:</b> {user?.email}</p>
        </div>

        <button
          onClick={handleStart}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
        >
          Start Test
        </button>

      </div>

    </div>
  );
}