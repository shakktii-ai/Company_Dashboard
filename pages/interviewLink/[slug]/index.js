// pages/interviewLink/[slug].js

import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function EmployeeAssessmentStart() {
  const router = useRouter();
  const { slug } = router.query;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;

    async function startAssessment() {
      try {
        const res = await fetch("/api/admin/employees/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ slug }),
        });

        const data = await res.json();

        if (!data.ok) {
          setError(data.message || "Assessment not available");
          setLoading(false);
          return;
        }

        // Redirect to instructions page
        router.replace(
          `/interviewLink/${slug}/test?sessionId=${data.sessionId}`
        );
      } catch (err) {
        setError("Something went wrong");
        setLoading(false);
      }
    }

    startAssessment();
  }, [slug]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full text-center">

        {loading && (
          <>
            <h2 className="text-xl font-semibold mb-4">
              Preparing your assessment...
            </h2>
            <p className="text-gray-500 text-sm">
              Please wait while we generate your technical questions.
            </p>
          </>
        )}

        {error && (
          <>
            <h2 className="text-xl font-semibold text-red-600 mb-4">
              Unable to Start Assessment
            </h2>
            <p className="text-gray-600 text-sm">{error}</p>
            <button
              onClick={() => router.push("/admin/employeeDashboard")}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md"
            >
              Back to Dashboard
            </button>
          </>
        )}

      </div>
    </div>
  );
}