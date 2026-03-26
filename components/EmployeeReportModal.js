import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";

export default function EmployeeReportModal({ sessionId, onClose,employeeId }) {
  const [report, setReport] = useState(null);

  useEffect(() => {
    if (!sessionId) return;
    loadReport();
  }, [sessionId]);

  async function loadReport() {
    // const res = await fetch(`/api/admin/employees/report/${sessionId}`);
       const url = employeeId
      ? `/api/admin/employees/report/${sessionId}?employeeId=${employeeId}`
      : `/api/admin/employees/report/${sessionId}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.ok) setReport(data.session);
  }

  if (!report)
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl shadow">report not found.</div>
      </div>
    );

  return (
   <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center p-4">

      {/* MODAL */}
      <div className="bg-gray-100 w-full max-w-5xl h-[85vh] rounded-2xl shadow-xl flex flex-col overflow-hidden">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-4 flex items-center justify-between">

          <div>
            <h1 className="text-lg md:text-xl font-semibold">
              {report.assessmentId?.title}
            </h1>
            <p className="text-sm opacity-90">
              Role: {report.assessmentId?.role}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-blue-600 transition"
          >
            <FiX size={20} />
          </button>

        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">

          {/* SCORE CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            <ScoreCard label="Final Score" value={`${report.scoring.finalScore}%`} />

            <ScoreCard label="Written Score" value={`${report.scoring.writtenScore}%`} />

            <ScoreCard label="Alignment" value={report.kpiAlignment} />

            <ScoreCard
              label="Duration"
              value={`${Math.floor(report.durationInSeconds / 60)} min`}
            />

          </div>


          {/* OVERALL SUMMARY */}
          {report.aiReport?.overallSummary && (
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="font-semibold text-lg mb-2">
                Overall Performance Summary
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {report.aiReport.overallSummary}
              </p>
            </div>
          )}


          {/* KPI ANALYSIS */}
          {report.aiReport?.kpiAnalysis && (
            <Section title="KPI Analysis">

              <div className="grid md:grid-cols-2 gap-4">

                {report.aiReport.kpiAnalysis.map((k, i) => (
                  <AnalysisCard
                    key={i}
                    title={k.kpi}
                    level={k.scoreImpact}
                    text={k.feedback}
                  />
                ))}

              </div>

            </Section>
          )}


          {/* KRA ANALYSIS */}
          {report.aiReport?.kraAnalysis && (
            <Section title="KRA Analysis">

              <div className="grid md:grid-cols-2 gap-4">

                {report.aiReport.kraAnalysis.map((k, i) => (
                  <AnalysisCard
                    key={i}
                    title={k.kra}
                    level={k.performanceLevel}
                    text={k.feedback}
                  />
                ))}

              </div>

            </Section>
          )}


          {/* IMPROVEMENTS + ACTIONS */}
          {report.aiReport && (

            <div className="grid md:grid-cols-2 gap-6">

              <InsightCard
                title="Areas for Improvement"
                color="orange"
                items={report.aiReport.improvementAreas}
              />

              <InsightCard
                title="Recommended Actions"
                color="teal"
                items={report.aiReport.recommendedActions}
              />

            </div>

          )}

        </div>


        {/* FOOTER */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-white">

          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-700"
          >
            Close
          </button>

          {/* <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-md hover:bg-teal-700">
            Download Report
          </button> */}

        </div>

      </div>

    </div>
  );
}


/* SECTION WRAPPER */

function Section({ title, children }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="font-semibold text-lg mb-4">{title}</h2>
      {children}
    </div>
  );
}


/* SCORE CARD */

function ScoreCard({ label, value }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm text-center">

      <p className="text-xs text-gray-500">{label}</p>

      <p className="text-xl font-semibold mt-1 text-gray-800">
        {value}
      </p>

    </div>
  );
}


/* ANALYSIS CARD */

function AnalysisCard({ title, level, text }) {

  const badge =
    level === "Strong"
      ? "bg-green-100 text-green-700"
      : level === "Moderate"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-600";

  return (
    <div className="border rounded-xl p-4 bg-gray-50">

      <div className="flex justify-between items-center mb-2">

        <p className="font-medium text-sm">{title}</p>

        <span className={`text-xs px-2 py-1 rounded-full ${badge}`}>
          {level}
        </span>

      </div>

      <p className="text-xs text-gray-600 leading-relaxed">
        {text}
      </p>

    </div>
  );
}


/* INSIGHT CARD */

function InsightCard({ title, items = [], color }) {

  const styles =
    color === "orange"
      ? "bg-orange-50 border-orange-200 text-orange-700"
      : "bg-teal-50 border-teal-200 text-teal-700";

  return (
    <div className={`border p-6 rounded-xl ${styles}`}>

      <h3 className="font-semibold mb-3">{title}</h3>

      <ul className="space-y-2 text-sm list-disc ml-5">

        {items?.map((item, i) => (
          <li key={i}>{item}</li>
        ))}

      </ul>

    </div>
  );
}