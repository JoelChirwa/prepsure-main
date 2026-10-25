
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, BookmarkX, FlaskConical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { studentSavedApi } from "../lib/studentSavedApi";

export default function SavedExperiments() {
    const [experiments, setExperiments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const loadSavedExperiments = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const token = sessionStorage.getItem("prepsure_student_token");

            if (!token) {
                throw new Error("A student account is required to view saved experiments.");
            }

            const data = await studentSavedApi.getAll(token);
            setExperiments(data.experiments || []);
        } catch (err) {
            setError(err.message || "Could not load your saved experiments.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSavedExperiments();
    }, [loadSavedExperiments]);

    async function handleRemove(experimentId) {
        setRemovingId(experimentId);
        setError("");
        setMessage("");

        try {
            const token = sessionStorage.getItem("prepsure_student_token");
            await studentSavedApi.remove(experimentId, token);

            setExperiments((current) =>
                current.filter(
                    (item) => item.experiment?._id !== experimentId
                )
            );

            setMessage("Experiment removed from your saved list.");
        } catch (err) {
            setError(err.message || "Could not remove this experiment.");
        } finally {
            setRemovingId(null);
        }
    }

    if (loading) {
        return (
            <main className="mx-auto max-w-5xl p-6 sm:p-8">
                <p className="text-sm text-[#686B62]">
                    Loading your saved experiments...
                </p>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-5xl space-y-6 p-5 sm:p-8">
            <section>
                <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-[#E7EADF] text-[#66734F]">
                        <Bookmark size={24} />
                    </div>
                    <div>
                        <h1 className="font-heading text-2xl font-bold tracking-tight text-[#30332C] sm:text-3xl">
                            My Saved Experiments
                        </h1>
                        <p className="mt-1 text-sm text-[#686B62]">
                            Keep your important practical experiments close at hand.
                        </p>
                    </div>
                </div>
            </section>

            {error && (
                <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                    {error}
                </div>
            )}

            {message && (
                <p role="status" className="text-sm text-[#596443]">
                    {message}
                </p>
            )}

            {experiments.length === 0 && !error ? (
                <Card className="rounded-2xl border-dashed border-[#C9CCBE] shadow-sm">
                    <CardContent className="flex flex-col items-center px-6 py-12 text-center">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-[#ECEDE6] text-[#686B62]">
                            <Bookmark size={26} />
                        </div>

                        <h2 className="mt-4 text-lg font-semibold text-[#30332C]">
                            No saved experiments yet
                        </h2>

                        <p className="mt-2 max-w-md text-sm leading-6 text-[#686B62]">
                            Browse the experiment library and save experiments
                            you want to revisit later.
                        </p>

                        <Button asChild className="mt-5 rounded-xl">
                            <Link to="/experiments">
                                Explore experiments
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {experiments.map((item) => {
                        const experiment = item.experiment;

                        if (!experiment?._id) return null;

                        return (
                            <Card
                                key={item.savedId || experiment._id}
                                className="rounded-2xl border-[#E1E2D9] bg-white shadow-sm"
                            >
                                <CardContent className="p-5">
                                    <div className="flex items-start gap-3">
                                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#E7EADF] text-[#66734F]">
                                            <FlaskConical size={22} />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <h2 className="font-semibold leading-6 text-[#30332C]">
                                                {experiment.title}
                                            </h2>
                                            <p className="mt-1 text-sm text-[#686B62]">
                                                {experiment.category}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#55584F]">
                                        {experiment.summary}
                                    </p>

                                    <div className="mt-4 flex flex-wrap items-center gap-2">
                                        <span className="rounded-full bg-[#ECEDE6] px-3 py-1 text-xs font-medium text-[#55584F]">
                                            {experiment.difficulty}
                                        </span>
                                        <span className="rounded-full bg-[#ECEDE6] px-3 py-1 text-xs font-medium text-[#55584F]">
                                            {experiment.duration}
                                        </span>
                                    </div>

                                    <div className="mt-5 flex flex-wrap gap-2">
                                        <Button asChild className="rounded-xl">
                                            <Link
                                                to={`/experiments/${experiment.slug || experiment._id}`}
                                            >
                                                View experiment
                                            </Link>
                                        </Button>

                                        <Button
                                            variant="outline"
                                            className="rounded-xl"
                                            disabled={removingId === experiment._id}
                                            onClick={() => handleRemove(experiment._id)}
                                        >
                                            <BookmarkX size={16} className="mr-2" />
                                            {removingId === experiment._id
                                                ? "Removing..."
                                                : "Remove"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            <div className="pt-2">
                <Button asChild variant="ghost" className="rounded-xl">
                    <Link to="/experiments">Back to experiment library</Link>
                </Button>
            </div>
        </main>
    );
}
