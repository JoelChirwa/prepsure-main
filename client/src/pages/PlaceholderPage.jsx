import { Link } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PlaceholderPage({
  title = "Coming Soon",
  description = "This feature is currently under active development.",
  icon: Icon = Clock,
}) {
  return (
    <main className="mx-auto max-w-5xl space-y-6 p-5 sm:p-8">
      <Button asChild variant="ghost" className="-ml-3 rounded-xl">
        <Link to="/student">
          <ArrowLeft size={17} />
          Back to dashboard
        </Link>
      </Button>

      <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardContent className="flex flex-col items-center p-8 text-center sm:p-12">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <Icon size={28} />
          </div>

          <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {title}
          </h1>

          <p className="mt-3 max-w-md text-sm leading-6 text-slate-600 sm:text-base">
            {description}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild className="rounded-xl">
              <Link to="/experiments">Explore experiment library</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/student">Return to dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

