import { Suspense } from "react";
import { fetchHeroes } from "@/lib/api/heroes";
import { getMatchups } from "@/lib/data/matchups";
import { DraftBoard } from "@/components/draft-board";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Draft Assistant | MLBB Mize",
  description: "Analyze enemy picks and get counter suggestions based on win-rate data.",
};

async function DraftContent() {
  const heroes = await fetchHeroes();
  const matchups = getMatchups(heroes);
  
  return <DraftBoard heroes={heroes} matchups={matchups} />;
}

function DraftSkeleton() {
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-20" />
        </div>
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-80 rounded-lg" />
      </div>
      <div>
        <Skeleton className="h-96 rounded-lg" />
      </div>
    </div>
  );
}

export default function DraftPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Draft Assistant</h1>
        <p className="text-muted-foreground">
          Select enemy heroes to get data-driven counter-pick suggestions.
        </p>
      </div>

      <Suspense fallback={<DraftSkeleton />}>
        <DraftContent />
      </Suspense>
    </div>
  );
}
