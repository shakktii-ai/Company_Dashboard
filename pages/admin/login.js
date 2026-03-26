import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { FiMail, FiLock, FiLogIn } from "react-icons/fi";
import { TbUserCircle } from "react-icons/tb";
export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // VERY IMPORTANT for cookies
        body: JSON.stringify(form),
      });

      const data = await res.json();
if (!data.ok) {
        alert(data.message || "Login failed");
        return;
      }

      // ✅ localStorage set (required for culture interview)
      localStorage.setItem("companyId", data.company.id);
      localStorage.setItem("userId", data.admin.id);
      localStorage.setItem("role", data.admin.role);
      localStorage.setItem("user", JSON.stringify(data.admin));

      // ✅ Employee / HOD / Leader
      // if (data.admin.role !== "admin") {
      //   if (data.admin.cultureInterviewCompleted) {
      //     router.push("/admin/employeeDashboard"); // interview already done
      //   } 
      //   else {
      //     router.push("employee/culture-interview"); // interview pending
      //   }
      //   return;
      // }
      // ✅ Employee / HOD / Leader (no culture check)
if (data.admin.role !== "admin") {
  router.push("/admin/employeeDashboard");
  return;
}

      // ✅ Admin flow
      if (!data.company.onboardingCompleted) {
        router.push("/admin/signup");
      } else {
        router.push("/admin");
      }

    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">

      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">

        {/* Icon */}
        {/* <div className="flex justify-center mb-4">
          <div className="bg-teal-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl">
            <TbUserCircle/>
          </div>
        </div> */}

        {/* Heading */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Login</h1>
          <p className="text-sm text-gray-500">
             Sign in to access your workspace
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div>
            <label className="text-sm text-gray-600">Email</label>

            <div className="flex items-center border rounded-lg px-3 mt-1">
              <FiMail className="text-gray-400 mr-2" />
              <input
                name="email"
                placeholder="Enter your email"
                onChange={handleChange}
                className="w-full py-2 focus:outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-gray-600">Password</label>

            <div className="flex items-center border rounded-lg px-3 mt-1">
              <FiLock className="text-gray-400 mr-2" />
              <input
                name="password"
                type="password"
                placeholder="Enter your password"
                onChange={handleChange}
                className="w-full py-2 focus:outline-none"
              />
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className="flex justify-between items-center text-sm">

            <label className="flex items-center gap-2 text-gray-600">
              <input type="checkbox" />
              Remember me
            </label>

            <a className="text-teal-600 hover:underline cursor-pointer">
              Forgot password?
            </a>

          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-lg font-medium shadow-md transition"
          >
            {loading ? "Login..." : "Login"}
          </button>

        </form>

        {/* Signup */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            New here?{" "}
            <Link
              href="/admin/signup"
              className="text-teal-600 hover:underline"
            >
              Onboard your company
            </Link>
          </p>
        </div>

      </div>

    

    </div>
  );
}
