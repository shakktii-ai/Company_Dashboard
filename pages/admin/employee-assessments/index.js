import Link from "next/link";
import { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
export default function EmployeeAssessmentsAdmin() {
    const [assessments, setAssessments] = useState([]);
    const [employees, setEmployees] = useState([]);

    const [showCreate, setShowCreate] = useState(false);
    const [showAssign, setShowAssign] = useState(false);
    const [editId, setEditId] = useState(null);
    const [selectedAssessment, setSelectedAssessment] = useState(null);

    const [form, setForm] = useState({
        title: "",
        role: "",
        jd: "",
        kpi: "",
        kra: "",
    });

    const [assignForm, setAssignForm] = useState({
        employeeId: "",
        assessmentId: "",
    });

    useEffect(() => {
        loadAssessments();
        loadEmployees();
    }, []);

    // ================= LOAD =================

    async function loadAssessments() {
        const res = await fetch("/api/admin/employee-assessments", {
            credentials: "include",
        });

        const data = await res.json();

        if (data.ok) setAssessments(data.list || []);
    }

    async function loadEmployees() {
        const res = await fetch("/api/admin/employees", {
            credentials: "include",
        });

        const data = await res.json();

        if (data.ok) setEmployees(data.employees || []);
    }

    // ================= CREATE =================

    async function handleCreate(e) {
        e.preventDefault();

        const payload = {
            ...form,
            kpi: form.kpi.split(",").map(i => i.trim()),
            kra: form.kra.split(",").map(i => i.trim()),
        };

        const url = editId
            ? `/api/admin/employee-assessments/${editId}`
            : "/api/admin/employee-assessments";

        const method = editId ? "PUT" : "POST";

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (data.ok) {
            setShowCreate(false);
            setEditId(null);

            setForm({
                title: "",
                role: "",
                jd: "",
                kpi: "",
                kra: "",
            });

            loadAssessments();
        }
    }
    // ================= ASSIGN =================

    function openAssign(assessmentId) {
        setSelectedAssessment(assessmentId);
        setAssignForm({
            ...assignForm,
            assessmentId,
        });
        setShowAssign(true);
    }

    async function handleAssign() {
        const res = await fetch(
            "/api/admin/employee-assessments/assign",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(assignForm),
            }
        );

        const data = await res.json();

        if (data.ok) {
            alert("Assigned successfully");
            setShowAssign(false);
        }
    }
    async function handleDelete(id) {
        if (!confirm("Archive this assessment?")) return;

        const res = await fetch(
            `/api/admin/employee-assessments/${id}`,
            {
                method: "DELETE",
                credentials: "include",
            }
        );

        const data = await res.json();

        if (data.ok) {
            loadAssessments();
        }
    }
    function openEdit(assessment) {
        setEditId(assessment._id);

        setForm({
            title: assessment.title,
            role: assessment.role,
            jd: assessment.jd,
            kpi: assessment.kpi?.join(", "),
            kra: assessment.kra?.join(", "),
        });

        setShowCreate(true);
    }
    return (
        <div className="min-h-screen bg-gray-50 p-6">

            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

  {/* Left */}
  <div className="flex items-start gap-3">

    <Link
      href="/admin"
      className="p-2 rounded-md border bg-white hover:bg-gray-100 shadow-sm"
    >
      <IoIosArrowBack size={18} />
    </Link>

    <div>
      <h1 className="text-xl sm:text-2xl font-semibold">
        Employee Assessments
      </h1>
      <p className="text-sm text-gray-600">
        Create and assign internal assessments to employees.
      </p>
    </div>

  </div>

  {/* Right */}
  <button
    onClick={() => setShowCreate(true)}
    className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700"
  >
    + Create Assessment
  </button>

</div>
                {/* Assessment List */}
                <div className="grid md:grid-cols-2 gap-4">

                    {assessments.map(a => (
                        <div
                            key={a._id}
                            className="bg-white border rounded-lg p-4 shadow"
                        >
                            <h3 className="font-semibold">
                                {a.title}
                            </h3>

                            <p className="text-sm text-gray-500">
                                Role: {a.role}
                            </p>
                            {a.jd && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700">
                                        Job Description:
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {a.jd}
                                    </p>
                                </div>
                            )}
                            {a.kpi?.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700">
                                        KPI:
                                    </p>
                                    <ul className="list-disc list-inside text-sm text-gray-600">
                                        {a.kpi.map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {a.kra?.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700">
                                        KRA:
                                    </p>
                                    <ul className="list-disc list-inside text-sm text-gray-600">
                                        {a.kra.map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="mt-3 flex gap-2">

                                <button
                                    onClick={() => openAssign(a._id)}
                                    className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                                >
                                    Assign
                                </button>

                                <button
                                    onClick={() => openEdit(a)}
                                    className="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() => handleDelete(a._id)}
                                    className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                                >
                                    Delete
                                </button>

                            </div>
                        </div>
                    ))}

                </div>

            </div>

            {/* ================= CREATE MODAL ================= */}

            {showCreate && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

                    <div className="bg-white p-6 rounded-lg w-96">

                        <h3 className="text-lg font-semibold mb-4">
                            {editId ? "Edit Assessment" : "Create Assessment"}
                        </h3>

                        <form onSubmit={handleCreate} className="space-y-3">

                            <input
                                placeholder="Title"
                                value={form.title}
                                onChange={e =>
                                    setForm({ ...form, title: e.target.value })
                                }
                                className="w-full border p-2 rounded"
                            />

                            <input
                                placeholder="Role"
                                value={form.role}
                                onChange={e =>
                                    setForm({ ...form, role: e.target.value })
                                }
                                className="w-full border p-2 rounded"
                            />

                            <textarea
                                placeholder="Job Description"
                                value={form.jd}
                                onChange={e =>
                                    setForm({ ...form, jd: e.target.value })
                                }
                                className="w-full border p-2 rounded"
                            />

                            <input
                                placeholder="KPI (comma separated)"
                                value={form.kpi}
                                onChange={e =>
                                    setForm({ ...form, kpi: e.target.value })
                                }
                                className="w-full border p-2 rounded"
                            />

                            <input
                                placeholder="KRA (comma separated)"
                                value={form.kra}
                                onChange={e =>
                                    setForm({ ...form, kra: e.target.value })
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

            {/* ================= ASSIGN MODAL ================= */}

            {showAssign && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

                    <div className="bg-white p-6 rounded-lg w-96">

                        <h3 className="text-lg font-semibold mb-4">
                            Assign to Employee
                        </h3>

                        <select
                            className="w-full border p-2 mb-3"
                            onChange={e =>
                                setAssignForm({
                                    ...assignForm,
                                    employeeId: e.target.value,
                                })
                            }
                        >
                            <option>Select Employee</option>

                            {employees.map(emp => (
                                <option key={emp._id} value={emp._id}>
                                    {emp.name}
                                </option>
                            ))}
                        </select>

                        <div className="flex justify-end gap-2">

                            <button
                                onClick={() => setShowAssign(false)}
                                className="px-4 py-2 bg-gray-200 rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleAssign}
                                className="px-4 py-2 bg-indigo-600 text-white rounded"
                            >
                                Assign
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}