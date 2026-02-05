"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Shuffle, Zap, Swords, Shield, Users } from "lucide-react";
import type { Hero, RoleFilter, LaneFilter, TierFilter, UtilityFilter } from "@/lib/types/hero";
import { ROLES, LANES, TIERS, UTILITIES, getPrimaryRole } from "@/lib/types/hero";
import { cn } from "@/lib/utils";

interface HeroGridProps {
  heroes: Hero[];
}

export function HeroGrid({ heroes }: HeroGridProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("All");
  const [laneFilter, setLaneFilter] = useState<LaneFilter>("All");
  const [tierFilter, setTierFilter] = useState<TierFilter>("All");
  const [utilityFilter, setUtilityFilter] = useState<UtilityFilter>("All");
  const [randomHero, setRandomHero] = useState<Hero | null>(null);
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);

  const filteredHeroes = useMemo(() => {
    return heroes.filter((hero) => {
      const matchesSearch = hero.hero_name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesRole =
        roleFilter === "All" || hero.role.includes(roleFilter);
      const matchesLane =
        laneFilter === "All" || hero.lane_recommendation.includes(laneFilter);
      const matchesTier = 
        tierFilter === "All" || hero.tier === tierFilter;
      const matchesUtility =
        utilityFilter === "All" || hero.utility?.includes(utilityFilter);
        
      return matchesSearch && matchesRole && matchesLane && matchesTier && matchesUtility;
    });
  }, [heroes, search, roleFilter, laneFilter, tierFilter, utilityFilter]);

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

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-bold text-muted-foreground mr-2 uppercase tracking-widest">Meta Tiers:</span>
        {TIERS.map((tier) => (
          <Button
            key={tier}
            size="sm"
            variant={tierFilter === tier ? "default" : "outline"}
            className={cn(
              "h-7 text-[10px] px-3",
              tier === "S+" && tierFilter === "S+" && "bg-yellow-500 hover:bg-yellow-600 text-black",
              tier === "S" && tierFilter === "S" && "bg-amber-400 hover:bg-amber-500 text-black"
            )}
            onClick={() => setTierFilter(tier)}
          >
            {tier}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-bold text-muted-foreground mr-2 uppercase tracking-widest">Utility:</span>
        {UTILITIES.map((util) => (
          <Button
            key={util}
            size="sm"
            variant={utilityFilter === util ? "secondary" : "ghost"}
            className="h-7 text-[10px] px-3"
            onClick={() => setUtilityFilter(util)}
          >
            {util}
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
          <HeroCard key={hero.id} hero={hero} onClick={() => setSelectedHero(hero)} />
        ))}
      </div>

      {selectedHero && (
        <HeroDetail hero={selectedHero} onClose={() => setSelectedHero(null)} />
      )}

      {filteredHeroes.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No heroes match your filters.
        </div>
      )}
    </div>
  );
}

