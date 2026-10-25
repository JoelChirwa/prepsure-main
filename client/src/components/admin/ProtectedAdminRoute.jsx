
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedAdminRoute() {
    const { token, user, checking } = useAuth();

    if (checking) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-sm text-muted-foreground">
                    Checking administrator access...
                </p>
            </div>
        );
    }

    if (!token || !user || user.role !== "admin") {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
