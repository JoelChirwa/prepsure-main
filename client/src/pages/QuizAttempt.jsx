import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { useStudentAuth } from "../context/StudentAuthContext";
import { studentQuizApi } from "../lib/quizApi";

function ReviewAttempt({ attempt }) {
    return (
        <div className="space-y-5">
            <section className="rounded-2xl bg-gradient-to-br from-[#39452D] via-[#566440] to-[#738258] p-6 text-white sm:p-8">
                <p className="text-sm font-semibold text-white/75">QUIZ RESULT</p>
                <h1 className="mt-2 text-2xl font-bold">{attempt.quizTitle}</h1>
                <p className="mt-4 text-3xl font-bold">
                    {attempt.score}/{attempt.totalQuestions}
                    <span className="ml-2 text-xl font-semibold text-white/80">
                        ({attempt.percentage}%)
                    </span>
                </p>
                <p className="mt-2 text-sm text-white/80">
                    Submitted {new Date(attempt.submittedAt).toLocaleString()}
                </p>
            </section>

            {attempt.responses.map((response, index) => {
                const correctOption = response.options.find(
                    (option) => option.id === response.correctOptionId
                );
                const selectedOption = response.options.find(
                    (option) => option.id === response.selectedOptionId
                );

                return (
                    <article
                        key={`${response.questionId}-${index}`}
                        className="rounded-2xl border border-[#E1E2D9] bg-white p-5 sm:p-6"
                    >
                        <div className="flex items-start gap-3">
                            {response.isCorrect ? (
                                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-700" />
                            ) : (
                                <XCircle className="mt-0.5 size-5 shrink-0 text-red-700" />
                            )}
                            <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-wide text-[#686B62]">
                                    Question {index + 1}
                                    {response.topic ? ` · ${response.topic}` : ""}
                                </p>
                                <h2 className="mt-1 font-semibold text-[#30332C]">
                                    {response.prompt}
                                </h2>
                                <p className="mt-3 text-sm text-[#55584F]">
                                    Your answer:{" "}
                                    <span className={response.isCorrect ? "font-semibold text-emerald-800" : "font-semibold text-red-800"}>
                                        {selectedOption?.text || "No answer"}
                                    </span>
                                </p>
                                {!response.isCorrect && (
                                    <p className="mt-1 text-sm text-[#55584F]">
                                        Correct answer:{" "}
                                        <span className="font-semibold text-emerald-800">
                                            {correctOption?.text || "Unavailable"}
                                        </span>
                                    </p>
                                )}
                                {response.explanation && (
                                    <p className="mt-3 rounded-xl bg-[#F5F6F0] p-3 text-sm leading-6 text-[#455333]">
                                        {response.explanation}
                                    </p>
                                )}
                            </div>
                        </div>
                    </article>
                );
            })}
        </div>
    );
}

export default function QuizAttempt() {
    const { id, attemptId } = useParams();
    const { student } = useStudentAuth();
    const token = sessionStorage.getItem("prepsure_student_token");
    const [quiz, setQuiz] = useState(null);
    const [attempt, setAttempt] = useState(null);
    const [answers, setAnswers] = useState({});
    const [requestId] = useState(() => globalThis.crypto.randomUUID());
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        async function load() {
            setLoading(true);
            setError("");
            try {
                if (attemptId) {
                    const data = await studentQuizApi.getAttempt(token, attemptId);
                    if (active) setAttempt(data.attempt);
                } else {
                    const data = await studentQuizApi.get(token, id);
                    if (active) setQuiz(data.quiz);
                }
            } catch (err) {
                if (active) setError(err.message || "Could not load this quiz.");
            } finally {
                if (active) setLoading(false);
            }
        }

        load();
        return () => {
            active = false;
        };
    }, [attemptId, id, token]);

    async function handleSubmit(event) {
        event.preventDefault();
        if (!quiz) return;

        const unansweredCount = quiz.questions.filter(
            (question) => !answers[question._id]
        ).length;
        if (unansweredCount) {
            setError(`Answer all questions before submitting (${unansweredCount} remaining).`);
            return;
        }

        setSubmitting(true);
        setError("");
        try {
            const data = await studentQuizApi.submit(token, quiz._id, {
                requestId,
                answers: quiz.questions.map((question) => ({
                    questionId: question._id,
                    selectedOptionId: answers[question._id],
                })),
            });
            setAttempt(data.attempt);
        } catch (err) {
            setError(err.message || "Could not submit this quiz.");
        } finally {
            setSubmitting(false);
        }
    }

    const firstName = student?.name?.trim().split(/\s+/)[0];

    return (
        <main className="mx-auto max-w-4xl space-y-6 p-5 sm:p-8">
            <Link
                to="/quizzes"
                className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-[#596443] hover:text-[#30332C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#87966A]"
            >
                <ArrowLeft className="size-4" />
                Back to quizzes
            </Link>

            {error && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                    {error}
                </p>
            )}
            {loading ? (
                <p className="py-16 text-center text-sm text-[#686B62]">
                    Loading quiz...
                </p>
            ) : attempt ? (
                <ReviewAttempt attempt={attempt} />
            ) : quiz ? (
                <>
                    <section className="rounded-2xl bg-gradient-to-br from-[#39452D] via-[#566440] to-[#738258] p-6 text-white sm:p-8">
                        <p className="text-sm font-semibold text-white/75">
                            {quiz.subject} · {quiz.topic} · {quiz.difficulty}
                        </p>
                        <h1 className="mt-2 text-2xl font-bold">{quiz.title}</h1>
                        <p className="mt-2 text-sm leading-6 text-white/85">
                            {quiz.description}
                        </p>
                        <p className="mt-4 text-sm font-medium text-white/80">
                            {quiz.questions.length} questions · {quiz.durationMinutes} minutes
                            {firstName ? ` · Good luck, ${firstName}!` : ""}
                        </p>
                    </section>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {quiz.questions.map((question, index) => (
                            <fieldset
                                key={question._id}
                                className="rounded-2xl border border-[#E1E2D9] bg-white p-5 sm:p-6"
                            >
                                <legend className="sr-only">Question {index + 1}</legend>
                                <p className="text-xs font-semibold uppercase tracking-wide text-[#686B62]">
                                    Question {index + 1}
                                    {question.topic ? ` · ${question.topic}` : ""}
                                </p>
                                <h2 className="mt-2 font-semibold leading-6 text-[#30332C]">
                                    {question.prompt}
                                </h2>
                                <div className="mt-4 space-y-2.5">
                                    {question.options.map((option, optionIndex) => (
                                        <label
                                            key={option._id}
                                            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition ${
                                                answers[question._id] === option._id
                                                    ? "border-[#66734F] bg-[#F1F3EA] text-[#30332C]"
                                                    : "border-[#E1E2D9] text-[#55584F] hover:bg-[#F8F8F4]"
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name={`question-${question._id}`}
                                                value={option._id}
                                                checked={answers[question._id] === option._id}
                                                onChange={() =>
                                                    setAnswers((current) => ({
                                                        ...current,
                                                        [question._id]: option._id,
                                                    }))
                                                }
                                                className="mt-0.5 accent-[#596443]"
                                            />
                                            <span className="font-semibold">
                                                {String.fromCharCode(65 + optionIndex)}.
                                            </span>
                                            <span>{option.text}</span>
                                        </label>
                                    ))}
                                </div>
                            </fieldset>
                        ))}

                        <div className="flex flex-col gap-3 rounded-2xl border border-[#E1E2D9] bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                            <p className="text-sm text-[#686B62]">
                                Your score and explanations appear after submission.
                            </p>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#34402A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#455333] disabled:cursor-wait disabled:opacity-60"
                            >
                                {submitting ? "Submitting..." : "Submit quiz"}
                            </button>
                        </div>
                    </form>
                </>
            ) : null}
        </main>
    );
}
