// pages/interviewLink/[slug].js

import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";

export default function EmployeeAssessmentStart() {
  const router = useRouter();
  const { slug, assignmentId } = router.query;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const hasStarted = useRef(false); // ✅ prevent duplicate calls

  useEffect(() => {
    if (!router.isReady) return;

    if (!slug || !assignmentId) {
      setError("Invalid test link");
      setLoading(false);
      return;
    }

    if (hasStarted.current) return;
    hasStarted.current = true;

    async function startAssessment() {
      try {
        const res = await fetch("/api/admin/employees/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ slug, assignmentId }),
        });

        const data = await res.json();

        if (!res.ok || !data.ok) {
          throw new Error(data.message || "Assessment not available");
        }

        router.replace(
          `/interviewLink/${slug}/test?sessionId=${data.sessionId}`
        );

      } catch (err) {
        console.error(err);
        setError(err.message || "Something went wrong");
        setLoading(false);
      }
    }

    startAssessment();

  }, [router.isReady, slug, assignmentId]);
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