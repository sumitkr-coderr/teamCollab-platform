import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Bell,
  Menu,
  X,
} from "lucide-react";

const Sidebar = () => {
  const [open, setOpen] = useState(false);

  const navItem = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
      isActive
        ? "bg-slate-700 text-white"
        : "hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <>
      {/* Mobile Topbar Button */}
      <div className="md:hidden flex items-center p-4 bg-slate-900 text-white">
        <button onClick={() => setOpen(true)}>
          <Menu size={24} />
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed md:relative top-0 left-0 z-50 h-full w-64 bg-slate-900 text-gray-300 p-6 transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0`}
      >
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-bold text-white">🚀 TeamCollab</h2>
          <button
            className="md:hidden"
            onClick={() => setOpen(false)}
          >
            <X size={22} />
          </button>
        </div>

        <nav className="flex flex-col gap-2">
          <NavLink to="" className={navItem}>
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>

          <NavLink to="teams" className={navItem}>
            <Users size={18} />
            Teams
          </NavLink>

          <NavLink to="mytasks" className={navItem}>
            <FolderKanban size={18} />
            MyTasks
          </NavLink>

          <NavLink to="notifications" className={navItem}>
            <Bell size={18} />
            Notifications
          </NavLink>
        </nav>

        <div className="mt-auto pt-10 text-xs text-gray-500">
          © 2026 Team Collab
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
