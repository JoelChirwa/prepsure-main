import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  FileText,
  FlaskConical,
  GraduationCap,
  Scale,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const resources = [
  {
    id: "lab-safety-symbols",
    title: "Laboratory Hazard Symbols & Safety Rules",
    category: "Safety",
    icon: ShieldAlert,
    iconStyle: "bg-[#F1EBDD] text-[#8A6D37]",
    readTime: "5 min read",
    summary:
      "Understand international GHS pictograms, chemical fume hood protocols, and essential personal protective equipment (PPE).",
    points: [
      "Distinguish between corrosive, toxic, oxidising, and flammable pictograms.",
      "Proper storage and neutralisation procedures for strong acids and bases.",
      "Emergency eye-wash and safety shower procedures.",
    ],
  },
  {
    id: "apparatus-measurement",
    title: "Apparatus Handling & Minimising Measurement Errors",
    category: "Apparatus",
    icon: Scale,
    iconStyle: "bg-[#E7EADF] text-[#66734F]",
    readTime: "7 min read",
    summary:
      "How to avoid systematic and random errors when reading glassware, electronic balances, and electrical meters.",
    points: [
      "Reading the bottom of the concave meniscus at eye level to eliminate parallax error.",
      "Zeroing electronic top-pan balances before weighing reagents.",
      "Tolerance limits of volumetric pipettes vs measuring cylinders.",
    ],
  },
  {
    id: "observations-vs-inferences",
    title: "Practical Technique: Observations vs Inferences",
    category: "Technique",
    icon: FlaskConical,
    iconStyle: "bg-[#E7EADF] text-[#66734F]",
    readTime: "6 min read",
    summary:
      "One of the most heavily penalised mistakes in science practicals is recording deductions instead of direct observations.",
    points: [
      "Observation: 'A white precipitate forms which dissolves in excess reagent.'",
      "Inference: 'Zinc or aluminium ions may be present.'",
      "Never write chemical formulas in observation columns unless explicitly requested.",
    ],
  },
  {
    id: "graphs-data-presentation",
    title: "Graph Plotting & Data Presentation in Science",
    category: "Technique",
    icon: FileText,
    iconStyle: "bg-[#EEEAF4] text-[#685580]",
    readTime: "6 min read",
    summary:
      "Guidelines for choosing axes scales, plotting coordinates with sharp pencil crosses, and drawing best-fit curves or lines.",
    points: [
      "Scales must occupy more than 50% of the grid in both dimensions.",
      "Lines of best fit must have an even balance of points above and below.",
      "Calculating gradients using large triangles with coordinates from the line.",
    ],
  },
  {
    id: "practical-exam-revision",
    title: "Practical Exam Checklist & Time Management",
    category: "Exam Prep",
    icon: GraduationCap,
    iconStyle: "bg-[#E7EADF] text-[#66734F]",
    readTime: "4 min read",
    summary:
      "A strategic walkthrough for setting up apparatus quickly, recording concordant titres, and allocating time efficiently.",
    points: [
      "Read all instructions completely before lighting a burner or mixing solutions.",
      "Prepare your results table with correct headings and units beforehand.",
      "Always repeat measurements to ensure concordancy within 0.10 cm³ for titrations.",
    ],
  },
];

const categories = ["All", "Safety", "Apparatus", "Technique", "Exam Prep"];

export default function Resources() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedId, setExpandedId] = useState(null);

  const filteredResources =
    selectedCategory === "All"
      ? resources
      : resources.filter((r) => r.category === selectedCategory);

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-5 sm:p-8">
      <Button asChild variant="ghost" className="-ml-3 rounded-xl">
        <Link to="/student">
          <ArrowLeft size={17} />
          Back to dashboard
        </Link>
      </Button>

      {/* Header banner */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#39452D] via-[#566440] to-[#738258] p-6 text-white sm:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-[#F0EFE7]">
              <BookOpen className="h-3.5 w-3.5" />
              Reference & Guides
            </span>

            <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
              Study Resources
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#E6E9DF] sm:text-base">
              Explore essential laboratory guides, apparatus references, safety protocols,
              and practical exam scoring techniques.
            </p>
          </div>

          <div className="hidden rounded-2xl bg-white/10 p-4 sm:block">
            <BookOpen size={38} className="text-white" />
          </div>
        </div>
      </section>

      {/* Category filters */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              selectedCategory === cat
                ? "bg-[#66734F] text-white shadow-sm"
                : "border border-[#D9DACE] bg-white text-[#55584F] hover:bg-[#F5F6F0] hover:text-[#30332C]"
            }`}
          >
            {cat === "All" ? "All resources" : cat}
          </button>
        ))}
      </div>

      {/* Resource cards */}
      <div className="space-y-4">
        {filteredResources.map((item) => {
          const Icon = item.icon;
          const isExpanded = expandedId === item.id;

          return (
            <Card
              key={item.id}
              className="rounded-2xl border-[#E1E2D9] bg-white shadow-sm transition hover:border-[#B8C39A]"
            >
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${item.iconStyle}`}
                    >
                      <Icon size={22} />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#ECEDE6] px-2.5 py-0.5 text-xs font-medium text-[#55584F]">
                          {item.category}
                        </span>
                        <span className="text-xs text-[#85897D]">
                          {item.readTime}
                        </span>
                      </div>

                      <h2 className="mt-2 text-lg font-semibold text-[#30332C]">
                        {item.title}
                      </h2>

                      <p className="mt-1 text-sm leading-6 text-[#55584F]">
                        {item.summary}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : item.id)
                    }
                    className="shrink-0 self-start rounded-xl border-[#17365D] bg-[#17365D] text-white hover:bg-[#244A78] hover:text-white sm:self-center"
                  >
                    {isExpanded ? "Hide key points" : "View key points"}
                  </Button>
                </div>

                {isExpanded && (
                  <div className="mt-5 border-t border-[#ECEDE6] pt-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#85897D]">
                      Essential practical takeaways
                    </h3>
                    <ul className="mt-3 space-y-2.5">
                      {item.points.map((pt) => (
                        <li
                          key={pt}
                          className="flex items-start gap-2.5 text-sm leading-6 text-[#55584F]"
                        >
                          <CheckCircle2
                            size={17}
                            className="mt-1 shrink-0 text-[#66734F]"
                          />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-4 flex gap-2">
                      <Button asChild size="sm" className="rounded-xl">
                        <Link to="/experiments">Practice in experiment library</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
