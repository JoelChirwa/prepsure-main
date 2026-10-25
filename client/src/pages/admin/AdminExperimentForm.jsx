
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { adminApi } from "../../lib/adminApi";
import { useAuth } from "../../context/AuthContext";

const emptyForm = {
    slug: "",
    title: "",
    category: "Chemistry",
    difficulty: "Beginner",
    duration: 30,
    summary: "",
    theory: "",
    apparatusImages: [""],
    objectives: [""],
    apparatus: [""],
    procedure: [""],
    observations: [{ test: "", result: "" }],
    conclusion: "",
    safety: [""],
    published: true,
};

function cleanList(items) {
    return items.map((item) => item.trim()).filter(Boolean);
}

function getPayload(form) {
    return {
        ...form,
        slug: form.slug.trim(),
        title: form.title.trim(),
        summary: form.summary.trim(),
        theory: form.theory.trim(),
        duration: Number(form.duration),
        apparatusImages: cleanList(form.apparatusImages),
        objectives: cleanList(form.objectives),
        apparatus: cleanList(form.apparatus),
        procedure: cleanList(form.procedure),
        observations: form.observations.filter(
            (item) => item.test.trim() || item.result.trim()
        ),
        conclusion: form.conclusion.trim(),
        safety: cleanList(form.safety),
    };
}

