
import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";
import { studentApi } from "../lib/studentApi";

const StudentAuthContext = createContext(null);
const TOKEN_KEY = "prepsure_student_token";

export function StudentAuthProvider({ children }) {
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        async function loadStudent() {
            const token = sessionStorage.getItem(TOKEN_KEY);

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const data = await studentApi.me(token);
                const currentUser = data.user || data;

                if (currentUser.role !== "student") {
                    throw new Error("This account is not a student account.");
                }

                if (active) setStudent(currentUser);
            } catch {
                sessionStorage.removeItem(TOKEN_KEY);
                if (active) setStudent(null);
            } finally {
                if (active) setLoading(false);
            }
        }

        loadStudent();

        return () => {
            active = false;
        };
    }, []);

    function acceptLoginResponse(data) {
        if (!data.token || data.user?.role !== "student") {
            throw new Error("This account does not have student access.");
        }

        sessionStorage.setItem(TOKEN_KEY, data.token);
        setStudent(data.user);
        return data;
    }

    async function login(credentials) {
        const data = await studentApi.login(credentials);
        return acceptLoginResponse(data);
    }

    async function register(details) {
        const data = await studentApi.register(details);

        if (data.user?.role !== "student") {
            throw new Error("Could not create a student account.");
        }

        sessionStorage.setItem(TOKEN_KEY, data.token);
        setStudent(data.user);
        return data.user;
    }

    async function updateProfile(profile) {
        const token = sessionStorage.getItem(TOKEN_KEY);

        if (!token) {
            throw new Error("Your session has expired. Please log in again.");
        }

        const data = await studentApi.updateProfile(token, profile);
        setStudent(data.user);
        return data.user;
    }

    async function changePassword(passwords) {
        const token = sessionStorage.getItem(TOKEN_KEY);

        if (!token) {
            throw new Error("Your session has expired. Please log in again.");
        }

        const data = await studentApi.changePassword(token, passwords);
        sessionStorage.setItem(TOKEN_KEY, data.token);
    }

    async function changePin(pins) {
        const token = sessionStorage.getItem(TOKEN_KEY);

        if (!token) {
            throw new Error("Your session has expired. Please log in again.");
        }

        const data = await studentApi.changePin(token, pins);
        sessionStorage.setItem(TOKEN_KEY, data.token);
    }

    function logout() {
        sessionStorage.removeItem(TOKEN_KEY);
        setStudent(null);
    }

    return (
        <StudentAuthContext.Provider
            value={{
                student,
                loading,
                login,
                acceptLoginResponse,
                register,
                updateProfile,
                changePassword,
                changePin,
                logout,
            }}
        >
            {children}
        </StudentAuthContext.Provider>
    );
}

export function useStudentAuth() {
    const context = useContext(StudentAuthContext);

    if (!context) {
        throw new Error(
            "useStudentAuth must be used inside StudentAuthProvider."
        );
    }

    return context;
}
