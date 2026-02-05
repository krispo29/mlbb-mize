import { Suspense } from "react";
import { fetchHeroes } from "@/lib/api/heroes";
import { HeroGrid, HeroGridSkeleton } from "@/components/hero-grid";

export const metadata = {
  title: "Hero Library | MLBB Mize",
  description: "Browse all Mobile Legends heroes. Filter by role, lane, and more.",
};

async function HeroesContent() {
  const heroes = await fetchHeroes();
  return <HeroGrid heroes={heroes} />;
}

export default function HeroesPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hero Library</h1>
        <p className="text-muted-foreground">
          Browse all {126} MLBB heroes. Use filters to find the perfect pick.
        </p>
      </div>

      <Suspense fallback={<HeroGridSkeleton />}>
        <HeroesContent />
      </Suspense>
    </div>
  );
}
