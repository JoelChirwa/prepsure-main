import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Bookmark,
    BookmarkCheck,
    CheckCircle2,
    ClipboardList,
    FlaskConical,
    ShieldCheck,
    Target,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getExperimentBySlug } from "../lib/api";
import { useStudentAuth } from "../context/StudentAuthContext";
import { studentSavedApi } from "../lib/studentSavedApi";
import { studentCompletionApi } from "../lib/studentCompletionApi";

function ContentSection({ title, icon: Icon, children }) {
    return (
        <Card className="rounded-2xl border-[#E1E2D9] bg-white shadow-sm">
            <CardContent className="p-5 sm:p-6">
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-[#E7EADF] text-[#66734F]">
                        <Icon size={20} />
                    </div>
                    <h2 className="text-lg font-semibold text-[#30332C]">{title}</h2>
                </div>
                {children}
            </CardContent>
        </Card>
    );
}

export default function ExperimentDetail() {
    const { id } = useParams();
    const [experiment, setExperiment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { student } = useStudentAuth();

    const [isSaved, setIsSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [bookmarkMessage, setBookmarkMessage] = useState("");
    const [bookmarkError, setBookmarkError] = useState("");
    const [bookmarkChecking, setBookmarkChecking] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [completionChecking, setCompletionChecking] = useState(false);
    const [completionSaving, setCompletionSaving] = useState(false);
    const [completionError, setCompletionError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function checkSavedStatus() {
            if (!student) {
                setIsSaved(false);
                setBookmarkChecking(false);
                return;
            }

            setBookmarkChecking(true);

            try {
                const token = sessionStorage.getItem("prepsure_student_token");
                const data = await studentSavedApi.getAll(token);

                const savedExperiments = data.experiments || [];
                const currentExperimentId = String(experiment?._id || experiment?.id || "");

                const saved = savedExperiments.some((item) => {
                    const savedExperiment = item.experiment;

                    const savedExperimentId =
                        savedExperiment?._id || savedExperiment?.id;

                    return (
                        currentExperimentId &&
                        savedExperimentId &&
                        String(savedExperimentId) === currentExperimentId
                    );
                });

                if (!cancelled) setIsSaved(saved);
            } catch {
                if (!cancelled) {
                    setBookmarkError("Could not check your saved experiments.");
                }
            } finally {
                if (!cancelled) setBookmarkChecking(false);
            }
        }

        if (experiment) checkSavedStatus();

        return () => {
            cancelled = true;
        };
    }, [student, experiment]);

    useEffect(() => {
        let cancelled = false;

        async function checkCompletionStatus() {
            if (!student || !experiment?._id) {
                setIsCompleted(false);
                setCompletionChecking(false);
                return;
            }

            setCompletionChecking(true);

            try {
                const token = sessionStorage.getItem("prepsure_student_token");
                const status = await studentCompletionApi.getStatus(
                    experiment._id,
                    token
                );

                if (!cancelled) setIsCompleted(status.completed);
            } catch (err) {
                if (!cancelled) {
                    setCompletionError(
                        err.message || "Could not check completion status."
                    );
                }
            } finally {
                if (!cancelled) setCompletionChecking(false);
            }
        }

        if (experiment) checkCompletionStatus();

        return () => {
            cancelled = true;
        };
    }, [student, experiment]);

    async function handleBookmark() {
        if (!student) {
            setBookmarkError("Create a student account to save experiments.");
            return;
        }

        setSaving(true);
        setBookmarkMessage("");
        setBookmarkError("");

        try {
            const token = sessionStorage.getItem("prepsure_student_token");

            if (isSaved) {
                await studentSavedApi.remove(experiment._id, token);
                setIsSaved(false);
                setBookmarkMessage("Experiment removed from your saved list.");
            } else {
                await studentSavedApi.save(experiment._id, token);
                setIsSaved(true);
                setBookmarkMessage("Experiment saved successfully.");
            }
        } catch (err) {
            setBookmarkError(err.message || "Could not update your saved experiments.");
        } finally {
            setSaving(false);
        }
    }

    async function handleMarkComplete() {
        if (!student) {
            setCompletionError("Log in with a student account to track completion.");
            return;
        }

        setCompletionSaving(true);
        setCompletionError("");

        try {
            const token = sessionStorage.getItem("prepsure_student_token");
            await studentCompletionApi.markComplete(experiment._id, token);
            setIsCompleted(true);
        } catch (err) {
            setCompletionError(
                err.message || "Could not update your experiment progress."
            );
        } finally {
            setCompletionSaving(false);
        }
    }


    useEffect(() => {
        let cancelled = false;

        async function loadExperiment() {
            setLoading(true);
            setError("");
            setExperiment(null);

            try {
                const data = await getExperimentBySlug(id);

                if (!cancelled) {
                    setExperiment(data);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || "Could not load this experiment.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadExperiment();

        return () => {
            cancelled = true;
        };
    }, [id]);

    if (loading) {
        return (
            <main className="p-8 text-sm text-[#686B62]">
                Loading experiment...
            </main>
        );
    }

    if (error || !experiment) {
        return (
            <main className="mx-auto max-w-3xl p-5 sm:p-8">
                <h1 className="text-2xl font-bold text-[#30332C]">
                    {error || "Experiment not found"}
                </h1>
                <Button asChild className="mt-5">
                    <Link to="/experiments">Back to library</Link>
                </Button>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-5xl space-y-6 p-5 sm:p-8">
            <Button asChild variant="ghost" className="-ml-3 rounded-xl">
                <Link to="/experiments">
                    <ArrowLeft size={17} />
                    Back to experiment library
                </Link>
            </Button>

            <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#39452D] to-[#738258] p-6 text-white sm:p-9">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                        {experiment.category}
                    </span>
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                        {experiment.difficulty}
                    </span>
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                        {experiment.duration}
                    </span>
                </div>

                <div className="mt-5 flex items-start gap-4">
                    <div className="hidden rounded-2xl bg-white/10 p-3 sm:block">
                        <FlaskConical size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
                            {experiment.title}
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#E6E9DF] sm:text-base">
                            {experiment.summary}
                        </p>

                        <div className="mt-5">
                            <Button
                                type="button"
                                onClick={handleBookmark}
                                disabled={saving || bookmarkChecking || !experiment?._id}
                                variant="secondary"
                                className="rounded-xl"
                            >
                                {isSaved ? (
                                    <BookmarkCheck size={17} className="mr-2" />
                                ) : (
                                    <Bookmark size={17} className="mr-2" />
                                )}

                                {saving
                                    ? "Updating..."
                                    : bookmarkChecking
                                      ? "Checking saved status..."
                                      : isSaved
                                        ? "Remove saved experiment"
                                        : "Save experiment"}
                            </Button>

                            <Button
                                type="button"
                                onClick={handleMarkComplete}
                                disabled={completionSaving || completionChecking || isCompleted || !experiment?._id}
                                variant={isCompleted ? "outline" : "secondary"}
                                className="ml-2 rounded-xl"
                            >
                                <CheckCircle2 size={17} className="mr-2" />
                                {completionSaving
                                    ? "Saving..."
                                    : completionChecking
                                      ? "Checking progress..."
                                      : isCompleted
                                        ? "Experiment completed"
                                        : "Mark as completed"}
                            </Button>

                            {!student && (
                                <p className="mt-2 text-sm text-[#E6E9DF]">
                                    Create a student account to save this experiment.{" "}
                                    <Link
                                        to="/student/register"
                                        className="font-semibold underline underline-offset-4"
                                    >
                                        Get started
                                    </Link>
                                </p>
                            )}

                            {bookmarkMessage && (
                                <p role="status" className="mt-3 text-sm text-[#E6E9DF]">
                                    {bookmarkMessage}
                                </p>
                            )}

                            {bookmarkError && (
                                <p role="alert" className="mt-3 text-sm text-amber-100">
                                    {bookmarkError}
                                </p>
                            )}

                            {completionError && (
                                <p role="alert" className="mt-3 text-sm text-amber-100">
                                    {completionError}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <ContentSection title="Learning objectives" icon={Target}>
                <ul className="space-y-3">
                    {experiment.objectives?.map((objective) => (
                        <li key={objective} className="flex items-start gap-3 text-sm leading-6 text-[#55584F]">
                            <CheckCircle2
                                size={18}
                                className="mt-1 shrink-0 text-[#66734F]"
                            />
                            <span>{objective}</span>
                        </li>
                    ))}
                </ul>
            </ContentSection>

            {experiment.theory && (
                <ContentSection title="Scientific theory" icon={FlaskConical}>
                    <p className="whitespace-pre-line text-sm leading-7 text-[#55584F]">
                        {experiment.theory}
                    </p>
                </ContentSection>
            )}

            {experiment.apparatusImages?.length > 0 && (
                <ContentSection title="Apparatus images" icon={FlaskConical}>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {experiment.apparatusImages.map((imageUrl) => (
                            <img
                                key={imageUrl}
                                src={imageUrl}
                                alt={`Apparatus for ${experiment.title}`}
                                loading="lazy"
                                className="max-h-96 w-full rounded-xl border border-[#E1E2D9] bg-[#F7F7F2] object-contain"
                            />
                        ))}
                    </div>
                </ContentSection>
            )}

            <div className="grid gap-5 lg:grid-cols-2">
                <ContentSection title="Apparatus and materials" icon={FlaskConical}>
                    <ul className="list-inside list-disc space-y-2 text-sm leading-6 text-[#55584F] marker:text-[#87966A]">
                        {experiment.apparatus?.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </ContentSection>

                <ContentSection title="Safety precautions" icon={ShieldCheck}>
                    <ul className="space-y-3">
                        {experiment.safety?.map((item) => (
                            <li key={item} className="flex items-start gap-3 text-sm leading-6 text-[#55584F]">
                                <ShieldCheck
                                    size={17}
                                    className="mt-1 shrink-0 text-[#8A6D37]"
                                />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </ContentSection>
            </div>

            <ContentSection title="Procedure" icon={ClipboardList}>
                <ol className="space-y-4">
                    {experiment.procedure?.map((step, index) => (
                        <li key={step} className="flex items-start gap-4">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#E7EADF] text-sm font-semibold text-[#596443]">
                                {index + 1}
                            </span>
                            <p className="pt-1 text-sm leading-6 text-[#55584F]">{step}</p>
                        </li>
                    ))}
                </ol>
            </ContentSection>

            <ContentSection title="Observations" icon={ClipboardList}>
                {experiment.observations?.length > 0 ? (
                    <div className="space-y-3">
                        {experiment.observations.map((observation, index) => (
                            <div
                                key={`${observation.test || "observation"}-${index}`}
                                className="rounded-xl border border-[#E1E2D9] p-4"
                            >
                                <h3 className="text-sm font-semibold text-[#30332C]">
                                    {observation.test || `Observation ${index + 1}`}
                                </h3>

                                <p className="mt-1 text-sm leading-6 text-[#55584F]">
                                    {observation.result || "No result recorded."}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm leading-6 text-[#686B62]">
                        No observations have been added for this experiment yet.
                    </p>
                )}

                <p className="mt-4 text-xs leading-5 text-[#686B62]">
                    Record the actual observations from your practical work. Do not
                    substitute expected results for what you observe.
                </p>
            </ContentSection>

            <ContentSection title="Conclusion" icon={CheckCircle2}>
                <p className="text-sm leading-7 text-[#55584F]">
                    {experiment.conclusion}
                </p>
            </ContentSection>

            <div className="flex flex-wrap gap-3 pb-6">
                <Button asChild className="rounded-xl">
                    <Link to="/experiments">Explore more experiments</Link>
                </Button>
            </div>
        </main>
    );
}
