import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { adminQuizApi } from "../../lib/quizApi";

const newQuestion = () => ({
    prompt: "",
    topic: "",
    options: ["", "", "", ""],
    correctOptionIndex: 0,
    explanation: "",
});

const emptyQuiz = {
    title: "",
    subject: "Chemistry",
    topic: "",
    difficulty: "Beginner",
    durationMinutes: 10,
    isMockExam: false,
    attemptLimit: 3,
    description: "",
    published: false,
    questions: [newQuestion()],
};

export default function AdminQuizForm() {
    const { token } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const editing = Boolean(id);
    const [form, setForm] = useState(emptyQuiz);
    const [loading, setLoading] = useState(editing);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!editing) return undefined;
        let active = true;
        adminQuizApi.get(token, id)
            .then(({ quiz }) => {
                if (!active) return;
                setForm({
                    ...emptyQuiz,
                    ...quiz,
                    questions: quiz.questions.map((question) => ({
                        prompt: question.prompt,
                        topic: question.topic || "",
                        options: question.options.map((option) => option.text),
                        correctOptionIndex: question.correctOptionIndex,
                        explanation: question.explanation || "",
                    })),
                });
            })
            .catch((err) => {
                if (active) setError(err.message || "Could not load this quiz.");
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [editing, id, token]);

    function setField(field, value) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    function updateQuestion(index, field, value) {
        setForm((current) => ({
            ...current,
            questions: current.questions.map((question, questionIndex) =>
                questionIndex === index
                    ? { ...question, [field]: value }
                    : question
            ),
        }));
    }

    function updateOption(questionIndex, optionIndex, value) {
        setForm((current) => ({
            ...current,
            questions: current.questions.map((question, index) =>
                index === questionIndex
                    ? {
                        ...question,
                        options: question.options.map((option, itemIndex) =>
                            itemIndex === optionIndex ? value : option
                        ),
                    }
                    : question
            ),
        }));
    }

    function addQuestion() {
        if (form.questions.length >= 50) return;
        setForm((current) => ({
            ...current,
            questions: [...current.questions, newQuestion()],
        }));
    }

    function removeQuestion(index) {
        if (form.questions.length <= 1) return;
        setForm((current) => ({
            ...current,
            questions: current.questions.filter((_, i) => i !== index),
        }));
    }

    function addOption(questionIndex) {
        setForm((current) => ({
            ...current,
            questions: current.questions.map((question, index) =>
                index === questionIndex && question.options.length < 6
                    ? { ...question, options: [...question.options, ""] }
                    : question
            ),
        }));
    }

    function removeOption(questionIndex, optionIndex) {
        setForm((current) => ({
            ...current,
            questions: current.questions.map((question, index) => {
                if (index !== questionIndex || question.options.length <= 2) {
                    return question;
                }
                const options = question.options.filter((_, i) => i !== optionIndex);
                let correctOptionIndex = question.correctOptionIndex;
                if (correctOptionIndex === optionIndex) correctOptionIndex = 0;
                else if (correctOptionIndex > optionIndex) correctOptionIndex -= 1;
                return { ...question, options, correctOptionIndex };
            }),
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setSaving(true);
        const payload = {
            title: form.title.trim(),
            subject: form.subject.trim(),
            topic: form.topic.trim(),
            difficulty: form.difficulty,
            durationMinutes: Number(form.durationMinutes),
            isMockExam: Boolean(form.isMockExam),
            attemptLimit: Number(form.attemptLimit),
            description: form.description.trim(),
            published: Boolean(form.published),
            questions: form.questions.map((question) => ({
                prompt: question.prompt.trim(),
                topic: question.topic.trim(),
                options: question.options.map((text) => ({ text: text.trim() })),
                correctOptionIndex: Number(question.correctOptionIndex),
                explanation: question.explanation.trim(),
            })),
        };

        try {
            if (editing) {
                await adminQuizApi.update(token, id, payload);
            } else {
                await adminQuizApi.create(token, payload);
            }
            navigate("/admin/quizzes", {
                replace: true,
                state: { notice: editing ? "Assessment updated." : "Assessment created." },
            });
        } catch (err) {
            setError(err.message || "Could not save this quiz.");
        } finally {
            setSaving(false);
        }
    }

    const inputClass = "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200";
    const labelClass = "block text-sm font-medium text-slate-700";

    if (loading) {
        return <div className="mx-auto max-w-4xl p-6 text-sm text-slate-600">Loading quiz...</div>;
    }

    return (
        <div className="mx-auto max-w-5xl space-y-6 p-5 text-slate-900 sm:p-6 lg:p-8">
            <Link
                to="/admin/quizzes"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
            >
                <ArrowLeft className="size-4" />
                Back to quizzes
            </Link>

            <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <p className="text-sm font-semibold text-slate-500">ASSESSMENT CONTENT</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                    {editing ? "Edit assessment" : "Create assessment"}
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                    Write multiple-choice questions and provide explanations students can review.
                </p>
            </header>

            {error && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                    {error}
                </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label htmlFor="quiz-title" className={labelClass}>Quiz title</label>
                            <input id="quiz-title" className={inputClass} required maxLength={160} value={form.title} onChange={(event) => setField("title", event.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="quiz-subject" className={labelClass}>Subject</label>
                            <input id="quiz-subject" className={inputClass} required maxLength={80} value={form.subject} onChange={(event) => setField("subject", event.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="quiz-topic" className={labelClass}>Main topic</label>
                            <input id="quiz-topic" className={inputClass} required maxLength={100} value={form.topic} onChange={(event) => setField("topic", event.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="quiz-difficulty" className={labelClass}>Difficulty</label>
                            <select id="quiz-difficulty" className={inputClass} value={form.difficulty} onChange={(event) => setField("difficulty", event.target.value)}>
                                <option>Beginner</option>
                                <option>Intermediate</option>
                                <option>Advanced</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="quiz-duration" className={labelClass}>
                                {form.isMockExam ? "Time limit (minutes)" : "Suggested duration (minutes)"}
                            </label>
                            <input id="quiz-duration" className={inputClass} type="number" min="1" max="180" required value={form.durationMinutes} onChange={(event) => setField("durationMinutes", event.target.value)} />
                        </div>
                        <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                            <input
                                type="checkbox"
                                checked={Boolean(form.isMockExam)}
                                onChange={(event) => setField("isMockExam", event.target.checked)}
                                className="mt-0.5 size-4 accent-slate-900"
                            />
                            <span>
                                <span className="block text-sm font-semibold text-slate-800">Timed mock practical exam</span>
                                <span className="mt-0.5 block text-xs text-slate-500">Students get a server-enforced timer. Exam content and answer keys are snapshotted when an attempt starts.</span>
                            </span>
                        </label>
                        {form.isMockExam && (
                            <div>
                                <label htmlFor="quiz-attempt-limit" className={labelClass}>Attempts allowed per student</label>
                                <input id="quiz-attempt-limit" className={inputClass} type="number" min="1" max="5" required value={form.attemptLimit} onChange={(event) => setField("attemptLimit", event.target.value)} />
                            </div>
                        )}
                        <div className="sm:col-span-2">
                            <label htmlFor="quiz-description" className={labelClass}>Description</label>
                            <textarea id="quiz-description" className={inputClass} rows="3" required maxLength={1000} value={form.description} onChange={(event) => setField("description", event.target.value)} />
                        </div>
                    </div>
                    <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <input type="checkbox" checked={Boolean(form.published)} onChange={(event) => setField("published", event.target.checked)} className="mt-0.5 size-4 accent-slate-900" />
                        <span>
                            <span className="block text-sm font-semibold text-slate-800">Publish quiz</span>
                            <span className="mt-0.5 block text-xs text-slate-500">Published quizzes are available to students. Unpublished quizzes remain private to admins.</span>
                        </span>
                    </label>
                </section>

                {form.questions.map((question, questionIndex) => (
                    <section key={questionIndex} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="font-semibold text-slate-900">Question {questionIndex + 1}</h2>
                                <p className="mt-1 text-xs text-slate-500">Add 2–6 options and select the correct answer.</p>
                            </div>
                            {form.questions.length > 1 && (
                                <button type="button" onClick={() => removeQuestion(questionIndex)} className="inline-flex size-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-700" aria-label={`Remove question ${questionIndex + 1}`}>
                                    <Trash2 className="size-4" />
                                </button>
                            )}
                        </div>
                        <div>
                            <label htmlFor={`question-prompt-${questionIndex}`} className={labelClass}>Question prompt</label>
                            <textarea id={`question-prompt-${questionIndex}`} className={inputClass} rows="3" required maxLength={2000} value={question.prompt} onChange={(event) => updateQuestion(questionIndex, "prompt", event.target.value)} />
                        </div>
                        <div>
                            <label htmlFor={`question-topic-${questionIndex}`} className={labelClass}>Question topic (optional)</label>
                            <input id={`question-topic-${questionIndex}`} className={inputClass} maxLength={100} value={question.topic} onChange={(event) => updateQuestion(questionIndex, "topic", event.target.value)} placeholder={form.topic || "Topic area"} />
                        </div>
                        <fieldset className="space-y-3">
                            <legend className={labelClass}>Answer options</legend>
                            {question.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name={`correct-answer-${questionIndex}`}
                                        aria-label={`Mark option ${optionIndex + 1} as correct`}
                                        checked={question.correctOptionIndex === optionIndex}
                                        onChange={() => updateQuestion(questionIndex, "correctOptionIndex", optionIndex)}
                                        className="size-4 shrink-0 accent-emerald-700"
                                    />
                                    <label htmlFor={`question-${questionIndex}-option-${optionIndex}`} className="sr-only">
                                        Option {optionIndex + 1}
                                    </label>
                                    <input
                                        id={`question-${questionIndex}-option-${optionIndex}`}
                                        className={inputClass}
                                        required
                                        maxLength={500}
                                        value={option}
                                        onChange={(event) => updateOption(questionIndex, optionIndex, event.target.value)}
                                        placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                    />
                                    {question.options.length > 2 && (
                                        <button type="button" onClick={() => removeOption(questionIndex, optionIndex)} aria-label={`Remove option ${optionIndex + 1}`} className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-700">
                                            <Trash2 className="size-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <p className="text-xs text-slate-500">Select the radio button beside the correct option.</p>
                            {question.options.length < 6 && (
                                <button type="button" onClick={() => addOption(questionIndex)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                                    <Plus className="size-4" />
                                    Add option
                                </button>
                            )}
                        </fieldset>
                        <div>
                            <label htmlFor={`question-explanation-${questionIndex}`} className={labelClass}>Answer explanation</label>
                            <textarea id={`question-explanation-${questionIndex}`} className={inputClass} rows="2" maxLength={2000} value={question.explanation} onChange={(event) => updateQuestion(questionIndex, "explanation", event.target.value)} placeholder="Explain why the correct answer is right." />
                        </div>
                    </section>
                ))}

                <button type="button" disabled={form.questions.length >= 50} onClick={addQuestion} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                    <Plus className="size-4" />
                    Add question
                </button>

                <div className="sticky bottom-16 z-10 flex flex-wrap justify-end gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur md:bottom-4">
                    <Link to="/admin/quizzes" className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                        Cancel
                    </Link>
                    <button type="submit" disabled={saving} className="inline-flex min-h-11 items-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60">
                        {saving ? "Saving..." : editing ? "Save quiz" : "Create quiz"}
                    </button>
                </div>
            </form>
        </div>
    );
}