export default function AdminExperimentForm() {
    const { token } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const editing = Boolean(id);

    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(editing);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!editing) return;

        let active = true;

        adminApi.listExperiments(token)
            .then((data) => {
                const items = Array.isArray(data) ? data : data.experiments || [];
                const item = items.find(
                    (experiment) =>
                        String(experiment._id || experiment.id || experiment.slug) === id ||
                        experiment.slug === id
                );

                if (!item) throw new Error("Experiment not found.");

                if (active) {
                    setForm({
                        ...emptyForm,
                        ...item,
                        objectives: item.objectives?.length ? item.objectives : [""],
                        apparatusImages: item.apparatusImages?.length
                            ? item.apparatusImages
                            : [""],
                        apparatus: item.apparatus?.length ? item.apparatus : [""],
                        procedure: item.procedure?.length ? item.procedure : [""],
                        observations: item.observations?.length
                            ? item.observations
                            : [{ test: "", result: "" }],
                        safety: item.safety?.length ? item.safety : [""],
                    });
                }
            })
            .catch((err) => {
                if (active) setError(err.message);
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

    function setListItem(field, index, value) {
        setForm((current) => ({
            ...current,
            [field]: current[field].map((item, i) =>
                i === index ? value : item
            ),
        }));
    }

    function addListItem(field) {
        setForm((current) => ({
            ...current,
            [field]: [...current[field], ""],
        }));
    }

    function removeListItem(field, index) {
        setForm((current) => {
            const next = current[field].filter((_, i) => i !== index);
            return {
                ...current,
                [field]: next.length ? next : [""],
            };
        });
    }

    async function handleImageUpload(event) {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError("Image must be 5 MB or smaller.");
            return;
        }

        setUploadingImage(true);
        setError("");

        try {
            const result = await adminApi.uploadExperimentImage(token, file);
            setForm((current) => ({
                ...current,
                apparatusImages: [
                    ...current.apparatusImages.filter((image) => image.trim()),
                    result.url,
                ],
            }));
        } catch (err) {
            setError(err.message || "Could not upload the apparatus image.");
        } finally {
            setUploadingImage(false);
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSaving(true);
        setError("");

        try {
            const payload = getPayload(form);

            if (!payload.slug || !payload.title || !payload.summary) {
                throw new Error("Slug, title, and summary are required.");
            }

            if (payload.duration <= 0 || !Number.isFinite(payload.duration)) {
                throw new Error("Duration must be a positive number of minutes.");
            }

            if (!payload.objectives.length || !payload.apparatus.length || !payload.procedure.length) {
                throw new Error("Add at least one objective, apparatus item, and procedure step.");
            }

            if (editing) {
                await adminApi.updateExperiment(token, id, payload);
            } else {
                await adminApi.createExperiment(token, payload);
            }

            navigate("/admin/experiments", {
                replace: true,
                state: { notice: editing ? "Experiment updated." : "Experiment created." },
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    const inputClass = "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200";
    const labelClass = "block text-sm font-medium text-slate-700";

    if (loading) {
        return (
            <div className="mx-auto max-w-4xl p-6 text-sm text-slate-600">
                Loading experiment...
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl space-y-6 p-5 text-slate-900 sm:p-6 lg:p-8">
            <Link to="/admin/experiments" className="inline-flex items-center gap-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500">
                <ArrowLeft className="size-4" /> Back to experiments
            </Link>

            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                    <p className="text-sm font-semibold text-slate-500">
                        EXPERIMENT CONTENT
                    </p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                        {editing ? "Edit experiment" : "Create experiment"}
                    </h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Add practical details, learning guidance, and publication status.
                    </p>
                </div>
                <span className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-xs font-semibold ${
                    form.published
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-800"
                }`}>
                    {form.published ? "Published to students" : "Draft · admin only"}
                </span>
            </div>

            {error && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                    {error}
                </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                    <div>
                        <h2 className="font-semibold text-slate-900">Basic information</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            The title, summary, and level help students find the right practical.
                        </p>
                    </div>

                    <div>
                        <label className={labelClass} htmlFor="experiment-title">Title *</label>
                        <input id="experiment-title" className={inputClass} required value={form.title} onChange={(e) => setField("title", e.target.value)} />
                    </div>

                    <div>
                        <label className={labelClass} htmlFor="experiment-slug">Slug * (unique URL identifier)</label>
                        <input id="experiment-slug" className={inputClass} required value={form.slug} onChange={(e) => setField("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))} placeholder="acid-base-titration" />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className={labelClass} htmlFor="experiment-category">Category</label>
                            <input id="experiment-category" className={inputClass} required value={form.category} onChange={(e) => setField("category", e.target.value)} />
                        </div>
                        <div>
                            <label className={labelClass} htmlFor="experiment-difficulty">Difficulty</label>
                            <select id="experiment-difficulty" className={inputClass} value={form.difficulty} onChange={(e) => setField("difficulty", e.target.value)}>
                                <option>Beginner</option>
                                <option>Intermediate</option>
                                <option>Advanced</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className={labelClass} htmlFor="experiment-duration">Duration (minutes)</label>
                        <input id="experiment-duration" className={inputClass} type="number" min="1" required value={form.duration} onChange={(e) => setField("duration", e.target.value)} />
                    </div>

                    <div>
                        <label className={labelClass} htmlFor="experiment-summary">Summary *</label>
                        <textarea id="experiment-summary" className={inputClass} required maxLength={1000} rows="3" value={form.summary} onChange={(e) => setField("summary", e.target.value)} />
                    </div>

                    <div>
                        <label className={labelClass} htmlFor="experiment-theory">Scientific theory</label>
                        <textarea
                            id="experiment-theory"
                            className={inputClass}
                            rows="5"
                            maxLength={10000}
                            value={form.theory}
                            onChange={(e) => setField("theory", e.target.value)}
                            placeholder="Explain the science behind this practical."
                        />
                    </div>

                    <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-800">
                        <input type="checkbox" checked={Boolean(form.published)} onChange={(e) => setField("published", e.target.checked)} />
                        <span>
                            <span className="block">Publish this experiment to students</span>
                            <span className="mt-0.5 block text-xs font-normal text-slate-500">
                                Drafts remain private to administrators until published.
                            </span>
                        </span>
                    </label>
                </section>

                {[
                    ["apparatusImages", "Apparatus image URLs"],
                    ["objectives", "Objectives"],
                    ["apparatus", "Apparatus and materials"],
                    ["procedure", "Procedure steps"],
                    ["safety", "Safety precautions"],
                ].map(([field, heading]) => (
                    <section key={field} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-slate-900">{heading}</h2>
                            <div className="flex items-center gap-3">
                                {field === "apparatusImages" && (
                                    <label className="cursor-pointer text-sm font-semibold text-slate-700 hover:text-slate-950">
                                        {uploadingImage ? "Uploading..." : "Upload image"}
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp,image/avif"
                                            disabled={uploadingImage}
                                            onChange={handleImageUpload}
                                            className="sr-only"
                                        />
                                    </label>
                                )}
                                <button type="button" onClick={() => addListItem(field)} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-slate-950">
                                    <Plus className="size-4" /> Add item
                                </button>
                            </div>
                        </div>

                        {form[field].map((value, index) => (
                            <div key={`${field}-${index}`} className="flex items-start gap-2">
                                {field === "apparatusImages" ? (
                                    <div className="min-w-0 flex-1 space-y-2">
                                        <input
                                            className={inputClass}
                                            type="url"
                                            aria-label={`${heading} item ${index + 1}`}
                                            value={value}
                                            onChange={(e) => setListItem(field, index, e.target.value)}
                                            placeholder="https://example.com/apparatus.jpg"
                                        />
                                        {value && (
                                            <img
                                                src={value}
                                                alt={`Apparatus preview ${index + 1}`}
                                                className="max-h-40 rounded-lg border object-contain"
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <textarea
                                        className={inputClass}
                                        rows="2"
                                        aria-label={`${heading} item ${index + 1}`}
                                        value={value}
                                        onChange={(e) => setListItem(field, index, e.target.value)}
                                    />
                                )}
                                <button type="button" aria-label={`Remove ${heading} item ${index + 1}`} onClick={() => removeListItem(field, index)} className="mt-2 rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700">
                                    <Trash2 className="size-4" />
                                </button>
                            </div>
                        ))}
                    </section>
                ))}

                <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold text-slate-900">Observations</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Record the expected result for each test or action.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setField("observations", [...form.observations, { test: "", result: "" }])}
                            className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-slate-950"
                        >
                            <Plus className="size-4" /> Add observation
                        </button>
                    </div>

                    {form.observations.map((observation, index) => (
                        <div key={index} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
                            <div>
                                <label className={labelClass} htmlFor={`observation-test-${index}`}>Test / action</label>
                                <textarea id={`observation-test-${index}`} className={inputClass} rows="2" value={observation.test} onChange={(e) => setField("observations", form.observations.map((item, i) => i === index ? { ...item, test: e.target.value } : item))} />
                            </div>
                            <div>
                                <label className={labelClass} htmlFor={`observation-result-${index}`}>Observation / result</label>
                                <textarea id={`observation-result-${index}`} className={inputClass} rows="2" value={observation.result} onChange={(e) => setField("observations", form.observations.map((item, i) => i === index ? { ...item, result: e.target.value } : item))} />
                            </div>
                            <button type="button" onClick={() => setField("observations", form.observations.length === 1 ? [{ test: "", result: "" }] : form.observations.filter((_, i) => i !== index))} className="inline-flex items-center gap-1 text-sm font-medium text-red-700 hover:text-red-900">
                                <Trash2 className="size-4" /> Remove observation
                            </button>
                        </div>
                    ))}
                </section>

                <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                    <div>
                        <h2 className="font-semibold text-slate-900">Conclusion</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Summarize the main learning outcome for this practical.
                        </p>
                    </div>
                    <textarea aria-label="Conclusion" className={inputClass} rows="4" value={form.conclusion} onChange={(e) => setField("conclusion", e.target.value)} />
                </section>

                <div className="sticky bottom-16 z-10 flex flex-wrap justify-end gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur md:bottom-4">
                    <Link to="/admin/experiments" className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                        Cancel
                    </Link>
                    <button type="submit" disabled={saving || uploadingImage} className="inline-flex min-h-11 items-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60">
                        {uploadingImage ? "Uploading image..." : saving ? "Saving..." : editing ? "Save changes" : "Create experiment"}
                    </button>
                </div>
            </form>
        </div>
    );
}
