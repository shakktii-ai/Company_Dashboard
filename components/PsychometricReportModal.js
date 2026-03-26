import { useEffect, useState } from "react";
import axios from "axios";
import { FiX } from "react-icons/fi";
export default function PsychometricReportModal({ resultId, onClose }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!resultId) return;
    console.log("Loading psychometric report for resultId:", resultId);
    async function load() {
      const res = await axios.get(
        `/api/psychometricTests/getResultById?id=${resultId}`
      );
      setData(res.data.result);
    }

    load();
  }, [resultId]);

  if (!data) return null;

  const evaluation = data.results || {};
  const engineScores = evaluation.engine_scores || {};

  // 🔥 SAME mapping as original page
  const competencyAreas = Object.entries(engineScores).map(([key, val]) => ({
    name: `Engine ${key}`,
    rawScore: val.score,
    risk: val.risk_level,
    comments: val.observed_tendencies,
    impact: val.possible_workplace_impact
  }));

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-2">

      <div className="w-full max-w-5xl h-[85vh]  flex flex-col ">
        {/* 🔥 EXACT SAME UI */}
        <div className="bg-white  flex flex-col h-full rounded-2xl">

          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">
              Psychometric Assessment Results
            </h1>
            <div className="flex justify-end mb-2">
              <button
                          onClick={onClose}
                          className="p-2 rounded hover:bg-blue-600 transition"
                        >
                          <FiX size={20} />
                        </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto">

            {/* Overall Risk Score */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Overall Risk Score</h2>

              <div className="bg-gray-50 p-4 rounded-lg">

                <div className="flex justify-between mb-3">
                  <span className="font-medium">Risk Score</span>
                  <span className="font-bold">
                    {evaluation.overall_risk_score || 0}/100
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full"
                    style={{
                      width: `${evaluation.overall_risk_score || 0}%`
                    }}
                  />
                </div>

                <p className="mt-3 text-gray-700">
                  {evaluation.behavioural_stability_category ||
                    "Behaviour profile analysis unavailable"}
                </p>
              </div>
            </div>

            {/* Engine Scores */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                Behavioural Engine Analysis
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                {competencyAreas.map((area, index) => (
                  <div key={index} className="border rounded-lg p-4 shadow-sm">

                    <div className="flex justify-between mb-2">
                      <h3 className="font-semibold">{area.name}</h3>

                      <span
                        className={`px-2 py-1 text-xs rounded-full ${area.risk === "High Risk"
                          ? "bg-red-100 text-red-700"
                          : area.risk === "Moderate Risk"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                          }`}
                      >
                        {area.risk}
                      </span>
                    </div>

                    <div className="mb-2">
                      <div className="text-sm text-gray-500">
                        Score: {area.rawScore}/100
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${area.rawScore}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mt-3">
                      {area.comments}
                    </p>

                    <p className="text-xs text-gray-500 mt-2">
                      Impact: {area.impact}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Key Strengths</h2>
              <div className="bg-green-50 p-4 rounded-lg">
                <ul className="list-disc pl-5 space-y-2">
                  {(evaluation.key_strengths || []).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Risks */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                Potential Risk Signals
              </h2>
              <div className="bg-red-50 p-4 rounded-lg">
                <ul className="list-disc pl-5 space-y-2">
                  {(evaluation.potential_risk_signals || []).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Supervisor Guidance */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                Supervisor Guidance
              </h2>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <ul className="list-disc pl-5 space-y-2">
                  {(Array.isArray(evaluation.supervisor_guidance)
                    ? evaluation.supervisor_guidance
                    : [evaluation.supervisor_guidance]
                  ).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Training */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                Recommended Training
              </h2>
              <div className="bg-blue-50 p-4 rounded-lg">
                <ul className="list-disc pl-5 space-y-2">
                  {(evaluation.recommended_training || []).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Roles */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                Suitable Roles
              </h2>
              <div className="flex flex-wrap gap-2">
                {(evaluation.suitable_roles || []).map((role, i) => (
                  <span
                    key={i}
                    className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

          </div>
          <div className="flex justify-end gap-3 px-4 py-4 border-t bg-white">

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
    </div>
  );
}