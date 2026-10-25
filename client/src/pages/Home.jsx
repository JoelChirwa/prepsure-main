import { Link } from "react-router-dom";
import {
  BookOpen,
  Check,
  FlaskConical,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useStudentAuth } from "../context/StudentAuthContext";

const challenges = [
  {
    icon: BookOpen,
    title: "Knowing where to begin",
    description:
      "Practical topics can feel like a lot to revise when notes and instructions are scattered.",
  },
  {
    icon: FlaskConical,
    title: "Making sense of each step",
    description:
      "It is easier to prepare when the apparatus, method, and purpose of an experiment are clear.",
  },
  {
    icon: Target,
    title: "Building confidence before exam day",
    description:
      "Understanding what to expect helps make practical science feel more approachable.",
  },
];

const learningTools = [
  {
    icon: FlaskConical,
    title: "Guided experiments",
    description:
      "Explore practical experiment guides with the materials and procedures laid out clearly.",
    tone: "text-[#B8C39A]",
  },
  {
    icon: ShieldCheck,
    title: "Safety in focus",
    description:
      "Keep safe working practices in mind as you learn about practical activities.",
    tone: "text-[#D6B27C]",
  },
  {
    icon: GraduationCap,
    title: "Exam preparation",
    description:
      "Strengthen your understanding of practical science and prepare with purpose.",
    tone: "text-[#B6A5CE]",
  },
];

const steps = [
  {
    number: "01",
    title: "Choose a practical",
    description:
      "Find an experiment in the library that matches the science topic you are studying.",
  },
  {
    number: "02",
    title: "Understand the method",
    description:
      "Review the apparatus, procedure, and important safety considerations.",
  },
  {
    number: "03",
    title: "Keep learning",
    description:
      "Revisit practical guides as you prepare for class and your science exams.",
  },
];

const currentYear = new Date().getFullYear();

