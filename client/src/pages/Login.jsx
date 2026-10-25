import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useStudentAuth } from "../context/StudentAuthContext";
import { studentApi } from "../lib/studentApi";

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { acceptLoginResponse: acceptAdminLogin, logout: logoutAdmin } = useAuth();
    const {
        acceptLoginResponse: acceptStudentLogin,
        logout: logoutStudent,
    } = useStudentAuth();

    const [phone, setPhone] = useState("");
    const [pin, setPin] = useState("");
    const [showPin, setShowPin] = useState(false);
    const [adminMode, setAdminMode] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await studentApi.login(
                adminMode
                    ? { email: phone.trim(), password: pin }
                    : { phone: phone.trim(), pin }
            );
            const user = data.user;

            if (!data.token || !user) {
                throw new Error("The server returned an invalid login response.");
            }

            if (user.role === "admin") {
                logoutStudent();
                acceptAdminLogin(data);
                navigate("/admin", { replace: true });
            } else if (user.role === "student") {
                logoutAdmin();
                acceptStudentLogin(data);
                navigate("/student", { replace: true });
            } else {
                throw new Error("This account has an unsupported role.");
            }
        } catch (err) {
            setError(err.message || "Unable to sign in. Please check your details.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-dvh items-center justify-center bg-[#171916] px-4 py-8 text-[#F0EFE7] sm:py-12">
            <div className="w-full max-w-md">
                <Link
                    to="/"
                    className="mb-5 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#D5D8CC] transition hover:bg-[#22251F] hover:text-white sm:text-base"
                >
                    <ArrowLeft size={18} />
                    Back to home
                </Link>

                <section className="rounded-2xl border border-[#484D40] bg-[#22251F] p-6 shadow-2xl shadow-black/20 sm:p-8">
                    <h1 className="font-heading text-3xl font-bold tracking-tight text-[#F0EFE7]">
                        {adminMode ? "Administrator sign in" : "Welcome back"}
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-[#C7C9C0]">
                        {adminMode
                            ? "Use the administrator account credentials."
                            : "Sign in with your phone number and PIN."}
                    </p>

                    {location.state?.notice && (
                        <p role="status" className="mt-5 rounded-lg border border-[#718055] bg-[#39452D] px-4 py-3 text-sm text-[#F0EFE7]">
                            {location.state.notice}
                        </p>
                    )}

                    {error && (
                        <div
                            role="alert"
                            className="mt-5 rounded-lg border border-red-400/30 bg-red-950/40 px-4 py-3 text-sm text-red-200"
                        >
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                        <div>
                            <label
                                htmlFor="login-phone"
                                className="mb-2 block text-sm font-semibold text-[#E2E3DC]"
                            >
                                {adminMode ? "Email address" : "Phone number"}
                            </label>
                            <input
                                id="login-phone"
                                type={adminMode ? "email" : "tel"}
                                autoComplete={adminMode ? "username" : "tel"}
                                required
                                value={phone}
                                onChange={(event) => setPhone(event.target.value)}
                                placeholder={adminMode ? "admin@example.com" : "+265 99 123 4567"}
                                className="w-full rounded-lg border border-[#484D40] bg-[#171916] px-4 py-3 text-[#F0EFE7] outline-none transition placeholder:text-[#888B80] focus:border-[#B8C39A] focus:ring-2 focus:ring-[#B8C39A]/20"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="login-pin"
                                className="mb-2 block text-sm font-semibold text-[#E2E3DC]"
                            >
                                {adminMode ? "Password" : "PIN"}
                            </label>
                            <div className="relative">
                                <input
                                    id="login-pin"
                                    type={showPin ? "text" : "password"}
                                    autoComplete={adminMode ? "current-password" : "one-time-code"}
                                    required
                                    inputMode={adminMode ? undefined : "numeric"}
                                    maxLength={adminMode ? undefined : 6}
                                    value={pin}
                                    onChange={(event) => setPin(event.target.value)}
                                    placeholder={adminMode ? "Enter your password" : "4 to 6 digit PIN"}
                                    className="w-full rounded-lg border border-[#484D40] bg-[#171916] px-4 py-3 pr-12 text-[#F0EFE7] outline-none transition placeholder:text-[#888B80] focus:border-[#B8C39A] focus:ring-2 focus:ring-[#B8C39A]/20"
                                />
                                <button
                                    type="button"
                                    aria-label={showPin ? "Hide PIN" : "Show PIN"}
                                    aria-pressed={showPin}
                                    onClick={() => setShowPin((visible) => !visible)}
                                    className="absolute inset-y-0 right-0 inline-flex items-center px-4 text-[#C7C9C0] transition hover:text-[#F0EFE7]"
                                >
                                    {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#B8C39A] px-4 py-3 font-bold text-[#20231D] transition hover:bg-[#CAD3B3] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <LoaderCircle size={18} className="animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Log in
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    {!adminMode && (
                        <p className="mt-4 text-center text-sm">
                            <Link
                                to="/forgot-password"
                                className="font-semibold text-[#B8C39A] hover:text-[#D1DDB4]"
                            >
                                Forgot your PIN?
                            </Link>
                        </p>
                    )}

                    <button
                        type="button"
                        onClick={() => {
                            setAdminMode((value) => !value);
                            setPhone("");
                            setPin("");
                        }}
                        className="mt-4 block w-full text-center text-sm font-semibold text-[#B8C39A] hover:text-[#D1DDB4]"
                    >
                        {adminMode ? "Student sign in" : "Administrator sign in"}
                    </button>

                    <p className="mt-6 text-center text-sm text-[#C7C9C0]">
                        Don&apos;t have a student account?{" "}
                        <Link
                            to="/student/register"
                            className="font-bold text-[#B8C39A] hover:text-[#D1DDB4]"
                        >
                            Create one
                        </Link>
                    </p>
                </section>
            </div>
        </main>
    );
}
