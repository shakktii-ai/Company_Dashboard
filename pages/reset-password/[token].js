// import { useState } from "react";
// import { useRouter } from "next/router";

// const ResetPasswordPage = () => {
//   const router = useRouter();
//   const { token } = router.query;

//   const [newPassword, setNewPassword] = useState("");
//   const [message, setMessage] = useState("");
//   const [submitted, setSubmitted] = useState(false);

//   const handleReset = async (e) => {
//     e.preventDefault();

//     const res = await fetch("/api/reset-password", {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({ token, password: newPassword })
//     });

//     const data = await res.json();
//     if (data.success) {
//       setMessage("✅ Password reset successfully. You can now log in.");
//       setSubmitted(true);
//     } else {
//       setMessage(`❌ ${data.error || "Something went wrong."}`);
//     }
//   };

//   return (
//     <div>
//       <h1>Reset Password</h1>
//       <form onSubmit={handleReset}>
//         <input
//           type="password"
//           placeholder="Enter your new password"
//           value={newPassword}
//           onChange={(e) => setNewPassword(e.target.value)}
//           required
//           disabled={submitted}
//         />
//         <button type="submit" disabled={submitted}>
//           Reset Password
//         </button>
//       </form>
//       {message && <p>{message}</p>}
//     </div>
//   );
// };

// export default ResetPasswordPage;


import { useState } from "react";
import { useRouter } from "next/router";

const ResetPasswordPage = () => {
  const router = useRouter();
  const { token } = router.query;

  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reset-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ token, passwordHash: newPassword })
    });

    const data = await res.json();
    if (data.success) {
      setMessage("✅ Password reset successfully. You can now log in.");
      setSubmitted(true);
    } else {
      setMessage(`❌ ${data.error || "Something went wrong."}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">Reset Password</h1>
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={submitted}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={submitted}
            className={`w-full py-2 px-4 rounded-md text-white ${submitted ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            {submitted ? 'Password Reset' : 'Reset Password'}
          </button>
        </form>
        {message && (
          <p className={`mt-4 text-center ${message.startsWith("✅") ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;