export default function Home() {
  const { user, checking } = useAuth();
  const { student, loading: studentLoading } = useStudentAuth();
  const isLoading = checking || studentLoading;
  const isSignedIn = Boolean(user || student);
  const dashboardTo = user ? "/admin" : "/student";
  const dashboardLabel = user ? "Open admin workspace" : "Go to your dashboard";

  return (
    <main className="min-h-dvh overflow-hidden bg-[#171916] text-[#F0EFE7]">
      <header className="sticky top-0 z-20 border-b border-[#D9DACE] bg-[#F0EFE7] text-[#20231D]">
        <nav
          aria-label="Main navigation"
          className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-8 sm:py-4"
        >
          <Link
            to="/"
            aria-label="PrepSure home"
            className="flex shrink-0 items-center gap-3 rounded-md"
          >
            <img
              src="/logo.png"
              alt=""
              className="h-11 w-[4.25rem] object-contain sm:h-14 sm:w-20"
            />
            <span             className="hidden flex-col font-heading text-base font-bold leading-none tracking-wide text-[#20231D] sm:flex sm:text-lg">
              <span>Practicals</span>
              <span className="mt-1 text-[#66734F]">made simple</span>
            </span>
          </Link>

          <div className="hidden items-center gap-7 text-sm font-semibold text-[#42453E] lg:flex">
            <Link className="transition hover:text-[#66734F]" to="/">
              Home
            </Link>
            <a className="transition hover:text-[#66734F]" href="#about">
              About
            </a>
            <a className="transition hover:text-[#66734F]" href="#how-it-works">
              How it works
            </a>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {!isLoading && isSignedIn ? (
              <Link
                to={dashboardTo}
                className="rounded-lg bg-[#B8C39A] px-3 py-2.5 text-sm font-bold text-[#20231D] transition hover:bg-[#CAD3B3] sm:px-5 sm:py-3 sm:text-base"
              >
                <span className="hidden sm:inline">{dashboardLabel}</span>
                <span className="sm:hidden">Dashboard</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-3 py-2.5 text-sm font-semibold text-[#30332C] transition hover:bg-[#E4E5DC] sm:px-5 sm:py-3 sm:text-base"
                >
                  Log in
                </Link>
                <Link
                  to="/simulate/ohms-law"
                  className="rounded-lg px-3 py-2.5 text-sm font-semibold text-[#30332C] transition hover:bg-[#E4E5DC] sm:px-5 sm:py-3 sm:text-base"
                >
                  Try a practical
                </Link>
                <Link
                  to="/student/register"
                  className="rounded-lg bg-[#B8C39A] px-3 py-2.5 text-sm font-bold text-[#20231D] transition hover:bg-[#CAD3B3] sm:px-5 sm:py-3 sm:text-base"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <section className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute -left-40 top-0 -z-10 size-[28rem] rounded-full bg-[#65744B]/10 blur-3xl" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <svg
            className="absolute left-1/2 top-1/2 h-[min(100%,44rem)] min-h-[26rem] w-full min-w-[52rem] -translate-x-1/2 -translate-y-1/2 text-[#B8C39A] opacity-[0.13]"
            viewBox="0 0 1200 620"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g stroke="currentColor" strokeWidth="1.5">
              <path d="m120 170 90-52 90 52v104l-90 52-90-52z" />
              <path d="m900 345 76-44 76 44v88l-76 44-76-44z" />
              <path d="M300 222h124l62-108h138l65 112h110" />
              <path d="M450 274 520 395h150l78-135" />
              <path d="m300 274 64 110h92" />
              <circle cx="486" cy="114" r="7" fill="currentColor" />
              <circle cx="762" cy="226" r="7" fill="currentColor" />
              <circle cx="442" cy="384" r="7" fill="currentColor" />
              <circle cx="746" cy="260" r="7" fill="currentColor" />
              <circle cx="424" cy="222" r="7" fill="currentColor" />
            </g>
            <g className="hero-background-drift">
              <circle
                cx="760"
                cy="155"
                r="66"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <ellipse
                cx="760"
                cy="155"
                rx="66"
                ry="25"
                stroke="currentColor"
                strokeWidth="1.5"
                transform="rotate(-35 760 155)"
              />
              <circle cx="760" cy="155" r="6" fill="currentColor" />
              <circle cx="705" cy="117" r="5" fill="currentColor" />
            </g>
            <g className="hero-background-drift-reverse">
              <circle
                cx="182"
                cy="440"
                r="4"
                fill="currentColor"
              />
              <circle
                cx="1040"
                cy="145"
                r="5"
                fill="currentColor"
              />
              <circle
                cx="836"
                cy="474"
                r="4"
                fill="currentColor"
              />
            </g>
          </svg>
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-[#171916]" />
        </div>
        <div className="mx-auto flex max-w-7xl justify-center px-5 py-20 text-center sm:px-8 sm:py-28 lg:min-h-[600px] lg:items-center lg:py-32">
          <div className="relative z-10 max-w-4xl">
            <h1 className="mt-6 font-heading text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Practical science,
              <span className="mt-2 block whitespace-nowrap text-[clamp(1.55rem,6.2vw,4.25rem)] text-[#B8C39A]">
                made clear and manageable.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#C7C9C0] sm:text-lg sm:leading-8">
              Get to grips with experiments, procedures, and safe working
              practices—so you can prepare for practical science with greater
              confidence.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {["Clear experiment guides", "Safety-aware learning", "Study at your pace"].map(
                (item) => (
                  <span
                    className="inline-flex items-center gap-2 rounded-full border border-[#484D40] bg-[#22251F]/80 px-4 py-2 text-sm font-semibold text-[#E2E3DC]"
                    key={item}
                  >
                    <Check className="shrink-0 text-[#B8C39A]" size={16} />
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>

        </div>
      </section>

      <section
        id="about"
        aria-labelledby="challenge-heading"
        className="scroll-mt-24 border-y border-[#30342C] bg-[#1D201B] py-16 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#B8C39A]">
              The reality
            </p>
            <h2
              id="challenge-heading"
              className="mt-4 whitespace-nowrap font-heading text-[clamp(0.75rem,3.6vw,2.25rem)] font-bold tracking-tight"
            >
              Practical science can feel like a lot to figure out.
            </h2>
            <p className="mt-4 text-base leading-7 text-[#C7C9C0] sm:text-lg">
              Knowing the theory is one thing. Understanding what to do in a
              practical, why each step matters, and how to work safely takes
              preparation too.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {challenges.map(({ icon: Icon, title, description }, index) => (
              <article
                className="rounded-2xl border border-[#3D4237] bg-[#22251F] p-6 sm:p-7"
                key={title}
              >
                <span className="text-xs font-bold tracking-[0.15em] text-[#8E9878]">
                  0{index + 1}
                </span>
                <div className="mt-5 flex size-12 items-center justify-center rounded-xl bg-[#B8C39A]/10 text-[#B8C39A]">
                  <Icon size={23} />
                </div>
                <h3 className="mt-5 font-heading text-xl font-bold text-[#F0EFE7]">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#C7C9C0]">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        aria-labelledby="solution-heading"
        className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-16"
      >
        <div className="relative overflow-hidden rounded-3xl border border-[#484D40] bg-[#22251F] p-3">
          <img
            src="/hero_students.webp"
            alt="Learners working together as they study"
            className="aspect-[5/4] w-full rounded-2xl object-cover"
            loading="lazy"
          />
          <div className="absolute bottom-7 left-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#171916]/90 px-4 py-2.5 text-sm font-semibold text-[#E2E3DC] backdrop-blur">
            <Sparkles size={16} className="text-[#B8C39A]" />
            Learn one practical at a time
          </div>
        </div>

        <div className="max-w-xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#B8C39A]">
            The PrepSure approach
          </p>
          <h2
            id="solution-heading"
            className="mt-4 font-heading text-3xl font-bold tracking-tight sm:text-4xl"
          >
            A clearer path from revision to readiness.
          </h2>
          <p className="mt-5 text-base leading-7 text-[#C7C9C0]">
            PrepSure brings practical science learning into one place. Use
            straightforward guides to review experiments, understand their
            procedures, and keep important safety considerations in view.
          </p>

          <div className="mt-7 space-y-4">
            {learningTools.map(({ icon: Icon, title, description, tone }) => (
              <article className="flex gap-4" key={title}>
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#22251F]">
                  <Icon className={tone} size={21} />
                </div>
                <div>
                  <h3 className="font-semibold text-[#F0EFE7]">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#AEB1A5]">
                    {description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        aria-labelledby="how-heading"
        className="relative isolate scroll-mt-24 overflow-hidden border-y border-[#30342C] bg-[#1D201B] py-16 sm:py-20"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 78% 42%, rgba(184, 195, 154, 0.12), transparent 48%), linear-gradient(rgba(184, 195, 154, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(184, 195, 154, 0.035) 1px, transparent 1px)",
            backgroundSize: "auto, 48px 48px, 48px 48px",
          }}
        />
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#B8C39A]">
              How it works
            </p>
            <h2
              id="how-heading"
              className="mt-4 font-heading text-3xl font-bold tracking-tight sm:text-4xl"
            >
              A simple way to get practical-ready.
            </h2>
            <p className="mt-4 text-base leading-7 text-[#C7C9C0]">
              Start with a topic, work through a guide, and return whenever you
              need a refresher.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3 md:gap-6">
            {steps.map(({ number, title, description }, index) => (
              <article className="relative" key={number}>
                {index < steps.length - 1 && (
                  <div className="absolute left-12 top-6 hidden h-px w-[calc(100%-2rem)] bg-[#484D40] md:block" />
                )}
                <div className="relative flex size-12 items-center justify-center rounded-full border border-[#697352] bg-[#22251F] font-heading text-sm font-bold text-[#D1DDB4]">
                  {number}
                </div>
                <h3 className="mt-5 font-heading text-xl font-bold">
                  {title}
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-[#AEB1A5]">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="support"
        aria-labelledby="support-heading"
        className="scroll-mt-24 px-5 py-16 sm:px-8 sm:py-20"
      >
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 rounded-3xl border border-[#48503D] bg-[#24281F] p-7 sm:p-10 lg:flex-row lg:items-center lg:p-12">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#B8C39A]">
              Your next step
            </p>
            <h2
              id="support-heading"
              className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Make your next practical feel more familiar.
            </h2>
            <p className="mt-4 text-base leading-7 text-[#C7C9C0]">
              Start exploring practical science guides and build your
              understanding at your own pace.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              to="/student/register"
              className="inline-flex items-center justify-center rounded-lg bg-[#B8C39A] px-6 py-3.5 font-bold text-[#20231D] transition hover:bg-[#CAD3B3]"
            >
              Create your account
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-lg border border-[#535A48] px-6 py-3.5 font-semibold text-[#E2E3DC] transition hover:bg-[#30352A]"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#D9DACE] bg-[#F0EFE7] text-[#30332C]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 sm:py-14 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Link
              to="/"
              aria-label="PrepSure home"
              className="inline-flex items-center gap-3"
            >
              <img
                src="/logo.png"
                alt=""
                className="h-12 w-16 object-contain"
                loading="lazy"
              />
              <span className="font-heading text-lg font-bold leading-tight text-[#20231D]">
                PrepSure
                <span className="block text-sm font-medium text-[#66734F]">
                  Practicals made simple
                </span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[#55584F]">
              Helping learners approach practical science with clearer
              guidance and greater confidence.
            </p>
          </div>

          <nav aria-label="Explore" className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#30332C]">
              Explore
            </h2>
            <a
              className="block w-fit text-sm text-[#55584F] transition hover:text-[#66734F]"
              href="#about"
            >
              About PrepSure
            </a>
            <a
              className="block w-fit text-sm text-[#55584F] transition hover:text-[#66734F]"
              href="#how-it-works"
            >
              How it works
            </a>
            <Link
              className="block w-fit text-sm text-[#55584F] transition hover:text-[#66734F]"
              to="/student/register"
            >
              Get started
            </Link>
          </nav>

          <nav aria-label="Account and support" className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#30332C]">
              Account &amp; support
            </h2>
            <a
              className="block w-fit text-sm text-[#55584F] transition hover:text-[#66734F]"
              href="#support"
            >
              Getting started
            </a>
            <Link
              className="block w-fit text-sm text-[#55584F] transition hover:text-[#66734F]"
              to="/help-feedback"
            >
              Help &amp; feedback
            </Link>
            <Link
              className="block w-fit text-sm text-[#55584F] transition hover:text-[#66734F]"
              to="/student/register"
            >
              Create an account
            </Link>
          </nav>
        </div>

        <div className="border-t border-[#D9DACE] px-5 py-5 sm:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 text-xs text-[#686B62] sm:flex-row sm:items-center sm:justify-between">
            <p>© {currentYear} PrepSure. All rights reserved.</p>
            <p>PrepSure is a product of Vyto Technologies.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
