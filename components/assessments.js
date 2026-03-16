import { useEffect, useState } from "react";
import EmployeeReportModal from "../components/EmployeeReportModal";
import { FiArrowRight, FiClipboard, FiCheckCircle, FiClock } from "react-icons/fi";
import { FaClock, FaCalendarAlt } from "react-icons/fa";

export default function EmployeeAssessments() {


  const [selectedSession, setSelectedSession] = useState(null);
  const [list, setList] = useState([]);
  const total = list.length;

  const completed = list.filter(
    (item) => item.status === "completed"
  ).length;

  const pending = list.filter(
    (item) => item.status === "pending"
  ).length;
  useEffect(() => {
    load();
  }, []);

  async function load() {

    const res = await fetch("/api/admin/employees/assessments", {
      credentials: "include",
       cache: "no-store"
    });

    const data = await res.json();

    if (data.ok) setList(data.list || []);
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-4">

        <StatCard
          title="Total Assessments"
          value={total}
          icon={<FiClipboard />}
        />

        <StatCard
          title="Completed"
          value={completed}
          icon={<FiCheckCircle />}
          color="green"
        />

        <StatCard
          title="Pending"
          value={pending}
          icon={<FiClock />}
          color="yellow"
        />

      </div>

      <div className="bg-white rounded-xl shadow border p-6">

        {/* HEADER */}
        <div className="mb-6">

          <h2 className="text-xl font-semibold">
            My Assessments
          </h2>

          <p className="text-sm text-gray-500">
            Track and manage your performance evaluations
          </p>

        </div>

        {/* EMPTY */}
        {list.length === 0 && (
          <p className="text-gray-500">
            No assessments assigned yet.
          </p>
        )}

        {/* LIST */}
        <div className="space-y-4">

          {list.map(item => {

            const a = item.assessmentId;

            return (

              <div
                key={item._id}
                className="flex flex-col md:flex-row md:items-center md:justify-between border rounded-lg p-4 hover:shadow-sm transition"
              >

                {/* LEFT CONTENT */}
                <div>

                  <div className="flex items-center gap-3">

                    <h3 className="font-semibold text-gray-800">
                      {a.title}
                    </h3>

                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium
                    ${item.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                      {item.status}
                    </span>

                  </div>

                  <p className="text-sm text-gray-500 mt-1">
                    Role: {a.role}
                  </p>

                  {/* META INFO */}
                  <div className="flex items-center gap-6 mt-2 text-sm text-gray-500">

                    {item.status === "completed" && (
                      <>
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-xs" />
                          <span>
                            Completed: {new Date(item.completedAt).toLocaleDateString()}
                          </span>
                        </div>

                        <span>
                          Score: {item.latestScore ?? "Available in report"}
                        </span>
                      </>
                    )}



                  </div>
                </div>

                {/* RIGHT BUTTON */}

                <div className="mt-4 md:mt-0">

                  {item.status === "pending" && (

                    <button
                      onClick={() =>
                        window.location.href = `/interviewLink/${a.slug}`
                      }
                      className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
                    >
                      Start Assessment
                      <FiArrowRight />
                    </button>

                  )}

                  {/* {item.status === "completed" && (

                    <button
                      onClick={() => setSelectedSession(item._id)}
                      className="flex items-center gap-2 border border-teal-600 text-teal-600 hover:bg-teal-50 px-4 py-2 rounded-md text-sm font-medium transition"
                    >
                      View Details
                      <FiArrowRight />
                    </button>

                  )} */}

                </div>
              </div>

            );

          })}

        </div>

      </div>
        {/* REPORT MODAL */}
    {selectedSession && (
      <EmployeeReportModal
        sessionId={selectedSession}
        onClose={() => setSelectedSession(null)}
      />
    )}
    </>
    
  );

}


function StatCard({ title, value, icon, color = "teal" }) {
  return (
    <div className="bg-white border rounded-xl shadow-sm p-5 flex items-center justify-between hover:shadow-md transition">

      {/* Left Content */}
      <div>
        <p className="text-sm text-gray-500">{title}</p>

        <p className="text-2xl font-bold text-gray-800 mt-1">
          {value}
        </p>
      </div>

      {/* Icon */}
      {icon && (
        <div
          className={`w-10 h-10 flex items-center justify-center rounded-lg bg-${color}-100 text-${color}-600`}
        >
          {icon}
        </div>
      )}

    </div>
  );
}

