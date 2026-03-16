// import { useEffect, useState } from "react";
// import { FaEye } from "react-icons/fa";
// import EmployeeReportModal from "../components/EmployeeReportModal";

// export default function Report() {
//   const [reports, setReports] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedSession, setSelectedSession] = useState(null);

//   useEffect(() => {
//     loadReports();
//   }, []);

//   async function loadReports() {
//     try {
//       const res = await fetch("/api/admin/employees/reports");
//       const data = await res.json();

//       if (data.ok) {
//         setReports(data.reports);
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   }

//   if (loading) {
//     return (
//       <div className="text-center py-10 text-gray-500">
//         Loading reports...
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="bg-white rounded-xl shadow p-6">
//         <h3 className="text-lg font-semibold mb-6">
//           My Assessment Reports
//         </h3>

//         {reports.length === 0 && (
//           <p className="text-gray-500">
//             No completed assessments yet.
//           </p>
//         )}

//         <div className="space-y-4">
//           {reports.map((r) => (
//             <div
//               key={r.sessionId}
//               className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50"
//             >
//               <div>
//                 <p className="font-medium">{r.title}</p>

//                 <p className="text-sm text-gray-500">
//                   Role: {r.role}
//                 </p>

//                 <p className="text-sm text-gray-500">
//                   Completed: {new Date(r.completedAt).toLocaleDateString()}
//                 </p>
//               </div>

//               <div className="flex items-center gap-4">
//                 {/* Score (optional) */}
//                 {/* 
//                 <span
//                   className={`font-semibold ${
//                     r.finalScore >= 75
//                       ? "text-green-600"
//                       : r.finalScore >= 50
//                       ? "text-yellow-600"
//                       : "text-red-600"
//                   }`}
//                 >
//                   {r.finalScore}%
//                 </span> 
//                 */}

//                 <button
//                   onClick={() => setSelectedSession(r.sessionId)}
//                   className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800"
//                 >
//                   <FaEye />
//                   View
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Report Modal */}
//       {selectedSession && (
//         <EmployeeReportModal
//           sessionId={selectedSession}
//           onClose={() => setSelectedSession(null)}
//         />
//       )}
//     </>
//   );
// }
import { useEffect, useState } from "react";
import { FaEye, FaCalendarAlt, FaFileAlt } from "react-icons/fa";
import EmployeeReportModal from "../components/EmployeeReportModal";

export default function Report() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      const res = await fetch("/api/admin/employees/reports", {
        credentials: "include",
      });

      const data = await res.json();

      if (data.ok) {
        setReports(data.reports || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500">
        Loading reports...
      </div>
    );
  }

  return (
    <>
    
      <div className="bg-white border rounded-xl shadow-sm p-6">

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            My Assessment Reports
          </h2>
          <p className="text-sm text-gray-500">
            View and download your completed assessment reports
          </p>
        </div>

        {reports.length === 0 && (
          <p className="text-gray-500">
            No completed assessments yet.
          </p>
        )}

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-5">

          {reports.map((r) => (
            <div
              key={r.sessionId}
              className="border rounded-xl p-5 flex flex-col justify-between hover:shadow-md transition"
            >

              {/* Top */}
              <div className="flex items-start gap-4">

                {/* Icon */}
                <div className="w-11 h-11 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center">
                  <FaFileAlt />
                </div>

                {/* Info */}
                <div>
                  <p className="font-semibold text-gray-800">
                    {r.title}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Role: {r.role}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                    <FaCalendarAlt className="text-xs" />
                    Completed:{" "}
                    {r.completedAt
                      ? new Date(r.completedAt).toLocaleDateString("en-US")
                      : "N/A"}
                  </div>
                </div>

              </div>

              {/* Button */}
              <button
                onClick={() => setSelectedSession(r.sessionId)}
                className="mt-5 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-md text-sm font-medium transition"
              >
                <FaEye />
                View Report
              </button>

            </div>
          ))}

        </div>
      </div>

      {/* Modal */}
      {selectedSession && (
        <EmployeeReportModal
          sessionId={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </>
  );
}