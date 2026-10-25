
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { adminApi } from "../lib/adminApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(
        () => sessionStorage.getItem("prepsure_admin_token")
    );
    const [user, setUser] = useState(null);
    const [checking, setChecking] = useState(true);

    const logout = useCallback(() => {
        sessionStorage.removeItem("prepsure_admin_token");
        setToken(null);
        setUser(null);
    }, []);

    useEffect(() => {
        const handleUnauthorized = () => logout();

        window.addEventListener("prepsure:unauthorized", handleUnauthorized);

        return () =>
            window.removeEventListener(
                "prepsure:unauthorized",
                handleUnauthorized
            );
    }, [logout]);

    useEffect(() => {
        let active = true;

        async function checkSession() {
            if (!token) {
                setUser(null);
                setChecking(false);
                return;
            }

            try {
                const data = await adminApi.me(token);

                if (active) {
                    if (data.user.role !== "admin") {
                        logout();
                    } else {
                        setUser(data.user);
                    }
                }
            } catch {
                if (active) logout();
            } finally {
                if (active) setChecking(false);
            }
        }

        setChecking(true);
        checkSession();

        return () => {
            active = false;
        };
    }, [token, logout]);

    const acceptLoginResponse = (data) => {
        if (!data.token || data.user?.role !== "admin") {
            throw new Error("This account does not have administrator access.");
        }

        sessionStorage.setItem("prepsure_admin_token", data.token);
        setToken(data.token);
        setUser(data.user);
    };

    return (
        <AuthContext.Provider
            value={{ token, user, checking, acceptLoginResponse, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}
