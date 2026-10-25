import { Navigate } from "react-router-dom";
import { LoaderCircle } from "lucide-react";

import Home from "../pages/Home";
import { useAuth } from "../context/AuthContext";
import { useStudentAuth } from "../context/StudentAuthContext";

export default function HomeRoute() {
  const { user, checking } = useAuth();
  const { student, loading } = useStudentAuth();

  if (checking || loading) {
    return (
      <main
        aria-busy="true"
        className="flex min-h-dvh items-center justify-center bg-[#171916] text-[#B8C39A]"
      >
        <LoaderCircle className="animate-spin" aria-label="Loading account" />
      </main>
    );
  }

  if (user || student) {
    return <Navigate to={user ? "/admin" : "/student"} replace />;
  }

  return <Home />;
}
