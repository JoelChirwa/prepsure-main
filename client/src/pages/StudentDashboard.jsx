import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Download,
  Target,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getStudentProgress } from "../lib/studentProgressApi";
import { getPackState } from "../lib/contentPacks";

const learningActions = [
  {
    title: "Ohm's law simulation",
    description:
      "Run a seeded practical, record readings, plot your graph, and get immediate marking.",
    icon: Target,
    to: "/simulate/ohms-law",
    action: "Open simulation",
    iconStyle: "bg-[#E7EADF] text-[#66734F]",
  },
  {
    title: "Practical guides",
    description:
      "Review experiment procedures, apparatus, objectives, and safety guidance.",
    icon: BookOpen,
    to: "/experiments",
    action: "Browse guides",
    iconStyle: "bg-[#F1EBDD] text-[#8A6D37]",
  },
];

export default function StudentDashboard() {
  const [progress, setProgress] = useState(null);
  const [progressError, setProgressError] = useState("");
  const [savedAttempt] = useState(() => {
    try {
      const rawAttempt = localStorage.getItem("prepsure:ohms-law:attempt");
      return rawAttempt ? JSON.parse(rawAttempt) : null;
    } catch {
      return null;
    }
  });
  const [packState] = useState(() => getPackState("ohms-law"));
  const weakSkill = progress?.simulations?.skills
    ?.filter((skill) => skill.percentage !== null)
    .sort((left, right) => left.percentage - right.percentage)[0];

  useEffect(() => {
    let active = true;

    async function loadProgress() {
      const token = sessionStorage.getItem("prepsure_student_token");

      try {
        const summary = await getStudentProgress(token);
        if (active) setProgress(summary);
      } catch (err) {
        if (active) setProgressError(
          err.message || "Could not load your learning progress."
        );
      }
    }

    loadProgress();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#F7F7F2]">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* Welcome banner */}
        <section className="mt-8 overflow-hidden rounded-2xl bg-gradient-to-br from-[#39452D] via-[#566440] to-[#738258] p-6 text-white shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-[#F0EFE7]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Offline practical learning
              </span>

              <h2 className="mt-4 text-xl font-bold sm:text-2xl">
                Build confidence by doing the practical.
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#E6E9DF]">
                Use the Ohm&apos;s law simulation to connect a circuit, collect
                readings, plot a graph, and improve from your marking report.
              </p>
            </div>

            <Link
              to="/simulate/ohms-law"
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-[#F0EFE7] px-5 py-3 text-sm font-bold text-[#34402A] transition hover:bg-white sm:self-center"
            >
              Start practical
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="mt-8" aria-labelledby="practice-plan-heading">
          <div className="mb-4">
            <h2 id="practice-plan-heading" className="font-heading text-lg font-bold text-[#30332C]">
              Your practice plan
            </h2>
            <p className="mt-1 text-sm text-[#686B62]">Short, repeatable practical sessions that build exam confidence.</p>
          </div>

          {!savedAttempt ? (
            <Card className="rounded-2xl border-[#B8C39A] bg-white shadow-sm">
              <CardContent className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-[#30332C]">Start your first practical</p>
                  <p className="mt-1 text-sm text-[#686B62]">Try a guided, randomised Ohm&apos;s law task. Your attempt is saved on this device.</p>
                </div>
                <Link to="/simulate/ohms-law" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#66734F] px-4 py-3 text-sm font-bold text-white hover:bg-[#455333]">Start practical <ArrowRight size={16} /></Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="rounded-2xl border-[#E1E2D9] bg-white shadow-sm">
                <CardContent className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#66734F]">Continue</p>
                  <p className="mt-2 font-semibold text-[#30332C]">{savedAttempt.submitted ? "Review your last result" : "Ohm&apos;s law practical"}</p>
                  <Link to="/simulate/ohms-law" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#66734F]">Open <ArrowRight size={14} /></Link>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-[#E1E2D9] bg-white shadow-sm">
                <CardContent className="flex items-start gap-4 p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E7EADF] text-[#66734F]">
                    <Download className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#686B62]">Offline pack</p>
                    <p className="mt-1 text-lg font-semibold text-[#30332C]">
                      {packState?.status === "downloaded"
                        ? "Ready offline"
                        : packState?.status === "paused"
                          ? "Paused"
                          : "Not downloaded"}
                    </p>
                    <p className="mt-1 text-sm leading-5 text-[#686B62]">
                      {packState?.status === "downloaded"
                        ? "Ohm&apos;s law is available on this device."
                        : "Open the simulation to prepare it for offline use."}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-[#E1E2D9] bg-white shadow-sm">
                <CardContent className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#66734F]">Today&apos;s practice</p>
                  <p className="mt-2 font-semibold text-[#30332C]">New randomised task</p>
                  <Link to="/simulate/ohms-law" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#66734F]">Practise <ArrowRight size={14} /></Link>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-[#E1E2D9] bg-white shadow-sm">
                <CardContent className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#66734F]">Weak spot</p>
                  <p className="mt-2 font-semibold text-[#30332C]">
                    {weakSkill ? weakSkill.skill : "Recording and graphing"}
                  </p>
                  <Link to="/simulate/ohms-law" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#66734F]">Practise this <ArrowRight size={14} /></Link>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-[#E1E2D9] bg-white shadow-sm">
                <CardContent className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#66734F]">Practice focus</p>
                  <p className="mt-2 font-semibold text-[#30332C]">
                    {weakSkill ? `Improve ${weakSkill.skill}` : "Build practical confidence"}
                  </p>
                  <Link to="/simulate/ohms-law" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#66734F]">Start a task <ArrowRight size={14} /></Link>
                </CardContent>
              </Card>
            </div>
          )}
        </section>

        {/* Overview cards */}
        <section className="mt-8" aria-labelledby="overview-heading">
          <div className="mb-4">
            <h2
              id="overview-heading"
              className="font-heading text-lg font-bold text-[#30332C]"
            >
              Your learning overview
            </h2>
            <p className="mt-1 text-sm text-[#686B62]">
              Your study tools, all in one place.
            </p>
          </div>

          {progressError && (
            <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {progressError}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="rounded-2xl border-[#E1E2D9] bg-white shadow-sm">
              <CardContent className="flex items-start gap-4 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E7EADF] text-[#66734F]">
                  <BookOpen className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-medium text-[#686B62]">
                    Experiments
                  </p>
                  <p className="mt-1 text-lg font-semibold text-[#30332C]">
                    Ready to explore
                  </p>
                  <p className="mt-1 text-sm leading-5 text-[#686B62]">
                    Browse practical science guides.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-[#E1E2D9] bg-white shadow-sm">
              <CardContent className="flex items-start gap-4 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E7EADF] text-[#66734F]">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-medium text-[#686B62]">
                    Completed experiments
                  </p>
                  <p className="mt-1 text-lg font-semibold text-[#30332C]">
                    {progress
                      ? `${progress.experiments.completed} / ${progress.experiments.available}`
                      : progressError ? "Unavailable" : "Loading..."}
                  </p>
                  <p className="mt-1 text-sm leading-5 text-[#686B62]">
                    Published practical guides you have completed.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-[#E1E2D9] bg-white shadow-sm sm:col-span-2 lg:col-span-1">
              <CardContent className="flex items-start gap-4 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E7EADF] text-[#66734F]">
                  <Target className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-medium text-[#686B62]">
                    Simulation attempts
                  </p>
                  <p className="mt-1 text-lg font-semibold text-[#30332C]">
                    {progress
                      ? progress.simulations.attempts
                      : progressError ? "Unavailable" : "Loading..."}
                  </p>
                  <p className="mt-1 text-sm leading-5 text-[#686B62]">
                    Saved practical attempts
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-[#E1E2D9] bg-white shadow-sm sm:col-span-2 lg:col-span-1">
              <CardContent className="flex items-start gap-4 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E7EADF] text-[#66734F]">
                  <CalendarDays className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-medium text-[#686B62]">
                    Study streak
                  </p>
                  <p className="mt-1 text-lg font-semibold text-[#30332C]">
                    {progress
                      ? `${progress.studyStreak.currentDays} ${progress.studyStreak.currentDays === 1 ? "day" : "days"}`
                      : progressError ? "Unavailable" : "Loading..."}
                  </p>
                  <p className="mt-1 text-sm leading-5 text-[#686B62]">
                    Consecutive UTC days with practical learning activity.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-2" aria-label="Learning insights">
          <Card className="rounded-2xl border-[#E1E2D9] bg-white shadow-sm">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E7EADF] text-[#66734F]">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-[#30332C]">Skills map</h2>
                  <p className="text-sm text-[#686B62]">Based on your marked practical attempts</p>
                </div>
              </div>
              {!progress ? (
                <p className="mt-5 text-sm text-[#686B62]">
                  {progressError || "Loading topic results..."}
                </p>
              ) : progress.simulations.skills.every((skill) => skill.percentage === null) ? (
                <p className="mt-5 text-sm leading-6 text-[#686B62]">
                  Complete a practical to start building your skills map.
                </p>
              ) : (
                <div className="mt-5 space-y-4">
                  {progress.simulations.skills.map((skill) => (
                    <div key={skill.skill}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-[#30332C]">{skill.skill}</span>
                        <span className="text-[#686B62]">
                          {skill.percentage === null ? "Not started" : `${skill.percentage}%`}
                        </span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-[#ECEDE6]">
                        <div
                          className="h-2 rounded-full bg-[#66734F]"
                          style={{ width: `${skill.percentage || 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[#E1E2D9] bg-white shadow-sm">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E7EADF] text-[#66734F]">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-[#30332C]">Practical trend</h2>
                  <p className="text-sm text-[#686B62]">Recent simulation performance</p>
                </div>
              </div>
              {!progress ? (
                <p className="mt-5 text-sm text-[#686B62]">
                  {progressError || "Loading score trend..."}
                </p>
              ) : progress.simulations.scoreTrend.status === "insufficient-data" ? (
                <p className="mt-5 text-sm leading-6 text-[#686B62]">
                  Complete at least four practicals to compare your recent scores.
                </p>
              ) : (
                <p className="mt-5 text-sm leading-6 text-[#30332C]">
                  {progress.simulations.scoreTrend.status === "stable"
                    ? `Your average score is stable, changing by ${Math.abs(progress.simulations.scoreTrend.change)} points from ${progress.simulations.scoreTrend.previousAverage}% to ${progress.simulations.scoreTrend.recentAverage}%.`
                    : `Your average score is ${progress.simulations.scoreTrend.status} by ${Math.abs(progress.simulations.scoreTrend.change)} points, from ${progress.simulations.scoreTrend.previousAverage}% to ${progress.simulations.scoreTrend.recentAverage}%.`}
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="mt-8" aria-labelledby="attempt-history-heading">
          <div className="mb-4">
            <h2 id="attempt-history-heading" className="font-heading text-lg font-bold text-[#30332C]">
              Attempt history
            </h2>
            <p className="mt-1 text-sm text-[#686B62]">Your latest marked practical attempts.</p>
          </div>
          {!progress ? (
            <p className="text-sm text-[#686B62]">{progressError || "Loading attempt history..."}</p>
          ) : progress.simulations.history.length === 0 ? (
            <Card className="rounded-2xl border-[#E1E2D9] bg-white shadow-sm">
              <CardContent className="p-5 text-sm leading-6 text-[#686B62]">
                Your completed practicals will appear here.
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-2xl border-[#E1E2D9] bg-white shadow-sm">
              <CardContent className="divide-y divide-[#ECEDE6] p-0">
                {progress.simulations.history.map((attempt) => (
                  <div key={attempt.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <div>
                      <p className="font-semibold text-[#30332C]">Ohm&apos;s law practical</p>
                      <p className="mt-1 text-xs capitalize text-[#686B62]">
                        {attempt.mode} · {new Date(attempt.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="font-heading text-lg font-bold text-[#66734F]">
                      {attempt.score.total}/{attempt.score.maximum}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </section>

        <section className="mt-8" aria-labelledby="recommendations-heading">
          <div className="mb-4">
            <h2 id="recommendations-heading" className="font-heading text-lg font-bold text-[#30332C]">
              Recommended next steps
            </h2>
            <p className="mt-1 text-sm text-[#686B62]">
              Suggestions from your practical skills and recent attempts.
            </p>
          </div>
          {!progress ? (
            <p className="text-sm text-[#686B62]">
              {progressError || "Loading recommendations..."}
            </p>
          ) : progress.recommendations.length === 0 ? (
            <Card className="rounded-2xl border-[#E1E2D9] bg-white shadow-sm">
              <CardContent className="p-5 text-sm leading-6 text-[#686B62]">
                Complete a practical to receive a focused skill recommendation.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {progress.recommendations.map((recommendation) => (
                <Card key={`${recommendation.href}-${recommendation.title}`} className="rounded-2xl border-[#E1E2D9] bg-white shadow-sm">
                  <CardContent className="flex h-full flex-col p-5">
                    <h3 className="font-semibold text-[#30332C]">{recommendation.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-6 text-[#686B62]">
                      {recommendation.description}
                    </p>
                    <Link
                      to={recommendation.href}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#66734F] transition-colors hover:text-[#455333]"
                    >
                      Open recommendation
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Learning actions */}
        <section className="mt-10" aria-labelledby="learning-heading">
          <div className="mb-4">
            <h2
              id="learning-heading"
              className="font-heading text-lg font-bold text-[#30332C]"
            >
              Continue learning
            </h2>
            <p className="mt-1 text-sm text-[#686B62]">
              Practise, review, or prepare an offline simulation.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {learningActions.map((item) => {
              const Icon = item.icon;

              return (
                <Card
                  key={item.title}
                  className="group rounded-2xl border-[#E1E2D9] bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#B8C39A] hover:shadow-md"
                >
                  <CardContent className="flex h-full flex-col p-6">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.iconStyle}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>

                    <h3 className="mt-5 text-base font-semibold text-[#30332C]">
                      {item.title}
                    </h3>

                    <p className="mt-2 flex-1 text-sm leading-6 text-[#55584F]">
                      {item.description}
                    </p>

                    <Link
                      to={item.to}
                      className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#66734F] transition-colors hover:text-[#455333]"
                    >
                      {item.action}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Study reminder */}
        <section className="mt-8 rounded-2xl border border-[#E1E2D9] bg-white p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F1EBDD] text-[#8A6D37]">
              <BookOpen className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-[#30332C]">
                A small step makes progress
              </h2>
              <p className="mt-1 text-sm leading-6 text-[#55584F]">
                Start with a guided practical, then use your skills map to
                choose what to practise next. Download the simulation when
                you expect to be offline.
              </p>
            </div>
          </div>
        </section>

        <footer className="mt-8 border-t border-[#D9DACE] py-5 text-center text-xs text-[#686B62]">
          PrepSure · Practical science preparation
        </footer>
      </div>
    </main>
  );
}