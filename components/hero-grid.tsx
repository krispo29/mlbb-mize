"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Shuffle } from "lucide-react";
import type { Hero, RoleFilter, LaneFilter } from "@/lib/types/hero";
import { ROLES, LANES, getPrimaryRole, getPrimaryLane } from "@/lib/types/hero";

interface HeroGridProps {
  heroes: Hero[];
}

export function HeroGrid({ heroes }: HeroGridProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("All");
  const [laneFilter, setLaneFilter] = useState<LaneFilter>("All");
  const [randomHero, setRandomHero] = useState<Hero | null>(null);

  const filteredHeroes = useMemo(() => {
    return heroes.filter((hero) => {
      const matchesSearch = hero.hero_name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesRole =
        roleFilter === "All" || hero.role.includes(roleFilter);
      const matchesLane =
        laneFilter === "All" || hero.lane_recommendation.includes(laneFilter);
      return matchesSearch && matchesRole && matchesLane;
    });
  }, [heroes, search, roleFilter, laneFilter]);

  const handleRandomRoll = () => {
    if (filteredHeroes.length === 0) return;
    const randomIndex = Math.floor(Math.random() * filteredHeroes.length);
    setRandomHero(filteredHeroes[randomIndex]);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search heroes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {ROLES.map((role) => (
            <Button
              key={role}
              size="sm"
              variant={roleFilter === role ? "default" : "outline"}
              onClick={() => setRoleFilter(role)}
            >
              {role}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {LANES.map((lane) => (
          <Button
            key={lane}
            size="sm"
            variant={laneFilter === lane ? "secondary" : "ghost"}
            onClick={() => setLaneFilter(lane)}
          >
            {lane}
          </Button>
        ))}
      </div>

      {/* Random Roll Section */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/10 to-transparent">
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <h3 className="font-bold">Random Hero Roll</h3>
            <p className="text-sm text-muted-foreground">
              {filteredHeroes.length} heroes match your filters
            </p>
          </div>
          <div className="flex items-center gap-4">
            {randomHero && (
              <div className="flex items-center gap-2 bg-background/80 rounded-lg px-3 py-2">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-primary">
                  <Image
                    src={randomHero.icon}
                    alt={randomHero.hero_name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <p className="font-semibold text-sm">{randomHero.hero_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {getPrimaryRole(randomHero.role)}
                  </p>
                </div>
              </div>
            )}
            <Button onClick={handleRandomRoll} className="gap-2">
              <Shuffle size={18} />
              Roll!
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hero Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3">
        {filteredHeroes.map((hero) => (
          <HeroCard key={hero.id} hero={hero} />
        ))}
      </div>

      {filteredHeroes.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No heroes match your filters.
        </div>
      )}
    </div>
  );
}

function HeroCard({ hero }: { hero: Hero }) {
  return (
    <div
      className="group relative flex flex-col items-center p-2 rounded-lg border bg-card hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer"
      title={`${hero.hero_name} - ${hero.role}`}
    >
      <div className="relative w-12 h-12 mb-1">
        <Image
          src={hero.icon}
          alt={hero.hero_name}
          fill
          className="object-contain rounded-full"
          unoptimized
        />
      </div>
      <p className="text-xs font-medium text-center truncate w-full">
        {hero.hero_name}
      </p>
      <p className="text-[10px] text-muted-foreground truncate w-full text-center">
        {getPrimaryRole(hero.role)}
      </p>
    </div>
  );
}

export function HeroGridSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1 max-w-sm" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3">
        {Array.from({ length: 24 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
