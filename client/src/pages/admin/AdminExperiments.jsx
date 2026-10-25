import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    Clock3,
    FlaskConical,
    Pencil,
    Plus,
    Search,
    Trash2,
} from "lucide-react";
import { adminApi } from "../../lib/adminApi";
import { useAuth } from "../../context/AuthContext";

function getExperimentId(experiment) {
    return experiment._id || experiment.id || experiment.slug;
}

function StatusBadge({ published }) {
    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                published
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-800"
            }`}
        >
            <span
                className={`mr-1.5 size-1.5 rounded-full ${
                    published ? "bg-emerald-600" : "bg-amber-600"
                }`}
            />
            {published ? "Published" : "Draft"}
        </span>
    );
}

export default function AdminExperiments() {
    const { token } = useAuth();
    const location = useLocation();
    const [experiments, setExperiments] = useState([]);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState(location.state?.notice || "");
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        let active = true;

        adminApi.listExperiments(token, search)
            .then((data) => {
                if (active) {
                    setExperiments(
                        Array.isArray(data) ? data : data.experiments || []
                    );
                    setError("");
                }
            })
            .catch((err) => {
                if (active) {
                    setError(err.message || "Could not load experiments.");
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [token, search]);

    const counts = useMemo(() => {
        const published = experiments.filter((item) => item.published).length;
        return {
            all: experiments.length,
            published,
            drafts: experiments.length - published,
        };
    }, [experiments]);

    const filteredExperiments = useMemo(
        () =>
            experiments.filter((experiment) => {
                if (status === "published") return Boolean(experiment.published);
                if (status === "drafts") return !experiment.published;
                return true;
            }),
        [experiments, status]
    );

    async function handleDelete(experiment) {
        const confirmed = window.confirm(
            `Delete "${experiment.title}"?\n\nThis action cannot be undone.`
        );

        if (!confirmed) return;

        const id = getExperimentId(experiment);
        setDeletingId(id);
        setError("");
        setNotice("");

        try {
            await adminApi.deleteExperiment(token, id);
            setExperiments((current) =>
                current.filter((item) => getExperimentId(item) !== id)
            );
            setNotice(`"${experiment.title}" was deleted.`);
        } catch (err) {
            setError(err.message || "Could not delete this experiment.");
        } finally {
            setDeletingId(null);
        }
    }

    const filters = [
        { id: "all", label: "All content", count: counts.all },
        { id: "published", label: "Published", count: counts.published },
        { id: "drafts", label: "Drafts", count: counts.drafts },
    ];

    return (
        <div className="mx-auto max-w-7xl space-y-6 p-5 text-slate-900 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-semibold text-slate-500">
                        CONTENT MANAGEMENT
                    </p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                        Experiments
                    </h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Create and maintain the practical science library.
                    </p>
                </div>
                <Link
                    to="/admin/experiments/new"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
                >
                    <Plus className="size-4" aria-hidden="true" />
                    Add experiment
                </Link>
            </div>

            {error && (
                <p
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                >
                    {error}
                </p>
            )}
            {notice && (
                <p
                    role="status"
                    className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
                >
                    {notice}
                </p>
            )}

            <section className="grid gap-3 sm:grid-cols-3" aria-label="Content counts">
                {filters.map((filter) => (
                    <button
                        key={filter.id}
                        type="button"
                        onClick={() => setStatus(filter.id)}
                        aria-pressed={status === filter.id}
                        className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 ${
                            status === filter.id
                                ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                    >
                        <span className="text-sm font-medium">{filter.label}</span>
                        <span className="text-lg font-bold tabular-nums">
                            {loading ? "—" : filter.count}
                        </span>
                    </button>
                ))}
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-4 sm:p-5">
                    <label className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-500 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200">
                        <Search className="size-4 shrink-0" aria-hidden="true" />
                        <input
                            value={search}
                            onChange={(event) => {
                                setError("");
                                setLoading(true);
                                setSearch(event.target.value);
                            }}
                            placeholder="Search by title, category, or summary..."
                            aria-label="Search experiments"
                            className="min-w-0 flex-1 bg-transparent py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                        />
                    </label>
                </div>

                {loading ? (
                    <p className="px-6 py-12 text-center text-sm text-slate-500">
                        Loading experiments...
                    </p>
                ) : error ? (
                    <p className="px-6 py-12 text-center text-sm text-slate-500">
                        Experiment content could not be loaded.
                    </p>
                ) : filteredExperiments.length === 0 ? (
                    <div className="px-6 py-14 text-center">
                        <FlaskConical className="mx-auto size-9 text-slate-400" />
                        <p className="mt-3 font-semibold text-slate-800">
                            {experiments.length === 0
                                ? "No experiments yet"
                                : "No matching experiments"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            {experiments.length === 0
                                ? "Create the first practical guide for your students."
                                : "Try another status filter or search term."}
                        </p>
                        {experiments.length === 0 && (
                            <Link
                                to="/admin/experiments/new"
                                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
                            >
                                <Plus className="size-4" />
                                Add experiment
                            </Link>
                        )}
                    </div>
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {filteredExperiments.map((experiment) => {
                            const id = getExperimentId(experiment);
                            return (
                                <li
                                    key={id}
                                    className="flex flex-col gap-4 px-4 py-4 transition hover:bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                                >
                                    <div className="flex min-w-0 items-start gap-3">
                                        <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                                            <FlaskConical className="size-5" aria-hidden="true" />
                                        </span>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="font-semibold text-slate-900">
                                                    {experiment.title}
                                                </h2>
                                                <StatusBadge published={experiment.published} />
                                            </div>
                                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
                                                <span>{experiment.category}</span>
                                                <span className="text-slate-300" aria-hidden="true">·</span>
                                                <span>{experiment.difficulty}</span>
                                                <span className="text-slate-300" aria-hidden="true">·</span>
                                                <span className="inline-flex items-center gap-1">
                                                    <Clock3 className="size-3.5" />
                                                    {experiment.duration} min
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 items-center justify-end gap-2 pl-[52px] sm:pl-0">
                                        <Link
                                            to={`/admin/experiments/${encodeURIComponent(id)}/edit`}
                                            aria-label={`Edit ${experiment.title}`}
                                            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
                                        >
                                            <Pencil className="size-4" />
                                            Edit
                                        </Link>
                                        <button
                                            type="button"
                                            disabled={deletingId === id}
                                            onClick={() => handleDelete(experiment)}
                                            aria-label={`Delete ${experiment.title}`}
                                            className="inline-flex size-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-wait disabled:opacity-50"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>
        </div>
    );
}
