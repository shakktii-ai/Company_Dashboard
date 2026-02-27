import Link from "next/link";
import { useRouter } from "next/router";
import { FiUser, FiBarChart2, FiTarget, FiClipboard, FiLogOut, FiMenu } from "react-icons/fi";
import { useState } from "react";

export default function EmployeeLayout({ children }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menu = [
    {
      label: "Overview",
      icon: <FiBarChart2 />,
      href: "/admin/employeeDashboard",
    },
    {
      label: "My KPIs",
      icon: <FiTarget />,
      href: "/admin/employeeDashboard/kpi",
    },
    {
      label: "Assessments",
      icon: <FiClipboard />,
      href: "/admin/employeeDashboard/assessments",
    },
    {
      label: "Profile",
      icon: <FiUser />,
      href: "/admin/employeeDashboard/profile",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static z-50 top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0`}
      >
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-indigo-600">
            Employee Panel
          </h2>
        </div>

        <nav className="p-4 space-y-2 text-sm">
          {menu.map((item) => {
            const active = router.pathname === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer ${
                    active
                      ? "bg-indigo-50 text-indigo-600 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <button className="flex items-center gap-2 text-sm text-red-600">
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>


      {/* Main */}
      <div className="flex-1 flex flex-col">

        {/* Topbar */}
        <header className="bg-white shadow px-4 md:px-6 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <button
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <FiMenu size={22} />
            </button>

            <h1 className="text-lg font-semibold">
              Employee Dashboard
            </h1>
          </div>

          <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center">
            E
          </div>

        </header>

        <main className="p-4 md:p-6">
          {children}
        </main>

      </div>
    </div>
  );
}