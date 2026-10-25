
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FlaskConical,
  GraduationCap,
  Home,
  LifeBuoy,
  LayoutDashboard,
  LogOut,
  MonitorPlay,
  Users,
  UserRound,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useStudentAuth } from "../context/StudentAuthContext";

const studentLinks = [
  { label: "Dashboard", to: "/student", icon: LayoutDashboard, end: true },
  { label: "Experiments", to: "/experiments", icon: FlaskConical },
  { label: "My profile", to: "/profile", icon: UserRound },
];

const adminLinks = [
  { label: "Overview", to: "/admin", icon: LayoutDashboard, end: true },
  { label: "Experiments", to: "/admin/experiments", icon: FlaskConical, end: true },
  { label: "Quizzes", to: "/admin/quizzes", icon: GraduationCap },
  { label: "Simulations", to: "/admin/simulations", icon: MonitorPlay },
  { label: "Users", to: "/admin/users", icon: Users },
  { label: "Feedback", to: "/admin/feedback", icon: LifeBuoy },
];

function SidebarLink({ item }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        [
          "group relative flex items-center gap-3 rounded-lg px-3 py-2.5",
          "text-sm transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#87966A]",
          isActive
            ? "bg-[#E4E9D9] font-semibold text-[#34402A]"
            : "text-[#55584F] hover:bg-[#E6E7DF] hover:text-[#20231D]",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span
              className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-[#748353]"
              aria-hidden="true"
            />
          )}

          <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
          <span>{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar({ role: explicitRole }) {
  const navigate = useNavigate();
  const { user, logout: logoutAdmin } = useAuth();
  const { student, logout: logoutStudent } = useStudentAuth();

  const role =
    explicitRole ?? (user ? "admin" : student ? "student" : null);

  const isAdmin = role === "admin";
  const currentUser = isAdmin ? user : student;
  const links = isAdmin ? adminLinks : studentLinks;

  if (!role || !currentUser) return null;

  function handleLogout() {
    if (isAdmin) {
      logoutAdmin();
    } else {
      logoutStudent();
    }

    navigate("/login", { replace: true });
  }

  return (
    <>
      <aside className="hidden w-[264px] shrink-0 flex-col border-r border-[#D9DACE] bg-[#F0EFE7] text-[#30332C] md:sticky md:top-0 md:flex md:h-screen">
        <div className="flex items-center justify-between px-5 pb-6 pt-6">
          <Link
            to={isAdmin ? "/admin" : "/student"}
            className="flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#87966A]"
          >
            <img
              src="/logo.png"
              alt=""
              className="h-10 w-14 rounded-lg bg-white object-contain p-1"
            />
            <span>
              <span className="block font-heading text-lg font-bold tracking-tight text-[#20231D]">
                PrepSure
              </span>
              <span className="mt-0.5 block text-[10px] font-semibold tracking-[0.12em] text-[#66734F]">
                {isAdmin ? "ADMIN WORKSPACE" : "SCIENCE WORKSPACE"}
              </span>
            </span>
          </Link>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="mx-5 border-t border-[#D9DACE]" />

          <nav
            aria-label={isAdmin ? "Admin navigation" : "Student navigation"}
            className="flex-1 px-3 py-5 md:py-6"
          >
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#85897D]">
              {isAdmin ? "Management" : "Learning"}
            </p>

            <div className="space-y-1">
              {links.map((item) => (
                <SidebarLink key={item.to} item={item} />
              ))}
            </div>
          </nav>

          <div className="border-t border-[#D9DACE] p-4">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#686B62] transition-colors hover:bg-[#F3E5E1] hover:text-[#9A5142] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#87966A]"
            >
              <LogOut size={17} strokeWidth={1.8} />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <nav
        aria-label={isAdmin ? "Admin navigation" : "Student navigation"}
        className="fixed inset-x-0 bottom-0 z-50 grid border-t border-[#D9DACE] bg-[#F0EFE7] pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(32,35,29,0.08)] md:hidden"
        style={{ gridTemplateColumns: `repeat(${links.length}, minmax(0, 1fr))` }}
      >
        {links.map((item) => {
          const isStudentHome = !isAdmin && item.to === "/student";
          const Icon = isStudentHome ? Home : item.icon;
          const label = isStudentHome ? "Home" : item.label;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  "flex min-h-16 flex-col items-center justify-center gap-1 px-1 py-2 text-[10px] font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#87966A]",
                  isActive
                    ? "text-[#34402A]"
                    : "text-[#686B62] hover:text-[#30332C]",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    aria-hidden="true"
                  />
                  <span className="truncate">{label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
