import Link from "next/link";
import { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";

export default function EmployeeAssessmentsAdmin() {

    const [assessments, setAssessments] = useState([]);
    const [employees, setEmployees] = useState([]);

    const [showCreate, setShowCreate] = useState(false);
    const [showAssign, setShowAssign] = useState(false);
    const [editId, setEditId] = useState(null);

    const [expanded, setExpanded] = useState({});

    const [form, setForm] = useState({
        title: "",
        role: "",
        jd: "",
        kpi: "",
        kra: ""
    });

    const [assignForm, setAssignForm] = useState({
        employeeId: "",
        assessmentId: ""
    });

    useEffect(() => {
        loadAssessments();
        loadEmployees();
    }, []);

useEffect(()=>{
  loadAssessments();
  loadEmployees();

  const interval = setInterval(() => {
    loadAssessments();
  }, 5000); // every 5 sec

  return () => clearInterval(interval);

},[]);
    /* ================= LOAD ================= */

    async function loadAssessments() {

        const res = await fetch("/api/admin/employee-assessments", { credentials: "include" });
        const data = await res.json();

        if (data.ok) setAssessments(data.list || []);

    }

    async function loadEmployees() {

        const res = await fetch("/api/admin/employees", { credentials: "include" });
        const data = await res.json();

        if (data.ok) setEmployees(data.employees || []);

    }


    /* ================= CREATE ================= */

    async function handleCreate(e) {

        e.preventDefault();

        const payload = {
            ...form,
            kpi: form.kpi.split(",").map(i => i.trim()),
            kra: form.kra.split(",").map(i => i.trim())
        };

        const url = editId
            ? `/api/admin/employee-assessments/${editId}`
            : "/api/admin/employee-assessments";

        const method = editId ? "PUT" : "POST";

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload)
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
                kra: ""
            });

            loadAssessments();

        }

    }


    /* ================= ASSIGN ================= */

    function openAssign(id) {

        setAssignForm({
            ...assignForm,
            assessmentId: id
        });

        setShowAssign(true);

    }

    async function handleAssign() {

        const res = await fetch("/api/admin/employee-assessments/assign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(assignForm)
        });

        const data = await res.json();

        if (data.ok) {

            alert("Assigned successfully");
            setShowAssign(false);
            loadAssessments();
        }

    }


    /* ================= DELETE ================= */

    async function handleDelete(id) {

        if (!confirm("Archive this assessment?")) return;

        const res = await fetch(`/api/admin/employee-assessments/${id}`, {
            method: "DELETE",
            credentials: "include"
        });

        const data = await res.json();

        if (data.ok) loadAssessments();

    }


    /* ================= EDIT ================= */

    function openEdit(a) {

        setEditId(a._id);

        setForm({
            title: a.title,
            role: a.role,
            jd: a.jd,
            kpi: a.kpi?.join(", "),
            kra: a.kra?.join(", ")
        });

        setShowCreate(true);

    }


    /* ================= TOGGLE EXPAND ================= */

    function toggleExpand(id) {

        setExpanded(prev => ({
            ...prev,
            [id]: !prev[id]
        }));

    }


    /* ================= UI ================= */

    return (

        <div className="min-h-screen bg-gray-50 p-6">

            <div className="max-w-6xl mx-auto">


                {/* HEADER */}

                <div className="flex justify-between items-center mb-6">

                    <div>

                        <h1 className="text-2xl font-bold text-gray-900">
                            Employee Assessment
                        </h1>

                        <p className="text-sm text-gray-500 mt-1">
                            Create and assign internal assessments to employees
                        </p>

                    </div>

                    <button
                        onClick={() => setShowCreate(true)}
                        className="py-2.5 px-5 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition shadow-sm"
                    >
                        + Create Assessment
                    </button>

                </div>



                {/* ================= CARDS ================= */}

                <div className="grid md:grid-cols-2 gap-6">

                    {assessments.map(a => {

                        const isExpanded = expanded[a._id];

                        return (

                            <div
                                key={a._id}
                                className="bg-white rounded-xl border shadow-sm hover:shadow-lg transition flex flex-col h-full"
                            >


                                {/* HEADER */}

                                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4 min-h-[80px]">

                                    <h3 className="font-semibold text-lg leading-tight">
                                        {a.title}
                                    </h3>

                                    <p className="text-sm opacity-90">
                                        Role: {a.role}
                                    </p>

                                </div>



                                {/* CONTENT */}

                                <div className="p-4 space-y-4 flex-grow">


                                    {/* JOB DESCRIPTION */}

                                    {a.jd && (

                                        <div>

                                            <p className="text-xs font-semibold text-gray-500 mb-1">
                                                JOB DESCRIPTION
                                            </p>

                                            <p className={`text-sm text-gray-700 ${isExpanded ? "" : "line-clamp-3"}`}>
                                                {a.jd}
                                            </p>

                                        </div>

                                    )}



                                    {/* KPI */}

                                    {a.kpi?.length > 0 && (

                                        <div>

                                            <p className="text-xs font-semibold text-gray-500 mb-1">
                                                KPI
                                            </p>

                                            <ul className="text-sm text-gray-700 list-disc list-inside">

                                                {(isExpanded ? a.kpi : a.kpi.slice(0, 6)).map((item, i) => (
                                                    <li key={i}>{item}</li>
                                                ))}

                                            </ul>

                                        </div>

                                    )}



                                    {/* KRA */}

                                    {a.kra?.length > 0 && (

                                        <div>

                                            <p className="text-xs font-semibold text-gray-500 mb-1">
                                                KRA
                                            </p>

                                            <ul className="text-sm text-gray-700 list-disc list-inside">

                                                {(isExpanded ? a.kra : a.kra.slice(0, 6)).map((item, i) => (
                                                    <li key={i}>{item}</li>
                                                ))}

                                            </ul>

                                        </div>

                                    )}



                                    {/* READ MORE BUTTON */}

                                    {(a.jd?.length > 300 || a.kpi?.length > 6 || a.kra?.length > 6) && (

                                        <button
                                            onClick={() => toggleExpand(a._id)}
                                            className="text-gray-600 text-sm font-medium hover:underline"
                                        >
                                            {isExpanded ? "Show Less" : "Read More"}
                                        </button>

                                    )}

                                </div>



                                {/* FOOTER */}

                                <div className="border-t p-4 flex gap-3 mt-auto">

                                    <button
                                        onClick={() => openAssign(a._id)}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-md text-sm"
                                    >
                                        Assign
                                    </button>

                                    <button
                                        onClick={() => openEdit(a)}
                                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-md text-sm"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => handleDelete(a._id)}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-md text-sm"
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>

                        );

                    })}

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
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="w-full border p-2 rounded"
                                />

                                <input
                                    placeholder="Role"
                                    value={form.role}
                                    onChange={e => setForm({ ...form, role: e.target.value })}
                                    className="w-full border p-2 rounded"
                                />

                                <textarea
                                    placeholder="Job Description"
                                    value={form.jd}
                                    onChange={e => setForm({ ...form, jd: e.target.value })}
                                    className="w-full border p-2 rounded"
                                />

                                <input
                                    placeholder="KPI (comma separated)"
                                    value={form.kpi}
                                    onChange={e => setForm({ ...form, kpi: e.target.value })}
                                    className="w-full border p-2 rounded"
                                />

                                <input
                                    placeholder="KRA (comma separated)"
                                    value={form.kra}
                                    onChange={e => setForm({ ...form, kra: e.target.value })}
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
                                onChange={e => setAssignForm({ ...assignForm, employeeId: e.target.value })}
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

        </div>

    );

}