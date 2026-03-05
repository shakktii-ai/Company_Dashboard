import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";

export default function EmployeeAssessmentTest() {
  const router = useRouter();
  const { sessionId } = router.query;

  const [session, setSession] = useState(null);
  // const [mcqAnswers, setMcqAnswers] = useState({});
  const [writtenAnswers, setWrittenAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("written");
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoSubmitted = useRef(false);
  const [submitted, setSubmitted] = useState(false);
  /* ================= SECURITY RESTRICTIONS ================= */

  useEffect(() => {
    const preventDefault = (e) => e.preventDefault();

    const preventCopyPaste = (e) => {
      e.preventDefault();
      return false;
    };

    const preventKeys = (e) => {
      // Block Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+U
      if (
        (e.ctrlKey && ["c", "v", "x", "u"].includes(e.key.toLowerCase())) ||
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i") || // Dev tools
        e.key === "F12"
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", preventDefault);
    document.addEventListener("copy", preventCopyPaste);
    document.addEventListener("paste", preventCopyPaste);
    document.addEventListener("cut", preventCopyPaste);
    document.addEventListener("keydown", preventKeys);

    return () => {
      document.removeEventListener("contextmenu", preventDefault);
      document.removeEventListener("copy", preventCopyPaste);
      document.removeEventListener("paste", preventCopyPaste);
      document.removeEventListener("cut", preventCopyPaste);
      document.removeEventListener("keydown", preventKeys);
    };
  }, []);
  /* ================= LOAD SESSION ================= */

  useEffect(() => {
    if (!router.isReady || !sessionId) return;

    async function load() {
      const res = await fetch(`/api/admin/employees/session/${sessionId}`);
      const data = await res.json();
      if (data.ok) {
        setSession(data.session);
      }
    }

    load();
  }, [sessionId]);

  useEffect(() => {
  if (!sessionId) return;
  if (Object.keys(writtenAnswers).length === 0) return;

  const interval = setInterval(() => {
    localStorage.setItem(
      `assessment_${sessionId}`,
      JSON.stringify(writtenAnswers)
    );
  }, 5000);

  return () => clearInterval(interval);
}, [writtenAnswers, sessionId]);

  useEffect(() => {
    if (!sessionId) return;

    const saved = localStorage.getItem(`assessment_${sessionId}`);
    if (saved) {
      setWrittenAnswers(JSON.parse(saved));
    }
  }, [sessionId]);
  /* ================= TIMER (SERVER BASED) ================= */

  useEffect(() => {
   if (!session?.startedAt || submitted) return;

    const start = new Date(session.startedAt).getTime();
    if (isNaN(start)) return;

    const duration =
      (session.durationInSeconds || 1800) * 1000;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = start + duration - now;

      if (diff <= 0) {
        clearInterval(interval);
        if (!autoSubmitted.current) {
          autoSubmitted.current = true;
          submitAssessment();
        }
        return;
      }

      setTimeLeft(Math.floor(diff / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [session,submitted]);

  /* ================= SUBMIT ================= */

  async function submitAssessment() {
    if (loading) return; // prevent double click

    try {
      setLoading(true);
      setSubmitted(true);
      await fetch("/api/admin/employees/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          answers: [],
          writtenAnswers: Object.entries(writtenAnswers).map(([k, v]) => ({
            questionIndex: Number(k),
            response: v,
          })),
        }),
      });
      localStorage.removeItem(`assessment_${sessionId}`);
      router.push("/admin/employeeDashboard");
    } catch (error) {
      console.error("Submit error:", error);
      alert("Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }
  if (!session)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading assessment...
      </div>
    );

  // const mcq = session.generatedQuestions.technical.mcq || [];
  const written = session.generatedQuestions.technical.written || [];
  const questions = written;
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];

  const answeredCount =
    // activeTab === "mcq"
    //   ? Object.keys(mcqAnswers).length:
    Object.keys(writtenAnswers).filter(
      (key) => writtenAnswers[key]?.trim() !== ""
    ).length;
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* HEADER */}
      <div className="bg-white shadow px-6 py-4 flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-lg md:text-xl font-semibold">
          Technical Assessment
        </h1>

        <div className="flex items-center gap-6 mt-2 md:mt-0">
          {timeLeft !== null && (
            <span className="font-mono text-red-600 text-lg">
              {Math.floor(timeLeft / 60)
                .toString()
                .padStart(2, "0")}
              :
              {(timeLeft % 60)
                .toString()
                .padStart(2, "0")}
            </span>
          )}

          <span className="text-sm text-gray-600">
            {answeredCount}/{totalQuestions} Answered
          </span>
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b bg-white">
        {/* <button
        onClick={() => {
          setActiveTab("mcq");
          setCurrentIndex(0);
        }}
        className={`px-6 py-3 text-sm font-medium ${
          activeTab === "mcq"
            ? "border-b-2 border-indigo-600 text-indigo-600"
            : "text-gray-500"
        }`}
      >
        MCQ ({mcq.length})
      </button> */}

        <button
          onClick={() => {
            setActiveTab("written");
            setCurrentIndex(0);
          }}
          className={`px-6 py-3 text-sm font-medium ${activeTab === "written"
            ? "border-b-2 border-indigo-600 text-indigo-600"
            : "text-gray-500"
            }`}
        >
          Written ({written.length})
        </button>
      </div>

      {/* QUESTION AREA */}
      <div className="flex-1 p-6 max-w-4xl mx-auto w-full">

        {currentQuestion && (
          <div className="bg-white rounded shadow p-6">

            <p className="text-sm text-gray-500 mb-2">
              Question {currentIndex + 1} of {totalQuestions}
            </p>

            <p className="font-medium mb-4">
              {currentQuestion.prompt}
            </p>

            {/* MCQ */}
            {/* {activeTab === "mcq" &&
              currentQuestion.options.map((o, oi) => (
                <label
                  key={oi}
                  className="block mb-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    checked={mcqAnswers[currentIndex] === oi}
                    onChange={() =>
                      setMcqAnswers({
                        ...mcqAnswers,
                        [currentIndex]: oi,
                      })
                    }
                  />{" "}
                  {o}
                </label>
              ))
            } */}

            {/* WRITTEN */}
            {activeTab === "written" && (
              <textarea
                spellCheck={false}
                autoComplete="off"
                rows={5}
                className="w-full border rounded p-3 mt-2"
                value={writtenAnswers[currentIndex] || ""}
                onChange={(e) =>
                  setWrittenAnswers({
                    ...writtenAnswers,
                    [currentIndex]: e.target.value,
                  })
                }
              />
            )}
          </div>
        )}

        {/* NAVIGATION */}
        <div className="flex justify-between mt-6">
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => prev - 1)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>

          {currentIndex < totalQuestions - 1 ? (
            <button
              onClick={() => setCurrentIndex((prev) => prev + 1)}
              className="px-4 py-2 bg-indigo-600 text-white rounded"
            >
              Next
            </button>
          ) : (
            <button
              onClick={submitAssessment}
              disabled={loading}
              className={`px-6 py-2 rounded text-white flex items-center gap-2 ${loading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
                }`}
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              {loading ? "Submitting..." : "Submit Assessment"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}