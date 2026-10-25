import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { simulationAdminApi } from "../../lib/simulationAdminApi";

const statuses = ["draft", "review", "published"];

export default function AdminSimulations() {
    const { token } = useAuth();
    const [simulation, setSimulation] = useState(null);
    const [status, setStatus] = useState("draft");
    const [reviewNotes, setReviewNotes] = useState("");
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    useEffect(() => {
        simulationAdminApi.list(token)
            .then(({ simulations }) => {
                const current = simulations[0];
                setSimulation(current);
                setStatus(current.status);
                setReviewNotes(current.reviewNotes);
            })
            .catch((err) => setError(err.message));
    }, [token]);

    async function save() {
        setError("");
        setNotice("");
        try {
            const { simulation: updated } = await simulationAdminApi.update(
                token,
                simulation.slug,
                { status, reviewNotes }
            );
            setSimulation(updated);
            setNotice("Simulation review status saved.");
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div className="mx-auto max-w-4xl space-y-6 p-5 text-slate-900 sm:p-6 lg:p-8">
            <div>
                <p className="text-sm font-semibold text-slate-500">SIMULATION CONTENT</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight">Practical simulations</h1>
                <p className="mt-2 text-sm text-slate-600">Review, sign off, and publish student simulation definitions.</p>
            </div>
            {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
            {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}
            {!simulation ? (
                <p className="text-sm text-slate-500">Loading simulations...</p>
            ) : (
                <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div>
                        <h2 className="text-lg font-semibold">{simulation.title}</h2>
                        <p className="mt-1 text-sm text-slate-600">{simulation.subject} · {simulation.usage.attempts} submitted attempts</p>
                        <p className="mt-3 text-sm text-slate-600">Skills: {simulation.skills.join(", ")}</p>
                        <a
                            href="/simulate/ohms-law?preview=1"
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-flex text-sm font-semibold text-slate-700 underline underline-offset-4 hover:text-slate-900"
                        >
                            Open simulation preview
                        </a>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4">
                        <h3 className="font-semibold text-slate-800">Aggregate mistake report</h3>
                        <p className="mt-1 text-xs text-slate-500">Attempts with lost marks by scoring area. No student identities are included.</p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {simulation.usage.mistakes.map((mistake) => (
                                <div key={mistake.area} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm">
                                    <span className="capitalize text-slate-700">{mistake.area}</span>
                                    <span className="font-semibold text-slate-900">{mistake.attemptsWithLostMarks}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <label className="block text-sm font-semibold">
                        Lifecycle status
                        <select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal">
                            {statuses.map((value) => <option key={value} value={value}>{value}</option>)}
                        </select>
                    </label>
                    <label className="block text-sm font-semibold">
                        Review notes
                        <textarea value={reviewNotes} onChange={(event) => setReviewNotes(event.target.value)} rows={4} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" placeholder="Record teacher review or sign-off notes." />
                    </label>
                    <button type="button" onClick={save} className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">Save review status</button>
                </section>
            )}
        </div>
    );
}
