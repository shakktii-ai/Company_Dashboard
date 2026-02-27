import { useEffect, useState } from "react";

export default function EmployeeAssessments() {
  const [list, setList] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch("/api/admin/employees/assessments", {
      credentials: "include",
    });

    const data = await res.json();

    if (data.ok) setList(data.list || []);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <div className="max-w-5xl mx-auto">

        <h1 className="text-2xl font-semibold mb-6">
          My Assessments
        </h1>

        {list.length === 0 && (
          <p className="text-gray-500">
            No assessments assigned yet.
          </p>
        )}

        <div className="grid md:grid-cols-2 gap-4">

          {list.map(item => {
            const a = item.assessmentId;

            return (
              <div
                key={item._id}
                className="bg-white border rounded-lg p-4 shadow"
              >
                <h3 className="font-semibold text-lg">
                  {a.title}
                </h3>

                <p className="text-sm text-gray-500">
                  Role: {a.role}
                </p>

                <div className="mt-3">

                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      item.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {item.status}
                  </span>

                </div>

                <a
                  href={`/employee-assessment/${a.slug}`}
                  target="_blank"
                 
                  className="mt-4 inline-block text-blue-600 underline"
                >
                  /employee-assessment/{a.slug}
                </a>

              </div>
            );
          })}

        </div>

      </div>

    </div>
  );
}