function HeroCard({ hero, onClick }: { hero: Hero; onClick: () => void }) {
  const tierColors = {
    "S+": "bg-yellow-500 text-black border-yellow-300",
    "S": "bg-amber-400 text-black border-amber-200",
    "A": "bg-blue-500 text-white border-blue-300",
    "B": "bg-slate-400 text-white border-slate-300",
    "C": "bg-slate-600 text-white border-slate-500",
  };

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col items-center p-2 rounded-xl border bg-card hover:border-primary/50 hover:shadow-xl transition-all cursor-pointer overflow-visible"
    >
      {/* Tier Badge */}
      {hero.tier && (
        <div className={cn(
          "absolute -top-1 -right-1 z-10 text-[9px] font-black w-6 h-6 flex items-center justify-center rounded-lg shadow-lg border-2 transform rotate-12 group-hover:rotate-0 transition-transform",
          tierColors[hero.tier as keyof typeof tierColors]
        )}>
          {hero.tier}
        </div>
      )}

      <div className="relative w-14 h-14 mb-1">
        <Image
          src={hero.icon}
          alt={hero.hero_name}
          fill
          className="object-contain rounded-full border-2 border-transparent group-hover:border-primary/50 transition-colors"
          unoptimized
        />
        
        {/* Difficulty Dots */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "w-1.5 h-1.5 rounded-full border-[0.5px] border-black/20",
                i < (hero.difficulty || 1) ? "bg-primary" : "bg-muted"
              )} 
            />
          ))}
        </div>
      </div>

      <p className="text-xs font-bold text-center truncate w-full mt-1">
        {hero.hero_name}
      </p>
      
      <div className="flex items-center gap-1 opacity-60">
        <p className="text-[9px] font-medium uppercase tracking-tighter">
          {getPrimaryRole(hero.role)}
        </p>
      </div>

      {/* Hover Information Layer */}
      <div className="absolute inset-0 z-20 bg-background/95 p-2 rounded-xl border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between pointer-events-none sm:pointer-events-auto">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-primary uppercase">{hero.hero_name}</p>
          <div className="flex flex-wrap gap-1">
            {hero.utility?.map((u) => (
              <span key={u} className="text-[8px] px-1 bg-primary/10 text-primary rounded font-bold uppercase">{u}</span>
            ))}
          </div>
        </div>

        <div className="space-y-1 mt-auto">
          <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Core Items</p>
          <div className="flex gap-1">
            {hero.coreItems?.slice(0, 3).map((item, i) => (
              <div key={i} title={item} className="w-6 h-6 bg-muted rounded flex items-center justify-center border border-primary/10">
                <Zap size={10} className="text-primary/40" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroDetail({ hero, onClose }: { hero: Hero; onClose: () => void }) {
  const tierColors = {
    "S+": "from-yellow-500/20 to-yellow-500/5 border-yellow-500 text-yellow-500",
    "S": "from-amber-400/20 to-amber-400/5 border-amber-400 text-amber-400",
    "A": "from-blue-500/20 to-blue-500/5 border-blue-500 text-blue-500",
    "B": "from-slate-400/20 to-slate-400/5 border-slate-400 text-slate-400",
    "C": "from-slate-600/20 to-slate-600/5 border-slate-600 text-slate-600",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <Card className="w-full max-w-lg bg-background/95 border-primary/20 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className={cn("p-6 space-y-6 bg-gradient-to-br", tierColors[hero.tier as keyof typeof tierColors])}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-4 border-background shadow-xl shrink-0">
                <Image src={hero.icon} alt={hero.hero_name} fill className="object-cover" unoptimized />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl font-black tracking-tighter uppercase truncate">{hero.hero_name}</h2>
                  <div className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-black uppercase",
                    hero.tier === "S+" ? "bg-yellow-500 text-black" : "bg-primary text-primary-foreground"
                  )}>
                    {hero.tier} Tier
                  </div>
                </div>
                <p className="text-muted-foreground text-xs font-medium italic line-clamp-1">&quot;{hero.hero_title}&quot;</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {hero.utility?.map(u => (
                    <span key={u} className="text-[9px] px-2 py-0.5 bg-background/50 rounded-full font-bold border border-primary/20 uppercase">{u}</span>
                  ))}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 ml-2">✕</Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-3 bg-background/40 p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-primary">
                <Shield size={14} />
                <h4 className="text-[10px] font-black uppercase tracking-widest">Counters</h4>
              </div>
              <ul className="space-y-1">
                {hero.counters && hero.counters.length > 0 ? hero.counters.map(c => (
                  <li key={c} className="text-xs font-bold flex items-center gap-2">
                    <span className="w-1 h-1 bg-red-500 rounded-full" /> {c}
                  </li>
                )) : <li className="text-[10px] text-muted-foreground italic">No specific counters</li>}
              </ul>
            </div>

            <div className="space-y-3 bg-background/40 p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-primary">
                <Users size={14} />
                <h4 className="text-[10px] font-black uppercase tracking-widest">Synergy</h4>
              </div>
              <ul className="space-y-1">
                {hero.synergies && hero.synergies.length > 0 ? hero.synergies.map(s => (
                  <li key={s} className="text-xs font-bold flex items-center gap-2">
                    <span className="w-1 h-1 bg-green-500 rounded-full" /> {s}
                  </li>
                )) : <li className="text-[10px] text-muted-foreground italic">Standard Pick</li>}
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Zap size={14} />
              <h4 className="text-[10px] font-black uppercase tracking-widest">Pro Build Recommendation</h4>
            </div>
            <div className="flex justify-between gap-2">
              {hero.coreItems?.slice(0, 3).map((item, i) => (
                <div key={i} className="flex-1 bg-background/40 p-3 rounded-xl border border-white/10 flex flex-col items-center gap-2 group hover:bg-background/60 transition-colors min-w-0">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                    <Swords size={16} className="text-primary/60 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-[9px] font-bold text-center leading-tight truncate w-full">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
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
