import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock3, XCircle } from "lucide-react";
import { studentMockExamApi } from "../lib/quizApi";

function formatTime(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

function ExamReport({ attempt }) {
  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-gradient-to-br from-[#39452D] via-[#566440] to-[#738258] p-6 text-white sm:p-8">
        <p className="text-sm font-semibold text-white/75">
          {attempt.status === "expired" ? "TIME EXPIRED · RESULT" : "MOCK EXAM RESULT"}
        </p>
        <h1 className="mt-2 text-2xl font-bold">{attempt.examTitle}</h1>
        <p className="mt-4 text-3xl font-bold">
          {attempt.score}/{attempt.totalQuestions}
          <span className="ml-2 text-xl font-semibold text-white/80">({attempt.percentage}%)</span>
        </p>
        <p className="mt-2 text-sm text-white/80">
          Attempt {attempt.attemptNumber} of {attempt.attemptLimit} ·{" "}
          Submitted {new Date(attempt.submittedAt).toLocaleString()}
        </p>
      </section>
      {attempt.responses.map((response, index) => {
        const selectedOption = response.options.find(
          (option) => String(option.id) === String(response.selectedOptionId)
        );
        const correctOption = response.options.find(
          (option) => String(option.id) === String(response.correctOptionId)
        );
        return (
          <article key={`${response.questionId}-${index}`} className="rounded-2xl border border-[#E1E2D9] bg-white p-5 sm:p-6">
            <div className="flex items-start gap-3">
              {response.isCorrect
                ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-700" />
                : <XCircle className="mt-0.5 size-5 shrink-0 text-red-700" />}
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#686B62]">
                  Question {index + 1}{response.topic ? ` · ${response.topic}` : ""}
                </p>
                <h2 className="mt-1 font-semibold text-[#30332C]">{response.prompt}</h2>
                <p className="mt-3 text-sm text-[#55584F]">
                  Your answer: <span className="font-semibold">{selectedOption?.text || "Not answered"}</span>
                </p>
                {!response.isCorrect && (
                  <p className="mt-1 text-sm text-[#55584F]">
                    Correct answer: <span className="font-semibold text-emerald-800">{correctOption?.text}</span>
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
      <Link to="/mock-exams" className="inline-flex min-h-10 items-center rounded-xl bg-[#34402A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#455333]">
        Back to mock exams
      </Link>
    </div>
  );
}

export default function MockExamAttempt() {
  const { attemptId } = useParams();
  const token = sessionStorage.getItem("prepsure_student_token");
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [error, setError] = useState("");
  const saveQueue = useRef(Promise.resolve());
  const saveFailure = useRef(null);
  const answersRef = useRef({});
  const pendingAnswers = useRef(new Map());
  const submitStarted = useRef(false);

  const reloadAttempt = useCallback(async () => {
    const data = await studentMockExamApi.getAttempt(token, attemptId);
    answersRef.current = Object.fromEntries(
      data.attempt.answers.map((answer) => [
        String(answer.questionId),
        answer.selectedOptionId,
      ])
    );
    for (const [questionId, selectedOptionId] of pendingAnswers.current) {
      answersRef.current[questionId] = selectedOptionId;
    }
    setAttempt(data.attempt.status === "inProgress"
      ? {
        ...data.attempt,
        answers: [
          ...data.attempt.answers.filter(
            (answer) => !pendingAnswers.current.has(String(answer.questionId))
          ),
          ...[...pendingAnswers.current].map(
            ([questionId, selectedOptionId]) => ({
              questionId,
              selectedOptionId,
            })
          ),
        ],
      }
      : data.attempt);
    if (data.attempt.status === "inProgress") {
      setTimeRemaining(data.attempt.timeRemainingMs);
    }
    return data.attempt;
  }, [attemptId, token]);

  useEffect(() => {
    let active = true;
    studentMockExamApi.getAttempt(token, attemptId)
      .then(({ attempt: loaded }) => {
        if (active) {
          setAttempt(loaded);
          answersRef.current = Object.fromEntries(
            loaded.answers.map((answer) => [
              String(answer.questionId),
              answer.selectedOptionId,
            ])
          );
          if (loaded.status === "inProgress") {
            setTimeRemaining(loaded.timeRemainingMs);
          }
        }
      })
      .catch((err) => {
        if (active) setError(err.message || "Could not load this exam attempt.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [attemptId, token]);

  const isInProgress = attempt?.status === "inProgress";

  useEffect(() => {
    if (!isInProgress) return undefined;
    const timer = window.setInterval(() => {
      setTimeRemaining((remaining) =>
        remaining === null ? null : Math.max(0, remaining - 1000)
      );
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isInProgress]);

  const persistAnswers = useCallback(async () => {
    let savedAttempt;
    for (const [questionId, selectedOptionId] of pendingAnswers.current) {
      ({ attempt: savedAttempt } = await studentMockExamApi.saveAnswer(
        token,
        attemptId,
        questionId,
        selectedOptionId
      ));
      if (pendingAnswers.current.get(questionId) === selectedOptionId) {
        pendingAnswers.current.delete(questionId);
      }
    }
    saveFailure.current = null;
    if (savedAttempt) {
      setAttempt((current) =>
        current?.status === "inProgress"
          ? {
            ...current,
            answers: [
              ...savedAttempt.answers.filter(
                (answer) => !Object.hasOwn(answersRef.current, String(answer.questionId))
              ),
              ...Object.entries(answersRef.current).map(
                ([questionId, selectedOptionId]) => ({
                  questionId,
                  selectedOptionId,
                })
              ),
            ],
          }
          : current
      );
      setTimeRemaining(savedAttempt.timeRemainingMs);
    }
  }, [attemptId, token]);

  const submit = useCallback(async (automatic = false) => {
    if (submitStarted.current || !attempt || attempt.status !== "inProgress") return;
    submitStarted.current = true;
    setSubmitting(true);
    setError("");
    try {
      await saveQueue.current;
      if (saveFailure.current && !automatic) {
        await persistAnswers();
      }
      const { attempt: result } = await studentMockExamApi.submit(token, attempt._id);
      setAttempt(result);
    } catch (err) {
      setError(err.message || "Could not submit this mock exam.");
      try {
        const current = await reloadAttempt();
        if (current.status !== "inProgress") setError("");
      } catch (loadError) {
        setError(loadError.message || err.message || "Could not load the saved exam result.");
      }
    } finally {
      submitStarted.current = false;
      setSubmitting(false);
    }
  }, [attempt, persistAnswers, reloadAttempt, token]);

  useEffect(() => {
    if (timeRemaining !== 0 || !isInProgress) return undefined;
    const timeout = window.setTimeout(() => submit(true), 0);
    return () => window.clearTimeout(timeout);
  }, [isInProgress, submit, timeRemaining]);

  function chooseAnswer(questionId, selectedOptionId) {
    if (!attempt || attempt.status !== "inProgress") return;
    answersRef.current[String(questionId)] = selectedOptionId;
    pendingAnswers.current.set(String(questionId), selectedOptionId);
    setAttempt((current) => ({
      ...current,
      answers: [
        ...current.answers.filter(
          (answer) => String(answer.questionId) !== String(questionId)
        ),
        { questionId, selectedOptionId },
      ],
    }));
    saveQueue.current = saveQueue.current
      .catch(() => undefined)
      .then(persistAnswers)
      .catch(async (err) => {
        saveFailure.current = err;
        setError(err.message || "Could not save your answer.");
      });
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl p-5 sm:p-8">
        <p className="py-16 text-center text-sm text-[#686B62]">Loading mock exam...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-5 sm:p-8">
      <Link to="/mock-exams" className="inline-flex items-center gap-2 text-sm font-semibold text-[#596443] hover:text-[#30332C]">
        <ArrowLeft className="size-4" /> Back to mock exams
      </Link>
      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>
      )}
      {!attempt ? null : attempt.status !== "inProgress" ? (
        <ExamReport attempt={attempt} />
      ) : (
        <>
          <section className="rounded-2xl bg-gradient-to-br from-[#39452D] via-[#566440] to-[#738258] p-6 text-white sm:p-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <p className="text-sm font-semibold text-white/75">
                  ATTEMPT {attempt.attemptNumber} OF {attempt.attemptLimit}
                </p>
                <h1 className="mt-2 text-2xl font-bold">{attempt.examTitle}</h1>
                <p className="mt-2 text-sm text-white/85">
                  {attempt.totalQuestions} questions · Answers save automatically · Unanswered questions score zero.
                </p>
              </div>
              <div className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white/15 px-4 py-3 font-mono text-lg font-bold" aria-live="polite">
                <Clock3 className="size-5" />
                {timeRemaining === null ? "..." : formatTime(timeRemaining)}
              </div>
            </div>
          </section>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
            className="space-y-5"
          >
            {attempt.questions.map((question, index) => {
              const selectedId = attempt.answers.find(
                (answer) => String(answer.questionId) === String(question._id)
              )?.selectedOptionId;
              return (
                <fieldset key={question._id} disabled={submitting} className="rounded-2xl border border-[#E1E2D9] bg-white p-5 sm:p-6 disabled:opacity-75">
                  <legend className="sr-only">Question {index + 1}</legend>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#686B62]">
                    Question {index + 1}{question.topic ? ` · ${question.topic}` : ""}
                  </p>
                  <h2 className="mt-2 font-semibold leading-6 text-[#30332C]">{question.prompt}</h2>
                  <div className="mt-4 space-y-2.5">
                    {question.options.map((option, optionIndex) => (
                      <label
                        key={option.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition ${
                          String(selectedId) === String(option.id)
                            ? "border-[#66734F] bg-[#F1F3EA] text-[#30332C]"
                            : "border-[#E1E2D9] text-[#55584F] hover:bg-[#F8F8F4]"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${question._id}`}
                          value={option.id}
                          checked={String(selectedId) === String(option.id)}
                          onChange={() => chooseAnswer(question._id, option.id)}
                          className="mt-0.5 accent-[#596443]"
                        />
                        <span className="font-semibold">{String.fromCharCode(65 + optionIndex)}.</span>
                        <span>{option.text}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              );
            })}
            <div className="flex flex-col gap-3 rounded-2xl border border-[#E1E2D9] bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <p className="text-sm text-[#686B62]">
                Your saved answers are submitted automatically when time expires.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#34402A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#455333] disabled:cursor-wait disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit exam"}
              </button>
            </div>
          </form>
        </>
      )}
    </main>
  );
}
