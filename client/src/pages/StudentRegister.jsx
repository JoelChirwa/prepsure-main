import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useStudentAuth } from "../context/StudentAuthContext";
import { MALAWI_DISTRICTS } from "../data/districts";

const fieldClass =
    "w-full rounded-lg border border-[#484D40] bg-[#171916] px-4 py-3 text-[#F0EFE7] outline-none transition placeholder:text-[#888B80] focus:border-[#B8C39A] focus:ring-2 focus:ring-[#B8C39A]/20";

export default function StudentRegister() {
    const { register } = useStudentAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        phone: "",
        classLevel: "",
        pin: "",
        school: "",
        district: "",
    });
    const [showPin, setShowPin] = useState(false);
    const [error, setError] = useState("");
    const [recoveryCode, setRecoveryCode] = useState("");
    const [submitting, setSubmitting] = useState(false);

    function updateField(event) {
        setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            const data = await register(form);
            setRecoveryCode(data.recoveryCode || "");
        } catch (err) {
            setError(err.message || "Could not create your account.");
        } finally {
            setSubmitting(false);
        }
    }

    if (recoveryCode) {
        return (
            <main className="flex min-h-dvh items-center justify-center bg-[#171916] px-4 py-8 text-[#F0EFE7]">
                <section className="w-full max-w-md rounded-2xl border border-[#718055] bg-[#22251F] p-6 shadow-2xl sm:p-8">
                    <h1 className="font-heading text-3xl font-bold">Save your recovery code</h1>
                    <p className="mt-3 text-sm leading-6 text-[#C7C9C0]">
                        This code is shown once. Write it down or save a screenshot so you can recover your PIN.
                    </p>
                    <p className="mt-5 rounded-xl bg-[#171916] px-4 py-4 text-center font-mono text-2xl font-bold tracking-[0.25em] text-[#B8C39A]">
                        {recoveryCode}
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate("/student", { replace: true })}
                        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#B8C39A] px-4 py-3 font-bold text-[#20231D] hover:bg-[#CAD3B3]"
                    >
                        Continue to PrepSure <ArrowRight size={18} />
                    </button>
                </section>
            </main>
        );
    }

    return (
        <main className="flex min-h-dvh items-center justify-center bg-[#171916] px-4 py-8 text-[#F0EFE7] sm:py-12">
            <div className="w-full max-w-md">
                <section className="rounded-2xl border border-[#484D40] bg-[#22251F] p-6 shadow-2xl shadow-black/20 sm:p-8">
                    <h1 className="font-heading text-3xl font-bold tracking-tight">Create your account</h1>
                    <p className="mt-2 text-sm leading-6 text-[#C7C9C0]">
                        Start practising Physics practicals. Only your phone number and PIN are required.
                    </p>
                    {error && <p role="alert" className="mt-5 rounded-lg border border-red-400/30 bg-red-950/40 px-4 py-3 text-sm text-red-200">{error}</p>}

                    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                        <div>
                            <label htmlFor="name" className="mb-2 block text-sm font-semibold">First name</label>
                            <input id="name" name="name" autoComplete="given-name" required value={form.name} onChange={updateField} className={fieldClass} placeholder="Your first name" />
                        </div>
                        <div>
                            <label htmlFor="phone" className="mb-2 block text-sm font-semibold">Phone number</label>
                            <input id="phone" name="phone" type="tel" autoComplete="tel" required value={form.phone} onChange={updateField} className={fieldClass} placeholder="+265 99 123 4567" />
                        </div>
                        <div>
                            <label htmlFor="classLevel" className="mb-2 block text-sm font-semibold">Class level</label>
                            <select id="classLevel" name="classLevel" required value={form.classLevel} onChange={updateField} className={fieldClass}>
                                <option value="" disabled>Select your class level</option>
                                <option value="Form 1">Form 1</option>
                                <option value="Form 2">Form 2</option>
                                <option value="Form 3">Form 3</option>
                                <option value="Form 4">Form 4</option>
                                <option value="Private candidate">Private candidate</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="pin" className="mb-2 block text-sm font-semibold">4 to 6 digit PIN</label>
                            <div className="relative">
                                <input id="pin" name="pin" type={showPin ? "text" : "password"} inputMode="numeric" pattern="\d{4,6}" minLength={4} maxLength={6} autoComplete="new-password" required value={form.pin} onChange={updateField} className={`${fieldClass} pr-12`} placeholder="Choose a PIN" />
                                <button type="button" aria-label={showPin ? "Hide PIN" : "Show PIN"} onClick={() => setShowPin((visible) => !visible)} className="absolute inset-y-0 right-0 px-4 text-[#C7C9C0]">
                                    {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label htmlFor="school" className="mb-2 block text-sm font-semibold">School <span className="font-normal text-[#888B80]">(optional)</span></label>
                                <input id="school" name="school" value={form.school} onChange={updateField} className={fieldClass} />
                            </div>
                            <div>
                                <label htmlFor="district" className="mb-2 block text-sm font-semibold">District <span className="font-normal text-[#888B80]">(optional)</span></label>
                                <select id="district" name="district" value={form.district} onChange={updateField} className={fieldClass}>
                                    <option value="">Select district (optional)</option>
                                    {MALAWI_DISTRICTS.map((district) => (
                                        <option key={district} value={district}>{district}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button type="submit" disabled={submitting} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#B8C39A] px-4 py-3 font-bold text-[#20231D] hover:bg-[#CAD3B3] disabled:cursor-not-allowed disabled:opacity-60">
                            {submitting ? "Creating account..." : "Create account"}
                            {!submitting && <ArrowRight size={18} />}
                        </button>
                    </form>
                    <p className="mt-6 text-center text-sm text-[#C7C9C0]">
                        Already registered? <Link to="/login" className="font-semibold text-[#B8C39A] hover:text-[#D1DDB4]">Log in</Link>
                    </p>
                </section>
            </div>
        </main>
    );
}
