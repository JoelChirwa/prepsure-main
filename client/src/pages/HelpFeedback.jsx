import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, LoaderCircle, MessageSquareText, Send } from "lucide-react";

import { submitFeedback } from "../lib/feedbackApi";

const fieldClassName =
    "w-full rounded-lg border border-[#484D40] bg-[#171916] px-4 py-3 text-[#F0EFE7] outline-none transition placeholder:text-[#888B80] focus:border-[#B8C39A] focus:ring-2 focus:ring-[#B8C39A]/20";

export default function HelpFeedback() {
    const [category, setCategory] = useState("question");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setSuccess("");
        setSubmitting(true);

        try {
            const result = await submitFeedback({
                category,
                name: name.trim(),
                email: email.trim(),
                subject: subject.trim(),
                message: message.trim(),
            });

            setSuccess(result.message);
            setName("");
            setEmail("");
            setSubject("");
            setMessage("");
        } catch (submitError) {
            setError(submitError.message || "Could not send your message.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="flex min-h-dvh items-center justify-center bg-[#171916] px-4 py-8 text-[#F0EFE7] sm:py-12">
            <div className="w-full max-w-2xl">
                <Link
                    to="/"
                    className="mb-5 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#D5D8CC] transition hover:bg-[#22251F] hover:text-white sm:text-base"
                >
                    <ArrowLeft size={18} />
                    Back to home
                </Link>

                <section className="rounded-2xl border border-[#484D40] bg-[#22251F] p-6 shadow-2xl shadow-black/20 sm:p-8">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-[#B8C39A]/10 text-[#B8C39A]">
                        <MessageSquareText size={23} />
                    </div>
                    <h1 className="mt-5 font-heading text-3xl font-bold tracking-tight text-[#F0EFE7]">
                        Help &amp; feedback
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-[#C7C9C0] sm:text-base">
                        Ask us a question or share feedback about PrepSure.
                    </p>

                    {error && (
                        <div
                            role="alert"
                            className="mt-5 rounded-lg border border-red-400/30 bg-red-950/40 px-4 py-3 text-sm text-red-200"
                        >
                            {error}
                        </div>
                    )}
                    {success && (
                        <div
                            role="status"
                            className="mt-5 rounded-lg border border-[#87966A]/40 bg-[#65744B]/15 px-4 py-3 text-sm text-[#D1DDB4]"
                        >
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                        <div>
                            <label
                                htmlFor="category"
                                className="mb-2 block text-sm font-semibold text-[#E2E3DC]"
                            >
                                What would you like to do?
                            </label>
                            <select
                                id="category"
                                value={category}
                                onChange={(event) => setCategory(event.target.value)}
                                className={fieldClassName}
                            >
                                <option value="question">Ask a question</option>
                                <option value="feedback">Share feedback</option>
                            </select>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="name"
                                    className="mb-2 block text-sm font-semibold text-[#E2E3DC]"
                                >
                                    Your name
                                </label>
                                <input
                                    id="name"
                                    autoComplete="name"
                                    maxLength={100}
                                    required
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    placeholder="Full name"
                                    className={fieldClassName}
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-semibold text-[#E2E3DC]"
                                >
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    maxLength={254}
                                    required
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="you@example.com"
                                    className={fieldClassName}
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="subject"
                                className="mb-2 block text-sm font-semibold text-[#E2E3DC]"
                            >
                                Subject
                            </label>
                            <input
                                id="subject"
                                maxLength={150}
                                required
                                value={subject}
                                onChange={(event) => setSubject(event.target.value)}
                                placeholder="What is this about?"
                                className={fieldClassName}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="message"
                                className="mb-2 block text-sm font-semibold text-[#E2E3DC]"
                            >
                                Message
                            </label>
                            <textarea
                                id="message"
                                rows={5}
                                maxLength={3000}
                                required
                                value={message}
                                onChange={(event) => setMessage(event.target.value)}
                                placeholder="Write your question or feedback..."
                                className={`${fieldClassName} resize-y`}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#B8C39A] px-4 py-3 font-bold text-[#20231D] transition hover:bg-[#CAD3B3] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting ? (
                                <>
                                    <LoaderCircle size={18} className="animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    Send message
                                    <Send size={17} />
                                </>
                            )}
                        </button>
                    </form>
                </section>
            </div>
        </main>
    );
}
