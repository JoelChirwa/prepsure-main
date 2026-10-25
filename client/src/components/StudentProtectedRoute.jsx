
import { Navigate, Outlet } from "react-router-dom";
import { useStudentAuth } from "../context/StudentAuthContext";

export default function StudentProtectedRoute() {
    const { student, loading } = useStudentAuth();

    if (loading) {
        return <p className="p-6">Checking your account...</p>;
    }

    if (!student) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
