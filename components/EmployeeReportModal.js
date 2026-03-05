import { useEffect, useState } from "react";

export default function EmployeeReportModal({ sessionId, onClose }) {
  const [report, setReport] = useState(null);

  useEffect(() => {
    if (!sessionId) return;
    loadReport();
  }, [sessionId]);

  async function loadReport() {
    const res = await fetch(`/api/admin/employees/report/${sessionId}`);
    const data = await res.json();
    if (data.ok) setReport(data.session);
  }

  if (!report)
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl">Loading report...</div>
      </div>
    );

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-100 w-full max-w-6xl h-[90vh] rounded-2xl shadow-xl flex flex-col relative">
        
        {/* HEADER (fixed inside modal) */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-white">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-gray-800">
              {report.assessmentId?.title || "Assessment Report"}
            </h1>
            <p className="text-sm text-gray-500">
              Role: {report.assessmentId?.role}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-600 transition"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* CONTENT (scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* SCORE SUMMARY */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ScoreCard label="Final Score" value={`${report.scoring.finalScore}%`} />
            <ScoreCard label="Written Score" value={`${report.scoring.writtenScore}%`} />
            <ScoreCard label="Alignment" value={report.kpiAlignment} />
            <ScoreCard label="Duration" value={`${Math.floor(report.durationInSeconds / 60)} min`} />
          </div>

          {/* OVERALL SUMMARY */}
          {report.aiReport && (
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-lg font-semibold mb-2">Overall Performance Summary</h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                {report.aiReport.overallSummary}
              </p>
            </div>
          )}

          {/* CAPABILITY EVALUATION */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-4">Capability Evaluation</h2>
            <div className="space-y-4">
              {(report.dimensionScores || []).map((d, i) => {
                const percent = d.score * 10;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{d.dimension}</span>
                      <span>{percent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded h-2">
                      <div
                        className={`h-2 rounded ${
                          percent > 70
                            ? "bg-green-500"
                            : percent > 40
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{d.feedback}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* KPI ANALYSIS */}
          {report.aiReport?.kpiAnalysis && (
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-lg font-semibold mb-4">KPI Analysis</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {report.aiReport.kpiAnalysis.map((k, i) => (
                  <AnalysisCard key={i} title={k.kpi} level={k.scoreImpact} text={k.feedback} />
                ))}
              </div>
            </div>
          )}

          {/* KRA ANALYSIS */}
          {report.aiReport?.kraAnalysis && (
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-lg font-semibold mb-4">KRA Analysis</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {report.aiReport.kraAnalysis.map((k, i) => (
                  <AnalysisCard key={i} title={k.kra} level={k.performanceLevel} text={k.feedback} />
                ))}
              </div>
            </div>
          )}

          {/* IMPROVEMENTS */}
          {report.aiReport && (
            <div className="grid md:grid-cols-2 gap-6">
              <InsightCard title="Areas for Improvement">
                {report.aiReport.improvementAreas?.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </InsightCard>
              <InsightCard title="Recommended Actions">
                {report.aiReport.recommendedActions?.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </InsightCard>
            </div>
          )}
        </div>

        {/* FOOTER (responsive actions) */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
         
          {/* <button
            onClick={() => handleDownload(report)}
            className="w-full sm:w-auto px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            Download Report
          </button> */}
           <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


/* SCORE CARD */

function ScoreCard({ label, value, highlight }) {

  return (
    <div className={`p-5 rounded-xl shadow text-center bg-white `}>

      <p className="text-xs opacity-80">{label}</p>

      <p className="text-md font-semibold mt-1">
        {value}
      </p>

    </div>
  );
}


/* ANALYSIS CARD */

function AnalysisCard({ title, level, text }) {

  const color =
    level === "Strong"
      ? "text-green-600"
      : level === "Moderate"
      ? "text-yellow-600"
      : "text-red-600";

  return (

    <div className="border rounded-lg p-4 bg-gray-50">

      <div className="flex justify-between mb-1">

        <p className="font-medium text-sm">
          {title}
        </p>

        <span className={`text-xs font-semibold ${color}`}>
          {level}
        </span>

      </div>

      <p className="text-xs text-gray-600">
        {text}
      </p>

    </div>

  );
}


/* INSIGHT CARD */

function InsightCard({ title, children }) {

  return (

    <div className="bg-white p-6 rounded-2xl shadow">

      <h3 className="font-semibold mb-3">
        {title}
      </h3>

      <ul className="list-disc ml-6 text-sm text-gray-600 space-y-1">
        {children}
      </ul>

    </div>

  );

}