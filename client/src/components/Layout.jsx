import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import WorkspaceHeader from "./WorkspaceHeader";

export default function Layout({ role }) {
  return (
    <div
      className={`min-h-screen ${
        role === "student" ? "bg-[#F7F7F2]" : "bg-slate-50"
      } md:flex`}
    >
      <Sidebar role={role} />
      <div className="min-w-0 flex-1">
        <WorkspaceHeader role={role} />
        <main className="min-w-0 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
