import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    BookOpen,
    ClipboardList,
    FlaskConical,
    Plus,
    Sparkles,
} from "lucide-react";
import { adminApi } from "../../lib/adminApi";
import { useAuth } from "../../context/AuthContext";

function MetricCard({ icon: Icon, label, value, detail, accent }) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-600">{label}</p>
                <span className={`flex size-10 items-center justify-center rounded-xl ${accent}`}>
                    <Icon className="size-5" aria-hidden="true" />
                </span>
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                {value}
            </p>
            <p className="mt-1 text-sm text-slate-500">{detail}</p>
        </section>
    );
}

function getExperimentId(experiment) {
    return experiment._id || experiment.id || experiment.slug;
}

export default function AdminDashboard() {
    const { token, user } = useAuth();
    const [experiments, setExperiments] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        async function loadExperiments() {
            try {
                const data = await adminApi.listExperiments(token);
                if (active) {
                    setExperiments(
                        Array.isArray(data) ? data : data.experiments || []
                    );
                }
            } catch (err) {
                if (active) setError(err.message || "Could not load experiments.");
            } finally {
                if (active) setLoading(false);
            }
        }

        loadExperiments();
        return () => {
            active = false;
        };
    }, [token]);

    const stats = useMemo(() => {
        const published = experiments.filter((item) => item.published).length;
        return {
            total: experiments.length,
            published,
            drafts: experiments.length - published,
        };
    }, [experiments]);

    const recentExperiments = useMemo(
        () =>
            [...experiments]
                .sort(
                    (a, b) =>
                        new Date(b.updatedAt || 0).getTime() -
                        new Date(a.updatedAt || 0).getTime()
                )
                .slice(0, 5),
        [experiments]
    );

    return (
        <div className="mx-auto max-w-7xl space-y-8 p-5 text-slate-900 sm:p-6 lg:p-8">
            <section className="flex flex-col gap-5 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
                <div>
                    <p className="text-sm font-semibold text-slate-300">
                        ADMINISTRATION
                    </p>
                    <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                        Welcome, {user?.name || "Administrator"}
                    </h1>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                        Manage practical science content and keep the student
                        learning library up to date.
                    </p>
                </div>
                <Link
                    to="/admin/experiments/new"
                    className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                >
                    <Plus className="size-4" aria-hidden="true" />
                    New experiment
                </Link>
            </section>

            {error && (
                <p
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                >
                    {error}
                </p>
            )}

            <section aria-label="Content overview" className="grid gap-4 sm:grid-cols-3">
                <MetricCard
                    icon={FlaskConical}
                    label="All experiments"
                    value={loading ? "—" : stats.total}
                    detail="Content records in your library"
                    accent="bg-emerald-50 text-emerald-700"
                />
                <MetricCard
                    icon={BookOpen}
                    label="Published"
                    value={loading ? "—" : stats.published}
                    detail="Visible to students"
                    accent="bg-blue-50 text-blue-700"
                />
                <MetricCard
                    icon={ClipboardList}
                    label="Drafts"
                    value={loading ? "—" : stats.drafts}
                    detail="Only visible to administrators"
                    accent="bg-amber-50 text-amber-700"
                />
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-6">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Recently updated
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Review recent changes to your experiment content.
                        </p>
                    </div>
                    <Link
                        to="/admin/experiments"
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
                    >
                        Manage experiments
                        <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                </div>

                {loading ? (
                    <p className="px-6 py-10 text-center text-sm text-slate-500">
                        Loading experiment content...
                    </p>
                ) : error ? (
                    <p className="px-6 py-10 text-center text-sm text-slate-500">
                        Recent experiments are unavailable.
                    </p>
                ) : recentExperiments.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                        <Sparkles className="mx-auto size-8 text-slate-400" />
                        <p className="mt-3 font-medium text-slate-800">
                            Your library is ready for its first experiment
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            Create a practical guide to get started.
                        </p>
                        <Link
                            to="/admin/experiments/new"
                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
                        >
                            <Plus className="size-4" />
                            Create experiment
                        </Link>
                    </div>
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {recentExperiments.map((experiment) => {
                            const id = getExperimentId(experiment);
                            return (
                                <li
                                    key={id}
                                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-slate-900">
                                            {experiment.title}
                                        </p>
                                        <p className="mt-1 truncate text-sm text-slate-500">
                                            {experiment.category}
                                            {experiment.updatedAt
                                                ? ` · Updated ${new Date(experiment.updatedAt).toLocaleDateString()}`
                                                : ""}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                experiment.published
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : "bg-amber-50 text-amber-800"
                                            }`}
                                        >
                                            {experiment.published ? "Published" : "Draft"}
                                        </span>
                                        <Link
                                            to={`/admin/experiments/${encodeURIComponent(id)}/edit`}
                                            className="text-sm font-semibold text-slate-700 hover:text-slate-950"
                                        >
                                            Edit
                                        </Link>
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
