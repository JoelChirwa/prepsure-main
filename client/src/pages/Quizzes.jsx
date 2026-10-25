import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  HelpCircle,
  Sparkles,
  Target,
} from "lucide-react";
import { useStudentAuth } from "../context/StudentAuthContext";
import { studentQuizApi } from "../lib/quizApi";

const difficultyStyles = {
  Beginner: "bg-[#E7EADF] text-[#596443]",
  Intermediate: "bg-[#F1EBDD] text-[#8A6D37]",
  Advanced: "bg-[#EEEAF4] text-[#685580]",
};

export default function Quizzes() {
  const { student } = useStudentAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const token = sessionStorage.getItem("prepsure_student_token");

  useEffect(() => {
    let active = true;
    async function loadQuizData() {
      setLoading(true);
      setError("");
      const results = await Promise.allSettled([
        studentQuizApi.list(token),
        studentQuizApi.listAttempts(token),
      ]);
      if (!active) return;

      if (results[0].status === "fulfilled") {
        setQuizzes(results[0].value.quizzes || []);
      } else {
        setError(results[0].reason.message || "Could not load quizzes.");
      }
      if (results[1].status === "fulfilled") {
        setAttempts(results[1].value.attempts || []);
      } else if (results[0].status === "fulfilled") {
        setError("Quiz attempt history could not be loaded.");
      }
      setLoading(false);
    }
    loadQuizData();
    return () => {
      active = false;
    };
  }, [token]);

  const subjects = [
    "All",
    ...new Set(quizzes.map((quiz) => quiz.subject).filter(Boolean)),
  ];
  const filteredQuizzes = selectedSubject === "All"
    ? quizzes
    : quizzes.filter((quiz) => quiz.subject === selectedSubject);

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-5 sm:p-8">
      <Link
        to="/student"
        className="-ml-3 inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-[#55584F] transition hover:bg-[#ECEDE6] hover:text-[#30332C]"
      >
          <ArrowLeft size={17} />
          Back to dashboard
      </Link>

      {/* Header banner */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#39452D] via-[#566440] to-[#738258] p-6 text-white sm:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-[#F0EFE7]">
              <Sparkles className="h-3.5 w-3.5" />
              Practical Exam Practice
            </span>

            <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
              Practice Quizzes
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#E6E9DF] sm:text-base">
              Test your understanding of laboratory procedures, apparatus handling,
              experimental observations, and safety precautions.
            </p>
          </div>

          <div className="hidden rounded-2xl bg-white/10 p-4 sm:block">
            <Target size={38} className="text-white" />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#E1E2D9] bg-white p-5">
        <h2 className="font-semibold text-[#30332C]">
          Welcome{student?.name ? `, ${student.name.split(/\s+/)[0]}` : ""}
        </h2>
        <p className="mt-1 text-sm text-[#686B62]">
          Your completed practice attempts are saved here for later review.
        </p>
      </section>

      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </p>
      )}

      {/* Subject filters */}
      <div className="flex flex-wrap items-center gap-2">
        {subjects.map((subj) => (
          <button
            key={subj}
            type="button"
            onClick={() => setSelectedSubject(subj)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              selectedSubject === subj
                ? "bg-[#66734F] text-white shadow-sm"
                : "border border-[#D9DACE] bg-white text-[#55584F] hover:bg-[#F5F6F0] hover:text-[#30332C]"
            }`}
          >
            {subj === "All" ? "All subjects" : subj}
          </button>
        ))}
      </div>

      {/* Quiz cards grid */}
      <div className="grid gap-5 md:grid-cols-2">
        {loading ? (
          <p className="col-span-full py-12 text-center text-sm text-[#686B62]">
            Loading published quizzes...
          </p>
        ) : filteredQuizzes.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-[#E1E2D9] bg-white px-6 py-14 text-center">
            <Target className="mx-auto size-9 text-[#85897D]" />
            <h2 className="mt-3 font-semibold text-[#30332C]">
              {quizzes.length ? "No quizzes for this subject" : "No quizzes published yet"}
            </h2>
            <p className="mt-1 text-sm text-[#686B62]">
              {quizzes.length
                ? "Choose another subject to see available practice."
                : "Published quizzes will appear here when they are ready."}
            </p>
          </div>
        ) : filteredQuizzes.map((quiz) => (
          <article
            key={quiz._id}
            className="flex flex-col rounded-2xl border border-[#E1E2D9] bg-white shadow-sm transition hover:border-[#B8C39A] hover:shadow-md"
          >
            <div className="flex flex-1 flex-col p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#ECEDE6] px-3 py-1 text-xs font-medium text-[#55584F]">
                  {quiz.subject}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${difficultyStyles[quiz.difficulty] || "bg-[#ECEDE6] text-[#55584F]"}`}
                >
                  {quiz.difficulty}
                </span>
                <span className="rounded-full bg-[#F5F6F0] px-3 py-1 text-xs font-medium text-[#686B62]">
                  {quiz.topic}
                </span>
              </div>

              <h2 className="mt-4 text-lg font-semibold text-[#30332C]">
                {quiz.title}
              </h2>

              <p className="mt-2 flex-1 text-sm leading-6 text-[#55584F]">
                {quiz.description}
              </p>

              <div className="mt-5 flex items-center gap-4 text-xs font-medium text-[#686B62]">
                <span className="flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4 text-[#85897D]" />
                  {quiz.questionCount} questions
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-[#85897D]" />
                  {quiz.durationMinutes} mins
                </span>
              </div>

              <div className="mt-5 border-t border-[#ECEDE6] pt-4">
                <Link
                  to={`/quizzes/${quiz._id}`}
                  className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-[#34402A] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#455333] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#66734F] focus-visible:ring-offset-2"
                >
                  Practice
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      {attempts.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-[#E1E2D9] bg-white">
          <div className="border-b border-[#ECEDE6] px-5 py-4">
            <h2 className="font-semibold text-[#30332C]">Recent attempts</h2>
            <p className="mt-1 text-sm text-[#686B62]">
              Review scores and explanations from completed quizzes.
            </p>
          </div>
          <ul className="divide-y divide-[#ECEDE6]">
            {attempts.slice(0, 5).map((attempt) => (
              <li key={attempt._id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="font-medium text-[#30332C]">{attempt.quizTitle}</p>
                  <p className="mt-1 text-xs text-[#686B62]">
                    {new Date(attempt.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-[#30332C]">
                    {attempt.score}/{attempt.totalQuestions} · {attempt.percentage}%
                  </span>
                  <Link
                    to={`/quizzes/attempts/${attempt._id}`}
                    className="text-sm font-semibold text-[#455333] hover:underline"
                  >
                    Review
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
