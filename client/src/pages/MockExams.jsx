import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Clock3, ShieldCheck, Timer } from "lucide-react";
import { studentMockExamApi } from "../lib/quizApi";

export default function MockExams() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("prepsure_student_token");
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    studentMockExamApi.list(token)
      .then(({ exams: loadedExams }) => {
        if (active) setExams(loadedExams || []);
      })
      .catch((err) => {
        if (active) setError(err.message || "Could not load mock exams.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);

  async function openExam(exam) {
    setStartingId(exam._id);
    setError("");
    try {
      const requestId = globalThis.crypto.randomUUID();
      const { attempt } = await studentMockExamApi.start(token, exam._id, requestId);
      navigate(`/mock-exams/attempts/${attempt._id}`);
    } catch (err) {
      setError(err.message || "Could not start this mock exam.");
    } finally {
      setStartingId(null);
    }
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-5 sm:p-8">
      <Link
        to="/student"
        className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-semibold text-[#596443] hover:text-[#30332C]"
      >
        <ArrowLeft className="size-4" />
        Back to dashboard
      </Link>

      <section className="rounded-3xl bg-gradient-to-br from-[#39452D] via-[#566440] to-[#738258] p-6 text-white sm:p-8">
        <div className="flex items-start gap-4">
          <div className="hidden rounded-2xl bg-white/10 p-4 sm:block">
            <Timer className="size-9" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white/75">TIMED PRACTICE</p>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Mock practical exams</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/85">
              Practice under exam conditions. Your timer and answers are saved by the server,
              so you can resume after a refresh while time remains.
            </p>
          </div>
        </div>
      </section>

      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </p>
      )}

      <section className="grid gap-5 md:grid-cols-2" aria-label="Available mock exams">
        {loading ? (
          <p className="col-span-full py-12 text-center text-sm text-[#686B62]">
            Loading published mock exams...
          </p>
        ) : exams.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-[#E1E2D9] bg-white px-6 py-14 text-center">
            <Timer className="mx-auto size-9 text-[#85897D]" />
            <h2 className="mt-3 font-semibold text-[#30332C]">No mock exams published yet</h2>
            <p className="mt-1 text-sm text-[#686B62]">
              Published practical exams will appear here when they are ready.
            </p>
          </div>
        ) : exams.map((exam) => {
          const active = Boolean(exam.activeAttemptId);
          const exhausted = exam.attemptsRemaining === 0;
          return (
            <article key={exam._id} className="flex flex-col rounded-2xl border border-[#E1E2D9] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-[#ECEDE6] px-3 py-1 text-xs font-medium text-[#55584F]">
                  {exam.subject}
                </span>
                <span className="rounded-full bg-[#F1EBDD] px-3 py-1 text-xs font-medium text-[#8A6D37]">
                  {exam.difficulty}
                </span>
                <span className="rounded-full bg-[#F5F6F0] px-3 py-1 text-xs font-medium text-[#686B62]">
                  {exam.topic}
                </span>
              </div>
              <h2 className="mt-4 text-lg font-semibold text-[#30332C]">{exam.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-[#55584F]">{exam.description}</p>
              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-[#686B62]">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="size-4" /> {exam.questionCount} questions
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="size-4" /> {exam.durationMinutes} minutes
                </span>
                <span>{exam.attemptsUsed}/{exam.attemptLimit} attempts used</span>
              </div>
              <div className="mt-5 border-t border-[#ECEDE6] pt-4">
                {active ? (
                  <Link
                    to={`/mock-exams/attempts/${exam.activeAttemptId}`}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#34402A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#455333]"
                  >
                    Resume exam <ArrowRight className="size-4" />
                  </Link>
                ) : exam.latestAttemptId ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      to={`/mock-exams/attempts/${exam.latestAttemptId}`}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#D9DACE] px-4 py-2 text-sm font-semibold text-[#34402A] hover:bg-[#F5F6F0]"
                    >
                      Review latest result
                    </Link>
                    {!exhausted && (
                      <button
                        type="button"
                        disabled={startingId === exam._id}
                        onClick={() => openExam(exam)}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#34402A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#455333] disabled:opacity-50"
                      >
                        {startingId === exam._id ? "Starting..." : "Try again"}
                        <ArrowRight className="size-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={exhausted || startingId === exam._id}
                    onClick={() => openExam(exam)}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#34402A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#455333] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {startingId === exam._id
                      ? "Starting..."
                      : exhausted
                        ? "No attempts remaining"
                        : "Start mock exam"}
                    {!exhausted && <ArrowRight className="size-4" />}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
