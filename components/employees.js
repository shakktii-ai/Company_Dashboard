import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { IoIosArrowBack } from 'react-icons/io'
import Link from "next/link";
import { toast } from 'react-toastify';
import EmployeeReportModal from "../components/EmployeeReportModal";
import PsychometricReportModal from "../components/PsychometricReportModal";
export default function EmployeesPage() {
  const router = useRouter();
  const [selectedPsychometric, setSelectedPsychometric] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeAssessments, setEmployeeAssessments] = useState([]);
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [currentLink, setCurrentLink] = useState(null);
  const [showCreatePsychometric, setShowCreatePsychometric] = useState(false);
  const [links, setLinks] = useState([]);
  const [showAssign, setShowAssign] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [showAssignAllConfirm, setShowAssignAllConfirm] = useState(false);
  const [assignForm, setAssignForm] = useState({
    employeeId: "",
    linkId: ""
  });
  useEffect(() => {
    loadLinks();
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
  async function handleViewEmployee(emp) {
    try {
      setSelectedEmployee(emp);
      setShowViewModal(true);
      setAssessmentLoading(true);

      const res = await fetch(`/api/admin/viewEmpAssessments?employeeId=${emp._id}`, {
        credentials: "include"
      });

      const data = await res.json();

      if (data.ok) {
        console.log("Assessments:", data.assessments);
        setEmployeeAssessments(data.assessments || []);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setAssessmentLoading(false);
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
        toast.error(data.error || "Error creating employee");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating employee");
    }
  }
  const loadLinks = async () => {
    const res = await fetch("/api/psychometricTests");
    const data = await res.json();
    if (data.ok) setLinks(data.links);
    if (data.links.length > 0) {
      setCurrentLink(data.links[0]);
    }
  };
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
      toast.success("Psychometric assigned successfully");
      setShowAssign(false);
    }
  }
  async function confirmAssignAll() {
    if (assigning) return;

    if (!assignForm.linkId) {
      toast.warning("No test link selected");
      return;
    }

    setAssigning(true);

    const toastId = toast.loading("Assigning test to employees...");

    try {
      const res = await fetch("/api/psychometricTests/assignTestToAll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          linkId: assignForm.linkId
        })
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Assignment failed");
      }

      toast.update(toastId, {
        render: `Assigned to ${data.count} employees`,
        type: "success",
        isLoading: false,
        autoClose: 3000
      });

      setShowAssign(false);

    } catch (err) {
      console.error(err);

      toast.update(toastId, {
        render: err.message || "Error assigning",
        type: "error",
        isLoading: false,
        autoClose: 4000
      });

    } finally {
      setAssigning(false);
    }
  }
  function openAssign(linkId) {
    setAssignForm({
      employeeId: "",
      linkId
    });
    setShowCreatePsychometric(false);
    setShowAssign(true);
  }
  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-2">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

          {/* Left Section */}
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              Manage Employee
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              View and manage your organization's employees
            </p>
          </div>

          {/* Right Section */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">

            <button
              onClick={() => setShowCreate(true)}
              className="w-full sm:w-auto py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition shadow-sm flex items-center justify-center gap-2"
            >
              <span className="text-lg leading-none">+</span>
              Add Employee
            </button>

            <button
              onClick={() => setShowCreatePsychometric(true)}
              className="w-full sm:w-auto py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition shadow-sm"
            >
              {currentLink ? "View Link" : "Create Psychometric Test"}
            </button>

          </div>

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
                  <th className="py-2 pr-4">Action</th>

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
                      <button
                        onClick={() => handleViewEmployee(emp)}
                        className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                      >
                        View
                      </button>
                    </td>



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
        {/* CREATE MODAL */}
        {showCreatePsychometric && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">

            {/* Modal Container */}
            <div className="bg-white w-full max-w-md md:max-w-lg rounded-2xl shadow-xl border border-gray-100 flex flex-col max-h-[90vh]">

              {/* Header */}
              <div className="px-5 py-4 border-b">
                <h2 className="text-lg md:text-xl font-semibold">
                  {currentLink ? "Your Psychometric Link" : "Create Psychometric Link"}
                </h2>

                {!currentLink && (
                  <p className="text-sm text-gray-500 mt-1">
                    Generate a test link for candidates.
                  </p>
                )}
              </div>

              {/* Body */}
              <div className="px-5 py-4 overflow-y-auto">

                {/* ✅ SHOW LINK */}
                {currentLink && (
                  <div className="mb-4">

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-gray-50 border rounded-lg p-3">

                      <span className="text-xs break-all flex-1 text-gray-700">
                        {`${window.location.origin}/psychometricTest/${currentLink.slug}/apply`}
                      </span>

                      <button
                        onClick={() => {
                          const url = `${window.location.origin}/psychometricTest/${currentLink.slug}/apply`;
                          navigator.clipboard.writeText(url);
                        }}
                        className="text-xs bg-green-100 hover:bg-green-200 px-3 py-1 rounded font-medium"
                      >
                        Copy
                      </button>

                    </div>

                  </div>
                )}

              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t flex flex-col sm:flex-row gap-2 sm:justify-end">

                <button
                  onClick={() => setShowCreatePsychometric(false)}
                  className="w-full sm:w-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Close
                </button>

                {!currentLink ? (
                  <button
                    onClick={createLink}
                    disabled={loading}
                    className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                  >
                    {loading ? "Creating..." : "Create"}
                  </button>
                ) : (
                  <button
                    onClick={() => openAssign(currentLink._id)}
                    className="w-full sm:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                  >
                    Assign
                  </button>
                )}

              </div>

            </div>
          </div>)}
        {showAssign && (
          <div
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4"
            onClick={() => setShowAssign(false)}
          >

            {/* Modal */}
            <div
              className="bg-white w-full max-w-md md:max-w-lg rounded-2xl shadow-xl flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >

              {/* Header */}
              <div className="px-5 py-4 border-b">
                <h3 className="text-lg md:text-xl font-semibold">
                  Assign Psychometric Test
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Select an employee to assign this test.
                </p>
              </div>

              {/* Body */}
              <div className="px-5 py-4 overflow-y-auto">

                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Employee
                </label>

                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onChange={(e) =>
                    setAssignForm({
                      ...assignForm,
                      employeeId: e.target.value
                    })
                  }
                >
                  <option value="">Select Employee</option>

                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name}
                    </option>
                  ))}
                </select>

              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t flex flex-col sm:flex-row gap-2 sm:justify-between">

                {/* Assign All Button */}


                {/* Right Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end">

                  <button
                    onClick={() => setShowAssign(false)}
                    className="w-full sm:w-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleAssign}
                    disabled={!assignForm.employeeId}
                    className="w-full sm:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
                  >
                    Assign
                  </button>
                  <button
                    onClick={() => { 
                      setShowAssignAllConfirm(true); 
                      setShowAssign(false); 
                    }}
                    disabled={assigning}
                    className="w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                  >
                    {assigning ? 'Assigning...' : 'Assign to All'}
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}
        {showViewModal && (
          <div
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4"
            onClick={() => setShowViewModal(false)}
          >

            {/* Modal */}
            <div
              className="bg-white w-full max-w-md md:max-w-lg lg:max-w-xl rounded-2xl shadow-xl flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >

              {/* Header */}
              <div className="px-5 py-4 border-b flex justify-between items-center">
                <h3 className="text-lg md:text-xl font-semibold truncate">
                  {selectedEmployee?.name} Assessments
                </h3>

                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-lg"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="px-5 py-4 overflow-y-auto">

                {assessmentLoading ? (
                  <p className="text-sm text-gray-500 text-center">
                    Loading assessments...
                  </p>
                ) : employeeAssessments.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center">
                    No assessments assigned
                  </p>
                ) : (

                  <div className="space-y-3">

                    {employeeAssessments.map((ass) => {
                      const isPsychometric = ass.type === "psychometric";

                      return (
                        <div
                          key={ass._id}
                          onClick={() => {
                            if (ass.type === "psychometric") {
                              if (ass.status === "completed") {
                                if (!ass.resultId) {
                                  alert("Result not found");
                                  return;
                                }
                                setSelectedPsychometric(ass.resultId);
                              }
                            } else {
                              if (ass.status === "completed") {
                                setSelectedSession(ass._id);
                              }
                            }
                          }}
                          className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border rounded-lg p-4 transition
                  ${(ass.status === "completed")
                              ? "cursor-pointer hover:shadow-md hover:bg-gray-50"
                              : "opacity-70 cursor-not-allowed"
                            }`}
                        >

                          {/* Left */}
                          <div>
                            <p className="font-medium text-sm md:text-base text-gray-800">
                              {isPsychometric
                                ? "Psychometric Test"
                                : ass?.title || "Assessment"}
                            </p>

                            {/* <p className="text-xs text-gray-400 mt-1">
                    {new Date(ass.createdAt).toLocaleDateString()}
                  </p> */}
                          </div>

                          {/* Status */}
                          <span
                            className={`text-xs px-3 py-1 rounded-full w-fit
                    ${ass.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                              }`}
                          >
                            {ass.status === "completed" ? "Completed" : "Pending"}
                          </span>

                        </div>
                      );
                    })}

                  </div>

                )}

              </div>

            </div>
          </div>
        )}
        {showAssignAllConfirm && (
          <div
            className="fixed inset-0 z-50 bg-black/20 flex items-center justify-center px-4"
            onClick={() => setShowAssignAllConfirm(false)}
          >

            <div
              className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 p-6"
              onClick={(e) => e.stopPropagation()}
            >

              {/* Icon */}


              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Assign to All Employees
              </h3>

              {/* Message */}
              <p className="text-sm text-gray-500 text-center mb-6">
                This will assign the test to{" "}
                <span className="font-medium text-gray-800">
                  {employees.length}
                </span>{" "}
                employees.
              </p>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2">

                <button
                  onClick={() => {
                    setShowAssignAllConfirm(false);
                    setShowAssign(true);

                  }}
                  className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={async () => {
                    setShowAssignAllConfirm(false);
                    await confirmAssignAll();
                  }}
                  disabled={assigning}
                  className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50"
                >
                  {assigning ? "Assigning..." : "Confirm & Assign"}
                </button>

              </div>

            </div>
          </div>
        )}
        {selectedSession && (
          <EmployeeReportModal
            sessionId={selectedSession}
            employeeId={selectedEmployee?._id}
            onClose={() => setSelectedSession(null)}
          />
        )}
        {selectedPsychometric && (
          <PsychometricReportModal
            resultId={selectedPsychometric}
            onClose={() => setSelectedPsychometric(null)}
          />
        )}
      </div>
    </div>

  );
}