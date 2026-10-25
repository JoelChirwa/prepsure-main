
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function FeatureCard({
  title,
  description,
  icon: Icon,
  accent = "blue",
  action = "Explore",
  onClick,
}) {
  const accents = {
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    violet: "bg-violet-50 text-violet-700 ring-violet-100",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    rose: "bg-rose-50 text-rose-700 ring-rose-100",
    cyan: "bg-cyan-50 text-cyan-700 ring-cyan-100",
  };

  return (
    <Card className="group h-full rounded-2xl border-slate-200 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md">
      <CardContent className="flex h-full flex-col p-5">
        <div className="mb-5 flex items-start justify-between">
          <div
            className={`flex size-12 items-center justify-center rounded-xl ring-1 ${accents[accent] ?? accents.blue
              }`}
          >
            {Icon && <Icon size={23} strokeWidth={1.8} />}
          </div>

          <ArrowUpRight
            size={19}
            className="text-slate-400 transition-colors group-hover:text-blue-600"
          />
        </div>

        <h3 className="text-base font-semibold text-slate-900">{title}</h3>

        <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">
          {description}
        </p>

        <Button
          type="button"
          variant="outline"
          onClick={onClick}
          className="mt-5 w-full justify-between rounded-xl border-slate-200"
        >
          {action}
          <ArrowUpRight size={16} />
        </Button>
      </CardContent>
    </Card>
  );
}
