import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, FlaskConical, RotateCcw, Share2, Undo2 } from "lucide-react";
import { useStudentAuth } from "../context/StudentAuthContext";
import { studentApi } from "../lib/studentApi";
import { SIMULATION_PACKS } from "../data/simulationPacks";
import {
    getPackState,
    isPackDownloaded,
    removePack,
    preparePack,
} from "../lib/contentPacks";

const STORAGE_KEY = "prepsure:ohms-law:attempt";

function createAttempt(mode = "guided", challengeSeed = "") {
    const seedValues = challengeSeed.split("-").map(Number);
    const resistance = Number.isFinite(seedValues[0])
        ? seedValues[0]
        : Math.round((4 + Math.random() * 8) * 10) / 10;
    const cellVoltage = Number.isFinite(seedValues[1])
        ? seedValues[1]
        : Math.round((3 + Math.random() * 2) * 10) / 10;

    return {
        clientAttemptId: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        seed: challengeSeed || `${resistance}-${cellVoltage}-${Date.now()}`,
        mode,
        startedAt: Date.now(),
        resistance,
        cellVoltage,
        zeroError: Math.random() > 0.6 ? 0.02 : 0,
        connectedAmmeter: false,
        connectedVoltmeter: false,
        correctPolarity: false,
        switchUsed: false,
        switchOn: false,
        readings: [],
        labSheet: { scale: "", gradient: "", conclusion: "" },
        actions: [],
        submitted: false,
        score: null,
        synced: false,
    };
}

function addAction(attempt, action) {
    return { ...attempt, actions: [...attempt.actions.slice(-19), action] };
}

function CircuitDiagram({ attempt, onToggleSwitch }) {
    const wireColor = attempt.switchOn ? "#66734F" : "#8B8E84";
    const componentFill = "#F0EFE7";

    return (
        <div className="mt-5 overflow-hidden rounded-xl border border-[#D9DACE] bg-[#FBFBF8] p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[#30332C]">Physical circuit</p>
                <p className="text-xs text-[#686B62]">A in series · V across resistor</p>
            </div>
            <svg
                viewBox="0 0 720 280"
                role="img"
                aria-label="Physical circuit showing cells, ammeter, resistor, switch and voltmeter"
                className="h-auto w-full rounded-lg bg-white"
            >
                <path d="M80 70H180M260 70H335M405 70H590V210H80V70" fill="none" stroke={wireColor} strokeWidth="6" strokeLinecap="round" />
                <path d="M335 70V125M405 70V125" fill="none" stroke={wireColor} strokeWidth="5" />
                <path d="M335 125H405" fill="none" stroke="#B8C39A" strokeWidth="4" strokeDasharray="8 7" />
                <g>
                    <line x1="95" y1="45" x2="95" y2="95" stroke="#39452D" strokeWidth="5" />
                    <line x1="115" y1="35" x2="115" y2="105" stroke="#39452D" strokeWidth="9" />
                    <line x1="135" y1="45" x2="135" y2="95" stroke="#39452D" strokeWidth="5" />
                    <line x1="155" y1="35" x2="155" y2="105" stroke="#39452D" strokeWidth="9" />
                    <text x="125" y="130" textAnchor="middle" fontSize="16" fill="#30332C">Cells</text>
                </g>
                <g>
                    <circle cx="220" cy="70" r="40" fill={componentFill} stroke="#66734F" strokeWidth="4" />
                    <text x="220" y="78" textAnchor="middle" fontSize="28" fontWeight="700" fill="#39452D">A</text>
                    <text x="220" y="130" textAnchor="middle" fontSize="16" fill="#30332C">Ammeter</text>
                </g>
                <g>
                    <rect x="335" y="35" width="70" height="70" rx="8" fill={componentFill} stroke="#66734F" strokeWidth="4" />
                    <path d="M348 70H360L369 52L381 88L390 70H397" fill="none" stroke="#39452D" strokeWidth="3" />
                    <text x="370" y="130" textAnchor="middle" fontSize="16" fill="#30332C">Resistor</text>
                </g>
                <g>
                    <line x1="585" y1="210" x2="585" y2="180" stroke={wireColor} strokeWidth="6" />
                    <line x1="585" y1="180" x2={attempt.switchOn ? "630" : "615"} y2="150" stroke={wireColor} strokeWidth="6" />
                    <line x1="630" y1="150" x2="630" y2="120" stroke={wireColor} strokeWidth="6" />
                    <circle cx="585" cy="180" r="8" fill="#39452D" />
                    <circle cx="630" cy="120" r="8" fill="#39452D" />
                    <line x1="585" y1="180" x2={attempt.switchOn ? "630" : "610"} y2={attempt.switchOn ? "120" : "145"} stroke={attempt.switchOn ? "#66734F" : "#8B8E84"} strokeWidth="6" />
                    <text x="610" y="235" textAnchor="middle" fontSize="16" fill="#30332C">Switch</text>
                    <foreignObject x="550" y="242" width="120" height="32">
                        <button type="button" onClick={onToggleSwitch} className="w-full rounded-md bg-[#66734F] px-2 py-1 text-xs font-bold text-white">
                            {attempt.switchOn ? "Open switch" : "Close switch"}
                        </button>
                    </foreignObject>
                </g>
                <g>
                    <circle cx="370" cy="175" r="38" fill="#EEEAF4" stroke="#685580" strokeWidth="4" />
                    <text x="370" y="183" textAnchor="middle" fontSize="27" fontWeight="700" fill="#685580">V</text>
                    <text x="370" y="235" textAnchor="middle" fontSize="16" fill="#30332C">Voltmeter</text>
                </g>
            </svg>
        </div>
    );
}

