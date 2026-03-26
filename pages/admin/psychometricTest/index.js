import { useState, useEffect } from "react";

export default function PsychometricTest() {
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [currentLink, setCurrentLink] = useState(null);
    const [showAssign, setShowAssign] = useState(false);
    const [employees,setEmployees]=useState([]);
    const [assignForm, setAssignForm] = useState({
        employeeId: "",
        linkId: ""
    });
    useEffect(() => {
        loadLinks();
        loadEmployees();
    }, []);

    const loadLinks = async () => {
        const res = await fetch("/api/psychometricTests");
        const data = await res.json();
        if (data.ok) setLinks(data.links);
        if (data.links.length > 0) {
            setCurrentLink(data.links[0]);
        }
    };
 async function loadEmployees() {

        const res = await fetch("/api/admin/employees", { credentials: "include" });
        const data = await res.json();

        if (data.ok) setEmployees(data.employees || []);

    }
    //  CREATE LINK (with loading protection)
    const createLink = async () => {
        if (loading) return; 

        setLoading(true);
        try {
            const res = await fetch("/api/psychometricTests", {
                method: "POST",
            });

            const data = await res.json();

            if (data.ok) {
                setCurrentLink(data.link);
                loadLinks();
                // setShowCreate(false);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // ✅ TOGGLE ACTIVE
    const toggleActive = async (id, current) => {
        await fetch(`/api/psychometricTests/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: !current }),
        });

        loadLinks();
    };
    async function handleAssign() {

        const res = await fetch("/api/psychometricTests/assignTest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                employeeId: assignForm.employeeId,
                linkId: assignForm.linkId
            })
        });

        const data = await res.json();

        if (data.ok) {
            alert("Psychometric assigned successfully");
            setShowAssign(false);
        }
    }
    function openAssign(linkId) {
        setAssignForm({
            employeeId: "",
            linkId
        });
        setShowAssign(true);
    }
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-5xl mx-auto">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Psychometric Test
                        </h1>
                        <p className="text-sm text-gray-500">
                            Manage your psychometric test links
                        </p>
                    </div>

                    <button
                        onClick={() => setShowCreate(true)}
                        className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
                    >
                        {currentLink ? "View Link" : "+ Create Link"}
                    </button>
                </div>

                {/* LINKS LIST */}
                <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {links.length === 0 && (
                        <div className="text-center text-gray-400 py-10">
                            No links created yet
                        </div>
                    )}

                    {links.map((link) => (
                        <div
                            key={link._id}
                            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-4"
                        >
                            {/* HEADER */}
                            <div className="flex justify-between items-center mb-4">
                                {/* STATUS */}
                                <div className="mt-3 text-[10px] font-semibold">
                                    {" "}
                                    <span className={link.isActive ? "text-green-600" : "text-red-500"}>
                                        {link.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>

                                {/* TOGGLE */}
                                <button
                                    onClick={() => toggleActive(link._id, link.isActive)}
                                    className={`relative w-10 h-5 rounded-full transition ${link.isActive ? "bg-green-500" : "bg-gray-300"
                                        }`}
                                >
                                    <span
                                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition ${link.isActive ? "left-5" : "left-1"
                                            }`}
                                    />
                                </button>
                            </div>

                            {/* LINK BOX (SAME AS INTERVIEW) */}
                            <div className="flex items-center gap-2">
                                <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 overflow-hidden">
                                    <span className="flex-1 text-[10px] text-gray-500 font-medium truncate mr-2 italic">
                                        {`${typeof window !== "undefined" ? window.location.host : ""}/psychometricTest/${link.slug}/apply`}
                                    </span>

                                    <button
                                        onClick={() => {
                                            const url = `${window.location.origin}/psychometricTest/${link.slug}/apply`;
                                            navigator.clipboard.writeText(url);
                                        }}
                                        className="shrink-0 py-1.5 px-3 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold hover:bg-emerald-100 transition active:scale-95 flex items-center gap-1.5 border border-emerald-100"
                                    >
                                        Copy Link
                                    </button>
                                </div>
                            </div>


                        </div>
                    ))}</div>

                {/* CREATE MODAL */}
                {showCreate && (
                    <div className="fixed inset-0 bg-black/20 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-xl w-[420px]">

                            <h2 className="text-lg font-bold mb-4">
                                {currentLink ? "Your Psychometric Link" : "Create Psychometric Link"}
                            </h2>

                            {!currentLink && (
                                <p className="text-sm text-gray-500 mb-6">
                                    Generate a test link for candidates.
                                </p>
                            )}

                            {/* ✅ SHOW LINK AFTER CREATE */}
                            {currentLink && (
                                <div className="mb-6">
                                    <div className="flex items-center bg-gray-50 border rounded-lg px-3 py-2">
                                        <span className="text-xs truncate flex-1">
                                            {`${window.location.origin}/psychometricTest/${currentLink.slug}/apply`}
                                        </span>

                                        <button
                                            onClick={() => {
                                                const url = `${window.location.origin}/psychometricTest/${currentLink.slug}/apply`;
                                                navigator.clipboard.writeText(url);
                                            }}
                                            className="ml-2 text-xs bg-green-100 px-2 py-1 rounded"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-3">

                                <button
                                    onClick={() => setShowCreate(false)}
                                    className="px-4 py-2 bg-gray-100 rounded"
                                >
                                    Close
                                </button>

                                {!currentLink ? (
                                    <button
                                        onClick={createLink}
                                        disabled={loading}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded"
                                    >
                                        {loading ? "Creating..." : "Create"}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => openAssign(currentLink._id)}
                                        className="px-4 py-2 bg-green-600 text-white rounded"
                                    >
                                        Assign
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {showAssign && (
                    <div className="fixed inset-0 bg-black/20 flex items-center justify-center">

                        <div className="bg-white p-6 rounded-lg w-[420px]">

                            <h3 className="text-lg font-semibold mb-4">
                                Assign Psychometric Test
                            </h3>

                            <select
                                className="w-full border p-2 mb-3"
                                onChange={e =>
                                    setAssignForm({
                                        ...assignForm,
                                        employeeId: e.target.value
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
                                    className="px-4 py-2 bg-green-600 text-white rounded"
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