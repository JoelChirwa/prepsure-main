import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ClipboardList, Plus, RotateCcw } from "lucide-react";
import { adminQuizApi } from "../../lib/quizApi";
import { useAuth } from "../../context/AuthContext";

function QuizStatus({ quiz }) {
    const label = quiz.retired
        ? "Retired"
        : quiz.published
            ? "Published"
            : "Draft";
    const styles = quiz.retired
        ? "bg-slate-100 text-slate-600"
        : quiz.published
            ? "bg-emerald-50 text-emerald-700"
            : "bg-amber-50 text-amber-800";

    return (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles}`}>
            {label}
        </span>
    );
}

export default function AdminQuizzes() {
    const { token } = useAuth();
    const location = useLocation();
    const [quizzes, setQuizzes] = useState([]);
    const [includeRetired, setIncludeRetired] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState(location.state?.notice || "");
    const [retiringId, setRetiringId] = useState(null);

    useEffect(() => {
        let active = true;
        adminQuizApi.list(token, includeRetired)
            .then((data) => {
                if (active) setQuizzes(data.quizzes || []);
            })
            .catch((err) => {
                if (active) setError(err.message || "Could not load quizzes.");
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [includeRetired, token]);

    async function retireQuiz(quiz) {
        if (!window.confirm(`Retire "${quiz.title}"? Students will no longer be able to take it.`)) {
            return;
        }
        setRetiringId(quiz._id);
        setError("");
        setNotice("");
        try {
            await adminQuizApi.retire(token, quiz._id);
            setQuizzes((current) =>
                includeRetired
                    ? current.map((item) =>
                        item._id === quiz._id
                            ? { ...item, retired: true, published: false }
                            : item
                    )
                    : current.filter((item) => item._id !== quiz._id)
            );
            setNotice(`"${quiz.title}" was retired.`);
        } catch (err) {
            setError(err.message || "Could not retire this quiz.");
        } finally {
            setRetiringId(null);
        }
    }

    return (
        <div className="mx-auto max-w-7xl space-y-6 p-5 text-slate-900 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-semibold text-slate-500">ASSESSMENT MANAGEMENT</p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                        Assessments
                    </h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Write questions, review answer keys, and publish practice for students.
                    </p>
                </div>
                <Link
                    to="/admin/quizzes/new"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                    <Plus className="size-4" />
                    Create assessment
                </Link>
            </div>

            {error && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                    {error}
                </p>
            )}
            {notice && (
                <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                    {notice}
                </p>
            )}

            <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                    type="checkbox"
                    checked={includeRetired}
                    onChange={(event) => {
                        setLoading(true);
                        setError("");
                        setIncludeRetired(event.target.checked);
                    }}
                    className="size-4 accent-slate-900"
                />
                Show retired quizzes
            </label>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {loading ? (
                    <p className="px-6 py-12 text-center text-sm text-slate-500">
                        Loading quizzes...
                    </p>
                ) : quizzes.length === 0 ? (
                    <div className="px-6 py-14 text-center">
                        <ClipboardList className="mx-auto size-9 text-slate-400" />
                        <h2 className="mt-3 font-semibold text-slate-800">No assessments yet</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Create a quiz or timed mock exam and add questions to start building practice.
                        </p>
                        <Link
                            to="/admin/quizzes/new"
                            className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                        >
                            <Plus className="size-4" />
                            Create assessment
                        </Link>
                    </div>
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {quizzes.map((quiz) => (
                            <li
                                key={quiz._id}
                                className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                            >
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="font-semibold text-slate-900">{quiz.title}</h2>
                                        <QuizStatus quiz={quiz} />
                                    </div>
                                    <p className="mt-1 text-sm text-slate-600">
                                        {quiz.isMockExam ? "Mock exam" : "Practice quiz"} · {quiz.subject} · {quiz.topic} · {quiz.difficulty}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {quiz.questionCount} questions · {quiz.durationMinutes} min
                                        {quiz.isMockExam ? ` · ${quiz.attemptLimit} attempts` : ""}
                                    </p>
                                </div>
                                <div className="flex items-center justify-end gap-2">
                                    {!quiz.retired && (
                                        <>
                                            <Link
                                                to={`/admin/quizzes/${quiz._id}/edit`}
                                                className="inline-flex min-h-10 items-center rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => retireQuiz(quiz)}
                                                disabled={retiringId === quiz._id}
                                                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-800 disabled:opacity-50"
                                            >
                                                <RotateCcw className="size-4" />
                                                Retire
                                            </button>
                                        </>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