export default function OhmsLawSimulation() {
    const { student } = useStudentAuth();
    const isPreview = new URLSearchParams(window.location.search).get("preview") === "1";
    const [attempt, setAttempt] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : createAttempt();
        } catch {
            return createAttempt();
        }
    });
    const [online, setOnline] = useState(() => navigator.onLine);
    const [showGuide, setShowGuide] = useState(attempt.mode === "guided");
    const [elapsed, setElapsed] = useState(0);
    const [syncError, setSyncError] = useState("");
    const pack = SIMULATION_PACKS["ohms-law"];
    const [packDownloaded, setPackDownloaded] = useState(() =>
        isPackDownloaded("ohms-law")
    );
    const [packProgress, setPackProgress] = useState(() =>
        getPackState("ohms-law")?.progress || 0
    );
    const [packDownloading, setPackDownloading] = useState(false);
    const [challenge, setChallenge] = useState(null);
    const [challengeFromLink, setChallengeFromLink] = useState(false);
    const [challengeError, setChallengeError] = useState("");
    const [challengeShared, setChallengeShared] = useState(false);

    useEffect(() => {
        const code = new URLSearchParams(window.location.search).get("challenge");
        if (!code) return;
        setChallengeFromLink(true);
        studentApi.getSimulationChallenge(code)
            .then(({ challenge: loaded }) => {
                setChallenge(loaded);
                setAttempt((current) =>
                    current.submitted || current.readings.length > 0
                        ? current
                        : createAttempt("practice", loaded.seed)
                );
            })
            .catch((error) => setChallengeError(error.message));
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(attempt));
    }, [attempt]);

    useEffect(() => {
        if (isPreview || !student || !online || !attempt.submitted || attempt.synced) return;

        let active = true;
        const token = sessionStorage.getItem("prepsure_student_token");
        if (!token) return undefined;

        setSyncError("");
        studentApi.syncSimulationAttempt(token, {
            clientAttemptId: attempt.clientAttemptId,
            simulation: "ohms-law",
            mode: attempt.mode,
            seed: attempt.seed,
            readings: attempt.readings,
            technique: {
                connectedAmmeter: attempt.connectedAmmeter,
                connectedVoltmeter: attempt.connectedVoltmeter,
                correctPolarity: attempt.correctPolarity,
                switchUsed: attempt.switchUsed,
            },
            labSheet: attempt.labSheet,
            submittedAt: new Date(attempt.startedAt).toISOString(),
        }).then(() => {
            if (active) {
                setAttempt((current) => ({ ...current, synced: true }));
            }
        }).catch(() => {
            if (active) {
                setSyncError("Your result is saved on this device and will sync when the connection is available.");
            }
        });

        return () => {
            active = false;
        };
    }, [attempt, isPreview, online, student]);

    useEffect(() => {
        const update = () => setOnline(navigator.onLine);
        window.addEventListener("online", update);
        window.addEventListener("offline", update);
        return () => {
            window.removeEventListener("online", update);
            window.removeEventListener("offline", update);
        };
    }, []);

    useEffect(() => {
        const timer = window.setInterval(() => {
            setElapsed(Math.floor((Date.now() - attempt.startedAt) / 1000));
        }, 1000);
        return () => window.clearInterval(timer);
    }, [attempt.startedAt]);

    const nextStep = useMemo(() => {
        if (!attempt.connectedAmmeter || !attempt.connectedVoltmeter) return "Connect both meters before taking a reading.";
        if (!attempt.correctPolarity) return "Check the polarity of both meters.";
        if (!attempt.switchUsed) return "Close and open the switch between readings.";
        if (attempt.readings.length < 6) return "Take at least six readings across the range.";
        if (!attempt.labSheet.scale) return "Set a scale that uses most of the graph.";
        if (!attempt.labSheet.gradient) return "Enter the gradient from a large triangle.";
        return "State your conclusion and submit the lab sheet.";
    }, [attempt]);

    function updateAttempt(updater) {
        setAttempt((current) => updater(current));
    }

    function connect(name) {
        updateAttempt((current) => addAction({
            ...current,
            [name]: true,
            correctPolarity: current.correctPolarity || name === "connectedVoltmeter",
        }, `connected:${name}`));
    }

    function takeReading() {
        if (!attempt.connectedAmmeter || !attempt.connectedVoltmeter) return;
        const index = attempt.readings.length + 1;
        const current = Math.round((0.08 + index * 0.06) * 100) / 100;
        const voltage = Math.round((current * attempt.resistance + attempt.zeroError) * 100) / 100;
        updateAttempt((currentAttempt) => addAction({
            ...currentAttempt,
            switchOn: false,
            switchUsed: true,
            readings: [...currentAttempt.readings, { current, voltage }],
        }, `reading:${index}`));
    }

    function toggleSwitch() {
        updateAttempt((current) => addAction({
            ...current,
            switchOn: !current.switchOn,
            switchUsed: true,
        }, "toggle:switch"));
    }

    function updateSheet(field, value) {
        updateAttempt((current) => ({
            ...current,
            labSheet: { ...current.labSheet, [field]: value },
        }));
    }

    function submit() {
        const technique = [
            attempt.connectedAmmeter,
            attempt.connectedVoltmeter,
            attempt.correctPolarity,
            attempt.switchUsed,
        ].filter(Boolean).length;
        const recording = attempt.readings.length >= 6 ? 2 : attempt.readings.length > 0 ? 1 : 0;
        const calculation = Number(attempt.labSheet.gradient) > 0 ? 2 : 0;
        const reasoning = attempt.labSheet.conclusion.trim().length >= 20 ? 2 : 0;
        const total = technique + recording + calculation + reasoning;

        updateAttempt((current) => ({
            ...current,
            submitted: true,
            score: { technique, recording, calculation, reasoning, total, maximum: 10 },
        }));
    }

    function reset() {
        setAttempt(createAttempt(attempt.mode));
    }

    function changeMode(mode) {
        setAttempt(createAttempt(mode));
        setShowGuide(mode === "guided");
    }

    async function downloadPack() {
        setPackDownloading(true);
        try {
            await preparePack(pack, setPackProgress);
            setPackDownloaded(true);
        } catch {
            setSyncError("The offline pack is paused. Check your connection and try again.");
        } finally {
            setPackDownloading(false);
        }
    }

    function deletePack() {
        removePack(pack.id);
        setPackDownloaded(false);
        setPackProgress(0);
    }

    async function createChallenge() {
        if (isPreview) {
            setChallengeError("Preview mode does not create or share student results.");
            return;
        }
        const token = sessionStorage.getItem("prepsure_student_token");
        if (!token) {
            setChallengeError("Sign in to challenge a friend with this result.");
            return;
        }
        try {
            const { challenge: created } = await studentApi.createSimulationChallenge(token, {
                simulation: "ohms-law",
                seed: attempt.seed,
                score: attempt.score,
            });
            const link = `${window.location.origin}/simulate/ohms-law?challenge=${created.code}`;
            await navigator.clipboard.writeText(link);
            setChallenge(created);
            setChallengeShared(true);
        } catch (error) {
            setChallengeError(error.message);
        }
    }

    async function submitChallengeResult() {
        if (!challenge || !attempt.score) return;
        try {
            const { challenge: updated } = await studentApi.submitSimulationChallenge(
                challenge.code,
                attempt.score
            );
            setChallenge(updated);
        } catch (error) {
            setChallengeError(error.message);
        }
    }

    function undo() {
        updateAttempt((current) => {
            const lastAction = current.actions.at(-1);
            if (!lastAction) return current;
            return {
                ...createAttempt(current.mode),
                ...current,
                actions: current.actions.slice(0, -1),
                readings: lastAction.startsWith("reading:")
                    ? current.readings.slice(0, -1)
                    : current.readings,
            };
        });
    }

    return (
        <main className="min-h-dvh bg-[#F7F7F2] text-[#30332C]">
            <header className="border-b border-[#D9DACE] bg-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
                    <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#596443]"><ArrowLeft size={17} /> Exit simulation</Link>
                    <div className="flex items-center gap-3 text-xs font-semibold">
                        <span className={`rounded-full px-3 py-1 ${!online ? "bg-amber-50 text-amber-800" : attempt.submitted && !attempt.synced ? "bg-blue-50 text-blue-800" : "bg-[#E7EADF] text-[#596443]"}`}>{!online ? "Offline" : attempt.submitted && !attempt.synced ? "Syncing" : "Up to date"}</span>
                        <span className="rounded-full bg-[#EEEAF4] px-3 py-1 text-[#685580]">{attempt.mode} mode</span>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-6xl space-y-5 px-4 py-5 sm:px-6 sm:py-8">
                {syncError && <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{syncError}</p>}
                {challengeError && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{challengeError}</p>}
                <section className="rounded-2xl bg-gradient-to-br from-[#39452D] to-[#738258] p-5 text-white sm:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#DCE3CC]">Physics practical</p>
                            <h1 className="mt-2 font-heading text-2xl font-bold sm:text-3xl">Verify Ohm&apos;s law</h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#EEF1E7]">Investigate how current varies with potential difference and determine the resistance from your graph.</p>
                        </div>
                        {isPreview && <p className="mt-4 rounded-lg bg-white/15 px-3 py-2 text-xs font-semibold text-[#EEF1E7]">Admin preview mode · results are not saved, synced, or shared.</p>}
                        <FlaskConical size={34} aria-hidden="true" />
                    </div>
                    <div className="mt-5 flex flex-wrap items-center gap-2">
                        {["guided", "practice", "exam"].map((mode) => (
                            <button key={mode} type="button" onClick={() => changeMode(mode)} className={`rounded-full px-3 py-2 text-xs font-bold capitalize ${attempt.mode === mode ? "bg-white text-[#39452D]" : "bg-white/15 text-white hover:bg-white/25"}`}>
                                {mode}
                            </button>
                        ))}
                        <span className="ml-auto text-xs font-semibold text-[#EEF1E7]">Time: {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}</span>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-black/15 p-3 text-sm">
                        <div>
                            <p className="font-semibold">Offline pack · {pack.sizeLabel}</p>
                            <p className="mt-1 text-xs text-[#E6E9DF]">
                                {packDownloaded
                                    ? "Downloaded on this device."
                                    : "Download once to keep this practical available offline."}
                            </p>
                        </div>
                        {packDownloaded ? (
                            <button type="button" onClick={deletePack} className="rounded-lg border border-white/40 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10">
                                Delete pack
                            </button>
                        ) : (
                            <button type="button" onClick={downloadPack} disabled={packDownloading} className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-[#39452D] hover:bg-[#F0EFE7] disabled:cursor-wait disabled:opacity-70">
                                {packDownloading ? `Preparing ${packProgress}%` : packProgress ? `Resume pack (${packProgress}%)` : "Download pack"}
                            </button>
                        )}
                    </div>
                </section>

                <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                    <section className="space-y-5">
                        <div className="rounded-2xl border border-[#E1E2D9] bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="font-heading text-lg font-bold">Simulation bench</h2>
                                {attempt.mode !== "exam" && <button type="button" onClick={() => setShowGuide((value) => !value)} className="text-sm font-semibold text-[#66734F]">{showGuide ? "Hide guide" : "Show guide"}</button>}
                            </div>
                            {showGuide && <p className="mt-3 rounded-xl bg-[#F7F7F2] p-3 text-sm leading-6 text-[#686B62]">{nextStep}</p>}
                            <CircuitDiagram attempt={attempt} onToggleSwitch={toggleSwitch} />
                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                <button type="button" onClick={() => connect("connectedAmmeter")} disabled={attempt.connectedAmmeter} className="rounded-xl border border-[#D9DACE] p-4 text-left text-sm font-semibold hover:bg-[#F5F6F0] disabled:bg-[#E7EADF] disabled:text-[#596443]">
                                    {attempt.connectedAmmeter ? "✓ Ammeter in series" : "Connect ammeter in series"}
                                </button>
                                <button type="button" onClick={() => connect("connectedVoltmeter")} disabled={attempt.connectedVoltmeter} className="rounded-xl border border-[#D9DACE] p-4 text-left text-sm font-semibold hover:bg-[#F5F6F0] disabled:bg-[#E7EADF] disabled:text-[#596443]">
                                    {attempt.connectedVoltmeter ? "✓ Voltmeter in parallel" : "Connect voltmeter in parallel"}
                                </button>
                            </div>
                            <div className="mt-4 rounded-xl border border-dashed border-[#B8C39A] bg-[#F7F7F2] p-5 text-center">
                                <p className="text-sm text-[#686B62]">Resistor, cells, switch and rheostat are ready.</p>
                                <p className="mt-2 text-2xl font-bold text-[#66734F]">{attempt.readings.length ? `${attempt.readings.length} readings recorded` : "Circuit open"}</p>
                                <button type="button" onClick={takeReading} disabled={!attempt.connectedAmmeter || !attempt.connectedVoltmeter || !attempt.switchOn || attempt.readings.length >= 8} className="mt-4 rounded-xl bg-[#66734F] px-5 py-3 text-sm font-bold text-white hover:bg-[#455333] disabled:cursor-not-allowed disabled:opacity-50">Record reading</button>
                            </div>
                            {attempt.mode !== "exam" && <button type="button" onClick={() => setShowGuide(true)} className="mt-3 w-full rounded-lg border border-[#D9DACE] px-3 py-2 text-sm font-semibold text-[#596443]">Hint</button>}
                            <div className="mt-4 flex flex-wrap gap-2">
                                <button type="button" onClick={undo} className="inline-flex items-center gap-2 rounded-lg border border-[#D9DACE] px-3 py-2 text-sm font-semibold"><Undo2 size={15} /> Undo</button>
                                <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-lg border border-[#D9DACE] px-3 py-2 text-sm font-semibold"><RotateCcw size={15} /> Reset</button>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-[#E1E2D9] bg-white p-5 shadow-sm">
                            <h2 className="font-heading text-lg font-bold">Results table</h2>
                            <div className="mt-4 overflow-x-auto">
                                <table className="w-full min-w-[280px] text-left text-sm">
                                    <thead><tr className="border-b border-[#ECEDE6] text-xs uppercase tracking-wide text-[#686B62]"><th className="px-2 py-2">Reading</th><th className="px-2 py-2">I (A)</th><th className="px-2 py-2">V (V)</th></tr></thead>
                                    <tbody>{attempt.readings.map((reading, index) => <tr key={`${reading.current}-${index}`} className="border-b border-[#F0F1EB]"><td className="px-2 py-2">{index + 1}</td><td className="px-2 py-2">{reading.current.toFixed(2)}</td><td className="px-2 py-2">{reading.voltage.toFixed(2)}</td></tr>)}</tbody>
                                </table>
                            </div>
                            <div className="rounded-2xl border border-[#E1E2D9] bg-white p-5 shadow-sm">
                                <h2 className="font-heading text-lg font-bold">Graph: V against I</h2>
                                <svg viewBox="0 0 300 180" role="img" aria-label="Voltage against current graph" className="mt-4 h-auto w-full rounded-lg bg-[#F7F7F2]">
                                    <path d="M35 15V150H285" fill="none" stroke="#686B62" strokeWidth="2" />
                                    <path d="M35 150L280 25" fill="none" stroke="#66734F" strokeDasharray="6 5" strokeWidth="2" />
                                    {attempt.readings.map((reading) => {
                                        const x = 35 + (reading.current / 0.6) * 240;
                                        const y = 150 - (reading.voltage / 8) * 125;
                                        return <circle key={`${reading.current}-${reading.voltage}`} cx={x} cy={y} r="4" fill="#685580" />;
                                    })}
                                    <text x="145" y="174" fontSize="11" fill="#55584F">I (A)</text>
                                    <text x="8" y="90" fontSize="11" fill="#55584F" transform="rotate(-90 8 90)">V (V)</text>
                                </svg>
                                <p className="mt-2 text-xs text-[#686B62]">Plot all readings, use a scale over most of the grid, and draw one straight best-fit line.</p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-5">
                        <div className="rounded-2xl border border-[#E1E2D9] bg-white p-5 shadow-sm">
                            <h2 className="font-heading text-lg font-bold">Lab sheet</h2>
                            <p className="mt-1 text-sm text-[#686B62]">Record the graph work and conclusion as you would in the exam.</p>
                            <label className="mt-4 block text-sm font-semibold">Graph scale
                                <input value={attempt.labSheet.scale} onChange={(event) => updateSheet("scale", event.target.value)} placeholder="For example, 1 cm = 0.1 A" className="mt-2 w-full rounded-lg border border-[#D9DACE] px-3 py-2.5 text-sm outline-none focus:border-[#87966A]" />
                            </label>
                            <label className="mt-4 block text-sm font-semibold">Gradient (V/A)
                                <input type="number" value={attempt.labSheet.gradient} onChange={(event) => updateSheet("gradient", event.target.value)} placeholder="Use a large triangle" className="mt-2 w-full rounded-lg border border-[#D9DACE] px-3 py-2.5 text-sm outline-none focus:border-[#87966A]" />
                            </label>
                            <label className="mt-4 block text-sm font-semibold">Conclusion
                                <textarea rows={4} value={attempt.labSheet.conclusion} onChange={(event) => updateSheet("conclusion", event.target.value)} placeholder="State the relationship between V and I." className="mt-2 w-full rounded-lg border border-[#D9DACE] px-3 py-2.5 text-sm outline-none focus:border-[#87966A]" />
                            </label>
                            <button type="button" onClick={submit} disabled={attempt.submitted} className="mt-5 w-full rounded-xl bg-[#66734F] px-4 py-3 font-bold text-white hover:bg-[#455333] disabled:cursor-not-allowed disabled:opacity-60">{attempt.submitted ? "Attempt submitted" : "Submit lab sheet"}</button>
                        </div>
                        {attempt.submitted && attempt.score && <div role="status" className="rounded-2xl border border-[#B8C39A] bg-[#F1F3EA] p-5">
                            <div className="flex items-center gap-2"><CheckCircle2 className="text-[#66734F]" size={20} /><h2 className="font-heading text-lg font-bold">Your marking report</h2></div>
                            <p className="mt-3 text-3xl font-bold text-[#66734F]">{attempt.score.total}/{attempt.score.maximum}</p>
                            <ul className="mt-3 space-y-1 text-sm text-[#55584F]">
                                <li>Technique: {attempt.score.technique}/4 - meters, polarity, and switch use</li>
                                <li>Recording: {attempt.score.recording}/2 - enough readings</li>
                                <li>Calculation: {attempt.score.calculation}/2 - gradient</li>
                                <li>Reasoning: {attempt.score.reasoning}/2 - conclusion</li>
                            </ul>
                            <p className="mt-4 rounded-lg bg-white p-3 text-sm text-[#55584F]"><strong>Next improvement:</strong> {nextStep}</p>
                            {challenge && challenge.creatorScore && (
                                <div className="mt-4 rounded-lg bg-white p-3 text-sm text-[#55584F]">
                                    <p className="font-semibold">Friend challenge</p>
                                    <p className="mt-1">Same task · {challenge.creatorScore.total}/{challenge.creatorScore.maximum} to beat</p>
                                    {challenge.opponentScore ? (
                                        <p className="mt-1 font-semibold text-[#66734F]">Your result: {challenge.opponentScore.total}/{challenge.opponentScore.maximum}</p>
                                    ) : challengeFromLink && attempt.submitted && attempt.seed === challenge.seed ? (
                                        <button type="button" onClick={submitChallengeResult} className="mt-2 rounded-lg bg-[#66734F] px-3 py-2 text-xs font-bold text-white">Submit challenge result</button>
                                    ) : null}
                                </div>
                            )}
                            {!challenge && (
                                <button type="button" onClick={createChallenge} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#87966A] px-4 py-2 text-sm font-semibold text-[#596443]">
                                    <Share2 size={15} /> {challengeShared ? "Challenge link copied" : "Challenge a friend"}
                                </button>
                            )}
                            <button type="button" onClick={reset} className="mt-4 rounded-lg border border-[#87966A] px-4 py-2 text-sm font-semibold text-[#596443]">Try again with a new task</button>
                        </div>}
                    </section>
                </div>
            </div>
        </main>
    );
}
