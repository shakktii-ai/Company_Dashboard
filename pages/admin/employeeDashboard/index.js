import { useEffect, useState } from "react";
import { FiLogOut } from "react-icons/fi";
import { FaEye } from "react-icons/fa";
import AssessmentsPage from "../../../pages/admin/employeeDashboard/assessments";
import EmployeeReportModal from '../../../components/EmployeeReportModal';
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

            {/* <span className="text-sm text-gray-600 hidden sm:block">
              Role: {user?.role || "Employee"}
            </span> */}
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

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      const res = await fetch("/api/admin/employees/reports");
      const data = await res.json();

      if (data.ok) setReports(data.reports);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading)
    return (
      <div className="text-center py-10 text-gray-500">
        Loading reports...
      </div>
    );

  return (

    <>
      <div className="bg-white rounded-xl shadow p-6">

        <h3 className="text-lg font-semibold mb-6">
          My Assessment Reports
        </h3>

        {reports.length === 0 && (
          <p className="text-gray-500">
            No completed assessments yet.
          </p>
        )}

        <div className="space-y-4">

          {reports.map((r) => (

            <div
              key={r.sessionId}
              className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50"
            >

              <div>

                <p className="font-medium">
                  {r.title}
                </p>

                <p className="text-sm text-gray-500">
                  Role: {r.role}
                </p>

                <p className="text-sm text-gray-500">
                  Completed: {new Date(r.completedAt).toLocaleDateString()}
                </p>

              </div>

              <div className="flex items-center gap-4">

                {/* <span
                  className={`font-semibold ${
                    r.finalScore >= 75
                      ? "text-green-600"
                      : r.finalScore >= 50
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {r.finalScore}%
                </span> */}

                <button
                  onClick={() => setSelectedSession(r.sessionId)}
                  className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800"
                >
                  <FaEye />
                  View
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>


      {/* MODAL OUTSIDE CONTAINER */}

      {selectedSession && (
        <EmployeeReportModal
          sessionId={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}

    </>

  );
}


/* ================= KPI ================= */

function Video() {

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideos();
  }, []);

  async function loadVideos() {

    try {

      const res = await fetch("/api/admin/employees/reports");
      const data = await res.json();

      if (data.ok) {
        setReports(data.reports);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }

  }

  if (loading)
    return (
      <div className="text-center py-10 text-gray-500">
        Loading videos...
      </div>
    );

  return (

    <div className="space-y-6">

      {reports.length === 0 && (
        <div className="bg-white rounded-xl shadow p-6 text-gray-500">
          No videos available yet.
        </div>
      )}

      {reports.map((r) => (

        <div
          key={r.sessionId}
          className="bg-white rounded-xl shadow p-6"
        >

          {/* HEADER */}

          <div className="mb-4">

            <h3 className="font-semibold text-lg">
              {r.role}
            </h3>

            <p className="text-sm text-gray-500">
              Completed: {new Date(r.completedAt).toLocaleDateString()}
            </p>

          </div>


          {/* VIDEOS */}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

            {(r.recommendedVideos || []).map((group, gi) =>

              group.videos.map((v, vi) => (

                <VideoCard
                  key={`${gi}-${vi}`}
                  title={v.title}
                  url={v.url}
                />

              ))

            )}

          </div>

        </div>

      ))}

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
function VideoCard({ title, url }) {

  const videoId = url.includes("watch?v=")
    ? url.split("watch?v=")[1]
    : null;

  const thumbnail = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : null;

  return (

    <div className="border rounded-lg overflow-hidden bg-gray-50 hover:shadow-md transition">

      {thumbnail && (
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-40 object-cover"
        />
      )}

      <div className="p-3">

        <p className="text-sm font-medium line-clamp-2">
          {title}
        </p>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-sm text-indigo-600 hover:text-indigo-800"
        >
          Watch Video →
        </a>

      </div>

    </div>

  );

}