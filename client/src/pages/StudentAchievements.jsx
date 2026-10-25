import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { studentCompletionApi } from "../lib/studentCompletionApi";

const achievements = [
    { threshold: 1, title: "First Practical", description: "Complete your first experiment." },
    { threshold: 5, title: "Consistent Learner", description: "Complete five experiments." },
    { threshold: 10, title: "Practical Pro", description: "Complete ten experiments." },
];

export default function StudentAchievements() {
    const [completedCount, setCompletedCount] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        async function loadProgress() {
            const token = sessionStorage.getItem("prepsure_student_token");

            try {
                const result = await studentCompletionApi.getSummary(token);
                if (active) setCompletedCount(result.count);
            } catch (err) {
                if (active) {
                    setError(err.message || "Could not load achievement progress.");
                }
            }
        }

        loadProgress();
        return () => {
            active = false;
        };
    }, []);

    return (
        <main className="mx-auto max-w-3xl space-y-6 p-5 sm:p-8">
            <Button asChild variant="ghost" className="-ml-3 rounded-xl">
                <Link to="/profile">
                    <ArrowLeft size={17} />
                    Back to profile
                </Link>
            </Button>

            <header>
                <h1 className="text-2xl font-bold text-[#30332C]">Achievements</h1>
                <p className="mt-2 text-sm text-[#686B62]">
                    Milestones are earned from completed practical experiments.
                </p>
            </header>

            {error && (
                <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </p>
            )}

            <div className="space-y-4">
                {achievements.map((achievement) => {
                    const earned = completedCount !== null &&
                        completedCount >= achievement.threshold;

                    return (
                        <Card key={achievement.threshold} className="rounded-2xl border-[#E1E2D9] bg-white shadow-sm">
                            <CardContent className="flex items-center gap-4 p-5">
                                <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${earned ? "bg-[#E7EADF] text-[#66734F]" : "bg-[#ECEDE6] text-[#85897D]"}`}>
                                    {earned ? <CheckCircle2 size={23} /> : <Trophy size={23} />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h2 className="font-semibold text-[#30332C]">{achievement.title}</h2>
                                    <p className="mt-1 text-sm text-[#686B62]">{achievement.description}</p>
                                    <p className="mt-1 text-xs text-[#85897D]">
                                        {completedCount === null
                                            ? "Loading progress..."
                                            : `${Math.min(completedCount, achievement.threshold)} of ${achievement.threshold} completed`}
                                    </p>
                                </div>
                                <span className="text-sm font-semibold text-[#596443]">
                                    {earned ? "Earned" : "In progress"}
                                </span>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </main>
    );
}
