import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { studentApi } from "../lib/studentApi";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token") || "";
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError("The passwords do not match.");
            return;
        }

        setSubmitting(true);

        try {
            await studentApi.resetPassword(token, newPassword);
            navigate("/login", {
                replace: true,
                state: { notice: "Password reset successfully. You can now log in." },
            });
        } catch (err) {
            setError(err.message || "Could not reset your password.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="flex min-h-dvh items-center justify-center bg-[#171916] px-4 py-8 text-[#F0EFE7] sm:py-12">
            <div className="w-full max-w-md">
                <Link
                    to="/login"
                    className="mb-5 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#D5D8CC] transition hover:bg-[#22251F] hover:text-white"
                >
                    <ArrowLeft size={18} />
                    Back to login
                </Link>

                <section className="rounded-2xl border border-[#484D40] bg-[#22251F] p-6 shadow-2xl shadow-black/20 sm:p-8">
                    <h1 className="font-heading text-3xl font-bold tracking-tight">
                        Choose a new password
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-[#C7C9C0]">
                        Use at least 8 characters. Reset links expire after 30 minutes.
                    </p>

                    {!token && (
                        <p role="alert" className="mt-5 rounded-lg border border-red-400/30 bg-red-950/40 px-4 py-3 text-sm text-red-200">
                            This reset link is missing its token. Request a new link.
                        </p>
                    )}
                    {error && (
                        <p role="alert" className="mt-5 rounded-lg border border-red-400/30 bg-red-950/40 px-4 py-3 text-sm text-red-200">
                            {error}
                        </p>
                    )}

                    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                        <div>
                            <label htmlFor="new-password" className="mb-2 block text-sm font-semibold text-[#E2E3DC]">
                                New password
                            </label>
                            <input
                                id="new-password"
                                type="password"
                                autoComplete="new-password"
                                minLength={8}
                                maxLength={128}
                                required
                                value={newPassword}
                                onChange={(event) => setNewPassword(event.target.value)}
                                className="w-full rounded-lg border border-[#484D40] bg-[#171916] px-4 py-3 text-[#F0EFE7] outline-none transition focus:border-[#B8C39A] focus:ring-2 focus:ring-[#B8C39A]/20"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirm-password" className="mb-2 block text-sm font-semibold text-[#E2E3DC]">
                                Confirm new password
                            </label>
                            <input
                                id="confirm-password"
                                type="password"
                                autoComplete="new-password"
                                minLength={8}
                                maxLength={128}
                                required
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                className="w-full rounded-lg border border-[#484D40] bg-[#171916] px-4 py-3 text-[#F0EFE7] outline-none transition focus:border-[#B8C39A] focus:ring-2 focus:ring-[#B8C39A]/20"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting || !token}
                            className="w-full rounded-lg bg-[#B8C39A] px-4 py-3 font-bold text-[#20231D] transition hover:bg-[#CAD3B3] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting ? "Updating..." : "Reset password"}
                        </button>
                    </form>
                </section>
            </div>
        </main>
    );
}
