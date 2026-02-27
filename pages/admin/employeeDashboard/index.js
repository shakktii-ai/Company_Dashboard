import { useEffect, useState } from "react";
import { FiLogOut } from "react-icons/fi";
import AssessmentsPage from "../../../pages/admin/employeeDashboard/assessments";
import { useRouter } from "next/router";
export default function EmployeeDashboard() {
    const router=useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("assessments");
const [loggingOut, setLoggingOut] = useState(false);
  useEffect(() => {
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");

    setUser({
      role,
      userId,
    });
  }, []);
async function handleLogout() {
    try {
      setLoggingOut(true);
      const res = await window.fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        router.push("/admin/login");
      }
    } catch (err) {
      console.error("logout error", err);
      setLoggingOut(false);
    }
  }
  return (
    <div className="min-h-screen bg-gray-100">

      {/* ================= TOP NAV ================= */}
      <header className="bg-white shadow">

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">

          {/* LEFT NAV */}
          <div className="flex items-center gap-6">

            <h2 className="text-lg font-semibold text-indigo-600">
              Employee Panel
            </h2>

            <nav className="hidden md:flex items-center gap-4 text-sm">

              

              <NavItem
                label="Assessments"
                active={activeTab === "assessments"}
                onClick={() => setActiveTab("assessments")}
              />
              <NavItem
                label="Report"
                active={activeTab === "report"}
                onClick={() => setActiveTab("report")}
              />

              <NavItem
                label="Video"
                active={activeTab === "video"}
                onClick={() => setActiveTab("video")}
              />

            </nav>

          </div>


          {/* RIGHT NAV */}
          <div className="flex items-center gap-4">

            <span className="text-sm text-gray-600 hidden sm:block">
              Role: {user?.role || "Employee"}
            </span>
            <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          Logout
        </button>
           

          </div>

        </div>


        {/* MOBILE NAV */}
        <div className="md:hidden border-t px-4 py-2 flex gap-2 overflow-x-auto">

         

          <NavItem
            label="Assessments"
            active={activeTab === "assessments"}
            onClick={() => setActiveTab("assessments")}
          />
           <NavItem
            label="Report"
            active={activeTab === "report"}
            onClick={() => setActiveTab("report")}
          />

          <NavItem
            label="Video"
            active={activeTab === "video"}
            onClick={() => setActiveTab("video")}
          />

        </div>

      </header>



      {/* ================= CONTENT ================= */}
      <main className="max-w-7xl mx-auto p-4 md:p-6">

       
        {activeTab === "assessments" && <AssessmentsPage />}
 {activeTab === "report" && <Report />}
        {activeTab === "video" && <Video />}
      </main>

    </div>
  );
}



/* ================= Report ================= */

function Report() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

      <h3 className="text-lg font-semibold mb-4">
        My Reports
      </h3>

    </div>
  );
}



/* ================= KPI ================= */

function Video() {
  return (
    <div className="bg-white rounded-xl shadow p-6">

      <h3 className="text-lg font-semibold mb-4">
        Video Recommentation
      </h3>

      

    </div>
  );
}



/* ================= COMPONENTS ================= */

function NavItem({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-md text-sm whitespace-nowrap ${
        active
          ? "bg-indigo-50 text-indigo-600 font-medium"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}