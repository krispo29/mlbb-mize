"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, X, Plus, TrendingUp, Target, Shield } from "lucide-react";
import type { Hero } from "@/lib/types/hero";
import type { CounterSuggestion, Matchup } from "@/lib/types/matchup";
import { getCounterSuggestions } from "@/lib/types/matchup";
import { getPrimaryRole } from "@/lib/types/hero";

interface DraftBoardProps {
  heroes: Hero[];
  matchups: Map<string, Map<string, Matchup>>;
}

export function DraftBoard({ heroes, matchups }: DraftBoardProps) {
  const [enemyPicks, setEnemyPicks] = useState<Hero[]>([]);
  const [allyPicks, setAllyPicks] = useState<Hero[]>([]);
  const [search, setSearch] = useState("");
  const [isSelectingEnemy, setIsSelectingEnemy] = useState(true);

  const pickedIds = useMemo(
    () => new Set([...enemyPicks.map((h) => h.id), ...allyPicks.map((h) => h.id)]),
    [enemyPicks, allyPicks]
  );

  const filteredHeroes = useMemo(() => {
    return heroes.filter(
      (h) =>
        !pickedIds.has(h.id) &&
        h.hero_name.toLowerCase().includes(search.toLowerCase())
    );
  }, [heroes, pickedIds, search]);

  const counterSuggestions = useMemo(() => {
    if (enemyPicks.length === 0) return [];
    return getCounterSuggestions(heroes, enemyPicks, allyPicks, matchups, 8);
  }, [heroes, enemyPicks, allyPicks, matchups]);

  const handleSelectHero = useCallback((hero: Hero) => {
    if (isSelectingEnemy) {
      setEnemyPicks((prev) => (prev.length < 5 ? [...prev, hero] : prev));
    } else {
      setAllyPicks((prev) => (prev.length < 5 ? [...prev, hero] : prev));
    }
    setSearch("");
  }, [isSelectingEnemy]);

  const handleRemoveEnemy = useCallback((heroId: string) => {
    setEnemyPicks((prev) => prev.filter((h) => h.id !== heroId));
  }, []);

  const handleRemoveAlly = useCallback((heroId: string) => {
    setAllyPicks((prev) => prev.filter((h) => h.id !== heroId));
  }, []);

  const handleReset = useCallback(() => {
    setEnemyPicks([]);
    setAllyPicks([]);
    setSearch("");
  }, []);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Left: Draft Board */}
      <div className="lg:col-span-2 space-y-6">
        {/* Mode Toggle */}
        <div className="flex gap-2">
          <Button
            variant={isSelectingEnemy ? "default" : "outline"}
            onClick={() => setIsSelectingEnemy(true)}
            className="flex-1"
          >
            <Target className="mr-2 h-4 w-4" />
            Select Enemy ({enemyPicks.length}/5)
          </Button>
          <Button
            variant={!isSelectingEnemy ? "default" : "outline"}
            onClick={() => setIsSelectingEnemy(false)}
            className="flex-1"
          >
            <Shield className="mr-2 h-4 w-4" />
            Select Ally ({allyPicks.length}/5)
          </Button>
          <Button variant="ghost" onClick={handleReset}>
            Reset
          </Button>
        </div>

        {/* Enemy Team Display */}
        <Card className="border-red-500/30 bg-red-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-red-500">
              <Target size={16} /> Enemy Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap min-h-[80px]">
              {enemyPicks.map((hero) => (
                <PickedHeroCard
                  key={hero.id}
                  hero={hero}
                  onRemove={() => handleRemoveEnemy(hero.id)}
                  variant="enemy"
                />
              ))}
              {enemyPicks.length < 5 && (
                <EmptySlot
                  onClick={() => setIsSelectingEnemy(true)}
                  isActive={isSelectingEnemy}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ally Team Display */}
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-500">
              <Shield size={16} /> Your Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap min-h-[80px]">
              {allyPicks.map((hero) => (
                <PickedHeroCard
                  key={hero.id}
                  hero={hero}
                  onRemove={() => handleRemoveAlly(hero.id)}
                  variant="ally"
                />
              ))}
              {allyPicks.length < 5 && (
                <EmptySlot
                  onClick={() => setIsSelectingEnemy(false)}
                  isActive={!isSelectingEnemy}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Hero Selection */}
        <Card>
          <CardHeader className="pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search heroes to add..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-[300px] overflow-y-auto">
              {filteredHeroes.slice(0, 50).map((hero) => (
                <button
                  key={hero.id}
                  onClick={() => handleSelectHero(hero)}
                  className="flex flex-col items-center p-1.5 rounded-lg hover:bg-accent transition-colors"
                  title={hero.hero_name}
                >
                  <div className="relative w-10 h-10">
                    <Image
                      src={hero.icon}
                      alt={hero.hero_name}
                      fill
                      className="object-contain rounded-full"
                      unoptimized
                    />
                  </div>
                  <span className="text-[10px] truncate w-full text-center mt-1">
                    {hero.hero_name}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right: Counter Suggestions */}
      <div className="space-y-4">
        <Card className="border-primary/30 bg-gradient-to-b from-primary/10 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="text-primary" size={20} />
              Counter Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {enemyPicks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Select enemy heroes to see counter suggestions.
              </p>
            ) : (
              counterSuggestions.map((suggestion, index) => (
                <CounterCard
                  key={suggestion.hero.id}
                  suggestion={suggestion}
                  rank={index + 1}
                  onPick={() => {
                    setIsSelectingEnemy(false);
                    handleSelectHero(suggestion.hero);
                  }}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PickedHeroCard({
  hero,
  onRemove,
  variant,
}: {
  hero: Hero;
  onRemove: () => void;
  variant: "enemy" | "ally";
}) {
  return (
    <div
      className={`relative group flex flex-col items-center p-2 rounded-lg border ${
        variant === "enemy"
          ? "border-red-500/30 bg-red-500/10"
          : "border-blue-500/30 bg-blue-500/10"
      }`}
    >
      <button
        onClick={onRemove}
        className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X size={12} />
      </button>
      <div className="relative w-12 h-12">
        <Image
          src={hero.icon}
          alt={hero.hero_name}
          fill
          className="object-contain rounded-full"
          unoptimized
        />
      </div>
      <span className="text-xs font-medium mt-1">{hero.hero_name}</span>
      <span className="text-[10px] text-muted-foreground">
        {getPrimaryRole(hero.role)}
      </span>
    </div>
  );
}

function EmptySlot({
  onClick,
  isActive,
}: {
  onClick: () => void;
  isActive: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-[72px] h-[80px] rounded-lg border-2 border-dashed transition-colors ${
        isActive
          ? "border-primary/50 bg-primary/5"
          : "border-muted-foreground/30 hover:border-muted-foreground/50"
      }`}
    >
      <Plus className="text-muted-foreground" size={20} />
    </button>
  );
}

function CounterCard({
  suggestion,
  rank,
  onPick,
}: {
  suggestion: CounterSuggestion;
  rank: number;
  onPick: () => void;
}) {
  const deltaColor =
    suggestion.avgWinRateDelta > 3
      ? "text-green-500"
      : suggestion.avgWinRateDelta > 0
      ? "text-yellow-500"
      : "text-red-500";

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg border bg-card hover:border-primary/50 transition-colors">
      <span className="text-lg font-bold text-muted-foreground w-6">
        #{rank}
      </span>
      <div className="relative w-10 h-10 flex-shrink-0">
        <Image
          src={suggestion.hero.icon}
          alt={suggestion.hero.hero_name}
          fill
          className="object-contain rounded-full"
          unoptimized
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{suggestion.hero.hero_name}</p>
        <p className="text-xs text-muted-foreground">
          {getPrimaryRole(suggestion.hero.role)}
        </p>
      </div>
      <div className="text-right">
        <p className={`text-sm font-bold ${deltaColor}`}>
          {suggestion.avgWinRateDelta > 0 ? "+" : ""}
          {suggestion.avgWinRateDelta.toFixed(1)}%
        </p>
        <p className="text-[10px] text-muted-foreground">
          Counters {suggestion.countersCount}
        </p>
      </div>
      <Button size="sm" variant="ghost" onClick={onPick}>
        <Plus size={16} />
      </Button>
    </div>
  );
}
