import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Clock3,
  FlaskConical,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getExperiments } from "../lib/api";

const ALL_CATEGORIES = "All categories";
const ALL_LEVELS = "All levels";

const difficulties = [
  ALL_LEVELS,
  "Beginner",
  "Intermediate",
  "Advanced",
];

const difficultyStyles = {
  Beginner: "bg-[#E7EADF] text-[#596443]",
  Intermediate: "bg-amber-50 text-amber-700",
  Advanced: "bg-[#EEEAF4] text-[#685580]",
};

function getExperimentId(experiment) {
  return experiment.slug || experiment.id || experiment._id;
}

export default function Experiments() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [difficulty, setDifficulty] = useState(ALL_LEVELS);

  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Debounce search input to avoid requesting the API on every keystroke.
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search]);

  // Load experiments when the active filters change.
  useEffect(() => {
    let cancelled = false;

    async function loadExperiments() {
      setLoading(true);
      setError("");

      try {
        const data = await getExperiments({
          search: debouncedSearch,
          category,
          difficulty,
        });

        if (cancelled) return;

        setExperiments(Array.isArray(data) ? data : []);
      } catch (err) {
        if (cancelled) return;

        setExperiments([]);
        setError(err.message || "Could not load experiments.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadExperiments();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, category, difficulty]);

  // Build category options from the experiments currently returned by the API.
  const categories = useMemo(() => {
    const availableCategories = experiments
      .map((experiment) => experiment.category)
      .filter(Boolean);

    return [
      ALL_CATEGORIES,
      ...new Set(availableCategories),
    ];
  }, [experiments]);

  function resetFilters() {
    setSearch("");
    setDebouncedSearch("");
    setCategory(ALL_CATEGORIES);
    setDifficulty(ALL_LEVELS);
  }

  const experimentCount = experiments.length;

  return (
    <main className="mx-auto max-w-7xl space-y-7 p-5 sm:p-8">
      {/* Page heading */}
      <header>
        <p className="text-sm font-semibold text-[#66734F]">
          Practical science
        </p>

        <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight text-[#20231D]">
          Experiment Library
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#686B62] sm:text-base">
          Find guided practical experiments, review the apparatus and
          procedures, and strengthen your exam preparation.
        </p>
      </header>

      {/* Search and filters */}
      <section
        aria-label="Search and filter experiments"
        className="space-y-5 rounded-2xl border border-[#E1E2D9] bg-white p-4 shadow-sm sm:p-5"
      >
        <div className="relative">
          <Search
            size={19}
            aria-hidden="true"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#85897D]"
          />

          <input
            aria-label="Search experiments"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search experiments, topics, or apparatus..."
            className="h-12 w-full rounded-xl border border-[#D9DACE] bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-[#85897D] focus:border-[#87966A] focus:ring-2 focus:ring-[#87966A]/20"
          />
        </div>

        {/* Category filters */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#686B62]">
            Categories
          </p>

          <div className="flex flex-wrap gap-2">
            {categories.map((item) => {
              const active = category === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  aria-pressed={active}
                  className={`rounded-full border px-3.5 py-2 text-sm font-medium transition ${
                    active
                      ? "border-[#66734F] bg-[#66734F] text-white"
                      : "border-[#D9DACE] bg-white text-[#55584F] hover:border-[#AEB99A] hover:bg-[#F5F6F0] hover:text-[#455333]"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        {/* Difficulty and result count */}
        <div className="flex flex-wrap items-center gap-3 border-t border-[#ECEDE6] pt-4">
          <SlidersHorizontal
            size={17}
            aria-hidden="true"
            className="text-[#686B62]"
          />

          <label
            htmlFor="difficulty-filter"
            className="text-sm font-medium text-[#42453E]"
          >
            Difficulty
          </label>

          <select
            id="difficulty-filter"
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value)}
            className="h-10 rounded-lg border border-[#D9DACE] bg-white px-3 text-sm text-[#42453E] outline-none focus:border-[#87966A] focus:ring-2 focus:ring-[#87966A]/20"
          >
            {difficulties.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>

          <p
            className="ml-auto text-sm text-[#686B62]"
            aria-live="polite"
          >
            {loading
              ? "Updating results..."
              : `${experimentCount} ${
                  experimentCount === 1 ? "experiment" : "experiments"
                }`}
          </p>
        </div>
      </section>

      {/* Loading state */}
      {loading && (
        <div
          className="py-12 text-center text-sm text-[#686B62]"
          role="status"
        >
          Loading experiments...
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <p className="font-semibold">Unable to load experiments</p>
          <p className="mt-1">{error}</p>

          <Button
            variant="outline"
            onClick={() => setDebouncedSearch((value) => `${value} `)}
            className="mt-3 rounded-xl"
          >
            Try again
          </Button>
        </div>
      )}

      {/* Experiment cards */}
      {!loading && !error && experimentCount > 0 && (
        <section
          aria-label="Experiment results"
          className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
        >
          {experiments.map((experiment) => {
            const experimentId = getExperimentId(experiment);

            return (
              <Card
                key={experimentId}
                className="group h-full rounded-2xl border-[#E1E2D9] shadow-sm transition-all hover:-translate-y-1 hover:border-[#B8C39A] hover:shadow-md"
              >
                <CardContent className="flex h-full flex-col p-5">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-[#E7EADF] text-[#66734F]">
                      <FlaskConical size={24} strokeWidth={1.8} />
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        difficultyStyles[experiment.difficulty] ||
                        "bg-[#ECEDE6] text-[#55584F]"
                      }`}
                    >
                      {experiment.difficulty || "Unspecified"}
                    </span>
                  </div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-[#66734F]">
                    {experiment.category || "General science"}
                  </p>

                  <h2 className="mt-2 text-lg font-semibold leading-6 text-[#30332C]">
                    {experiment.title}
                  </h2>

                  <p className="mt-2 flex-1 text-sm leading-6 text-[#686B62]">
                    {experiment.summary || "Explore this practical experiment."}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#ECEDE6] pt-4 text-xs text-[#686B62]">
                    <Clock3 size={15} aria-hidden="true" />

                    <span>{experiment.duration || "Duration not specified"}</span>

                    <span className="mx-1 text-[#C4C6BB]" aria-hidden="true">
                      •
                    </span>

                    <span>
                      {experiment.apparatus?.length ?? 0} apparatus items
                    </span>
                  </div>

                  {experimentId ? (
                    <Button
                      asChild
                      className="mt-4 w-full rounded-xl bg-[#66734F] text-white hover:bg-[#455333]"
                    >
                      <Link
                        to={`/experiments/${encodeURIComponent(experimentId)}`}
                        className="flex items-center justify-between gap-2"
                      >
                        View experiment
                        <ArrowRight size={16} className="shrink-0" />
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      disabled
                      className="mt-4 w-full rounded-xl bg-[#66734F] text-white"
                    >
                      Experiment unavailable
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}

      {/* Empty state */}
      {!loading && !error && experimentCount === 0 && (
        <Card className="rounded-2xl border-dashed shadow-none">
          <CardContent className="flex flex-col items-center px-5 py-12 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-[#ECEDE6] text-[#686B62]">
              <Search size={25} />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-[#30332C]">
              No experiments found
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-[#686B62]">
              Try a different search term or remove one of the filters.
            </p>

            <Button
              variant="outline"
              onClick={resetFilters}
              className="mt-5 rounded-xl"
            >
              Clear filters
            </Button>
          </CardContent>
        </Card>
      )}
    </main>
  );
}