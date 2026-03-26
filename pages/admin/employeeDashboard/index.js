import { useEffect, useState } from "react";
import {
  FiLogOut,
  FiFileText,
  FiVideo,
  FiClipboard,
  FiMenu,
  FiX
} from "react-icons/fi";
import { FaBell } from "react-icons/fa";
import AssessmentsPage from "../../../components/assessments";
import Video from "@/components/EmployeeVideoPage";
import Report from "@/components/EmployeeReportPage";
import { useRouter } from "next/router";

export default function EmployeeDashboard() {

  const router = useRouter();

  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("assessments");
  const [loggingOut, setLoggingOut] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pageTitle = {
    assessments: "My Assessments",
    report: "Reports",
    video: "Video Resources"
  };
  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {

    try {

      const res = await fetch("/api/admin/employees/me", {
        credentials: "include"
      });

      const data = await res.json();

      if (data.ok) {
        setUser(data.user);
      }

    } catch (err) {
      console.log(err);
    }

  }

  async function handleLogout() {

    try {

      setLoggingOut(true);

      const res = await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include"
      });

      if (res.ok) {
        router.push("/admin/login");
      }

    } catch (err) {
      console.log(err);
      setLoggingOut(false);
    }

  }

  return (

    <div className="flex min-h-screen bg-gray-100">

      {/* MOBILE OVERLAY*/}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`
  fixed md:relative
  top-0 left-0
  h-full md:h-auto
  w-64
  bg-teal-700 text-white
  flex flex-col justify-between
  transform transition-transform duration-300
  z-50
  ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
  md:translate-x-0
`}
      >

        <div>

          {/* Logo */}
          <div className="p-6 border-b border-teal-600 flex justify-between items-center">

            <div>
              <h1 className="text-xl font-semibold">Employee Hub</h1>
              <p className="text-sm text-teal-200">Performance Portal</p>
            </div>

            <button
              className="md:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <FiX size={22} />
            </button>

          </div>

          {/* Navigation */}

          <nav className="mt-6 space-y-2 px-3">

            <SidebarItem
              icon={<FiClipboard />}
              label="My Assessments"
              active={activeTab === "assessments"}
              onClick={() => {
                setActiveTab("assessments")
                setSidebarOpen(false)
              }}
            />

            <SidebarItem
              icon={<FiFileText />}
              label="Reports"
              active={activeTab === "report"}
              onClick={() => {
                setActiveTab("report")
                setSidebarOpen(false)
              }}
            />

            <SidebarItem
              icon={<FiVideo />}
              label="Video Resources"
              active={activeTab === "video"}
              onClick={() => {
                setActiveTab("video")
                setSidebarOpen(false)
              }}
            />
            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm text-teal-100 hover:bg-red-600 hover:text-white transition"
            >
              <FiLogOut />
              Logout
            </button>
          </nav>
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm px-4 md:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* BURGER MENU */}
            <button
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <FiMenu size={24} />
            </button>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {pageTitle[activeTab]}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-teal-600 rounded-full flex items-center justify-center text-white">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="">
                <p className="text-sm font-medium">
                  {user?.name || "Employee"}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role || ""}
                </p>
              </div>
            </div>
          </div>
        </header>
        <main className="p-4 md:p-6 space-y-6">
          <div className="bg-white rounded-xl shadow p-4">
            {activeTab === "assessments" && <AssessmentsPage />}
            {activeTab === "report" && <Report />}
            {activeTab === "video" && <Video />}
          </div>
        </main>
      </div>
    </div>
  );
}



/* ================= COMPONENTS ================= */

function SidebarItem({ icon, label, active, onClick }) {

  return (

    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm transition
    ${active
          ? "bg-white text-teal-700 font-medium"
          : "text-teal-100 hover:bg-teal-600"
        }`}
    >

      {icon}
      {label}

    </button>

  )
}



