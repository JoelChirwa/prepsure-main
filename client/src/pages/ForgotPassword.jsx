import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { studentApi } from "../lib/studentApi";

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ phone: "", recoveryCode: "", newPin: "" });
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setNotice("");
        setSubmitting(true);

        try {
            const data = await studentApi.recoverPin(form);
            setNotice(data.message);
            setTimeout(() => navigate("/login", { replace: true }), 1200);
        } catch (err) {
            setError(err.message || "Could not reset your PIN.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="flex min-h-dvh items-center justify-center bg-[#171916] px-4 py-8 text-[#F0EFE7] sm:py-12">
            <div className="w-full max-w-md">
                <Link to="/login" className="mb-5 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#D5D8CC] hover:bg-[#22251F] hover:text-white">
                    <ArrowLeft size={18} /> Back to login
                </Link>
                <section className="rounded-2xl border border-[#484D40] bg-[#22251F] p-6 shadow-2xl sm:p-8">
                    <h1 className="font-heading text-3xl font-bold">Recover your PIN</h1>
                    <p className="mt-2 text-sm leading-6 text-[#C7C9C0]">
                        Use the recovery code you saved when you registered. If it is lost, contact support.
                    </p>
                    {error && <p role="alert" className="mt-5 rounded-lg border border-red-400/30 bg-red-950/40 px-4 py-3 text-sm text-red-200">{error}</p>}
                    {notice && <p role="status" className="mt-5 rounded-lg border border-[#718055] bg-[#39452D] px-4 py-3 text-sm text-[#F0EFE7]">{notice}</p>}
                    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                        <label className="block text-sm font-semibold">Phone number
                            <input required type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="mt-2 w-full rounded-lg border border-[#484D40] bg-[#171916] px-4 py-3 text-[#F0EFE7] outline-none focus:border-[#B8C39A]" />
                        </label>
                        <label className="block text-sm font-semibold">Recovery code
                            <input required maxLength={10} value={form.recoveryCode} onChange={(event) => setForm({ ...form, recoveryCode: event.target.value.toUpperCase() })} className="mt-2 w-full rounded-lg border border-[#484D40] bg-[#171916] px-4 py-3 font-mono uppercase text-[#F0EFE7] outline-none focus:border-[#B8C39A]" />
                        </label>
                        <label className="block text-sm font-semibold">New 4 to 6 digit PIN
                            <input required pattern="\d{4,6}" minLength={4} maxLength={6} inputMode="numeric" type="password" value={form.newPin} onChange={(event) => setForm({ ...form, newPin: event.target.value })} className="mt-2 w-full rounded-lg border border-[#484D40] bg-[#171916] px-4 py-3 text-[#F0EFE7] outline-none focus:border-[#B8C39A]" />
                        </label>
                        <button type="submit" disabled={submitting} className="w-full rounded-lg bg-[#B8C39A] px-4 py-3 font-bold text-[#20231D] hover:bg-[#CAD3B3] disabled:opacity-60">
                            {submitting ? "Resetting..." : "Reset PIN"}
                        </button>
                    </form>
                </section>
            </div>
        </main>
    );
}
