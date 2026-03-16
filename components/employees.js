import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { IoIosArrowBack } from 'react-icons/io'
import Link from "next/link";

export default function EmployeesPage() {
  const router = useRouter();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showCreate, setShowCreate] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/employees", {
        credentials: "include",
      });

      const data = await res.json();

      if (data.ok) {
        // Remove company owner (admin role)
        const onlyEmployees = (data.employees || []).filter(
          (u) => u.role !== "admin"
        );

        setEmployees(onlyEmployees);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();

    try {
      const res = await fetch("/api/admin/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      });

      const data = await res.json();

      if (data.ok) {
        setShowCreate(false);

        setForm({
          name: "",
          email: "",
          password: "",
          role: "",
        });

        loadEmployees();
      } else {
        alert(data.error || "Error creating employee");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating employee");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-2">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Employee</h1>
            <p className="text-sm text-gray-500 mt-1">View and manage your organization's employee</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="py-2.5 px-5 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition shadow-sm flex items-center justify-center gap-2"
          >
            <span>+</span> Add Employee
          </button>
        </div>

        {/* Employee Table */}
        <div className="bg-white rounded-lg shadow p-4">

          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium">
              Employee List
            </h3>

            <div className="text-sm text-gray-500">
              {loading ? "Loading..." : `${employees.length} employees`}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">

              <thead>
                <tr className="text-left text-xs text-gray-500">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2 pr-4">Status</th>

                </tr>
              </thead>

              <tbody>
                {employees.map((emp) => (
                  <tr key={emp._id} className="border-t">

                    <td className="py-3 pr-4 font-medium">
                      {emp.name}
                    </td>

                    <td className="py-3 pr-4">
                      {emp.email}
                    </td>

                    <td className="py-3 pr-4">
                      {emp.role || "Not Assigned"}
                    </td>

                    {/* Status */}
                    <td className="py-3 pr-4">
                      <span className="px-2 py-1 rounded-full text-xs bg-green-50 text-green-700">
                        Active
                      </span>
                    </td>

                    {/* Culture Interview */}
                    {/* <td className="py-3 pr-4">
                                                    {emp.cultureInterviewCompleted ? (
                                                        <span className="text-green-600 text-xs">
                                                            Completed
                                                        </span>
                                                    ) : (
                                                        <span className="text-yellow-600 text-xs">
                                                            Pending
                                                        </span>
                                                    )}
                                                </td> */}

                  </tr>
                ))}

                {employees.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-6 text-center text-gray-400"
                    >
                      No employees added yet
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>
        </div>

        {/* Create Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">

            <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">

              <h3 className="text-lg font-semibold mb-4">
                Add Employee
              </h3>

              <form onSubmit={handleCreate} className="space-y-3">

                <input
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                  required
                />

                <input
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                  required
                />

                <input
                  placeholder="Password"
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                  required
                />

                <input
                  placeholder="Role (Frontend Dev, HR...)"
                  value={form.role}
                  onChange={(e) =>
                    setForm({ ...form, role: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                />

                <div className="flex justify-end gap-2 pt-3">

                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="px-4 py-2 bg-gray-200 rounded"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded"
                  >
                    Create
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}