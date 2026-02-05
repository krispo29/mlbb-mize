"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, X, Plus, TrendingUp, Target, Shield, Zap } from "lucide-react";
import type { Hero, RoleFilter } from "@/lib/types/hero";
import type { CounterSuggestion, Matchup } from "@/lib/types/matchup";
import { getCounterSuggestions } from "@/lib/types/matchup";
import { getPrimaryRole, ROLES } from "@/lib/types/hero";
import { cn } from "@/lib/utils";

interface DraftBoardProps {
  heroes: Hero[];
  matchups: Map<string, Map<string, Matchup>>;
}

export function DraftBoard({ heroes, matchups }: DraftBoardProps) {
  const [enemyPicks, setEnemyPicks] = useState<Hero[]>([]);
  const [allyPicks, setAllyPicks] = useState<Hero[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("All");
  const [suggestionRoleFilter, setSuggestionRoleFilter] = useState<RoleFilter>("All");
  const [isSelectingEnemy, setIsSelectingEnemy] = useState(true);

  const pickedIds = useMemo(
    () => new Set([...enemyPicks.map((h) => h.id), ...allyPicks.map((h) => h.id)]),
    [enemyPicks, allyPicks]
  );

  const filteredHeroes = useMemo(() => {
    return heroes.filter(
      (h) =>
        !pickedIds.has(h.id) &&
        h.hero_name.toLowerCase().includes(search.toLowerCase()) &&
        (roleFilter === "All" || h.role.includes(roleFilter))
    );
  }, [heroes, pickedIds, search, roleFilter]);

  const counterSuggestions = useMemo(() => {
    if (enemyPicks.length === 0) return [];
    
    // Filter heroes by suggestion role before getting scores
    const candidateHeroes = heroes.filter(h => 
      suggestionRoleFilter === "All" || h.role.includes(suggestionRoleFilter)
    );
    
    return getCounterSuggestions(candidateHeroes, enemyPicks, allyPicks, matchups, 8);
  }, [heroes, enemyPicks, allyPicks, matchups, suggestionRoleFilter]);

  const tacticalAnalysis = useMemo(() => {
    const analyzeTeam = (picks: Hero[]) => {
      const damage = { physical: 0, magic: 0 };
      const cc = { score: 0 };
      const utilities = new Set<string>();
      
      picks.forEach(h => {
        if (h.role.includes("Mage") || h.role.includes("Support")) damage.magic++;
        else damage.physical++;

        if (h.utility?.includes("CC")) cc.score += 2;
        if (h.utility?.includes("Initiator")) cc.score += 1;
        
        h.utility?.forEach(u => utilities.add(u));
      });

      const total = picks.length || 1;
      return {
        physicalPercent: (damage.physical / total) * 100,
        magicPercent: (damage.magic / total) * 100,
        ccScore: Math.min(cc.score / 6, 1) * 100,
        archetype: picks.length < 3 ? "Undetermined" : 
                   (utilities.has("Burst") && utilities.has("Blink")) ? "Dive/Pick-Off" :
                   (utilities.has("Sustain") && (utilities.has("Tank") || utilities.has("Guard"))) ? "Front-to-Back" :
                   "Flex/Balanced"
      };
    };

    return {
      ally: analyzeTeam(allyPicks),
      enemy: analyzeTeam(enemyPicks)
    };
  }, [allyPicks, enemyPicks]);

  const banSuggestions = useMemo(() => {
    if (enemyPicks.length === 0) return heroes.filter(h => h.tier === "S+").slice(0, 3);
    const potentialBans = heroes.filter(h => h.tier === "S+" || h.tier === "S")
      .filter(h => !pickedIds.has(h.id))
      .filter(h => allyPicks.some(ally => h.counters?.includes(ally.hero_name)));
    
    return potentialBans.length > 0 ? potentialBans.slice(0, 3) : heroes.filter(h => h.tier === "S+").slice(0, 3);
  }, [heroes, allyPicks, pickedIds, enemyPicks]);

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
                <EmptySlot onClick={() => setIsSelectingEnemy(true)} isActive={isSelectingEnemy} />
              )}
            </div>
          </CardContent>
        </Card>

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
                <EmptySlot onClick={() => setIsSelectingEnemy(false)} isActive={!isSelectingEnemy} />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search heroes to add..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ROLES.map((role) => (
                <Button
                  key={role}
                  size="sm"
                  variant={roleFilter === role ? "default" : "outline"}
                  className="h-7 text-[10px] px-2.5"
                  onClick={() => setRoleFilter(role)}
                >
                  {role}
                </Button>
              ))}
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
                    <Image src={hero.icon} alt={hero.hero_name} fill className="object-contain rounded-full" unoptimized />
                  </div>
                  <span className="text-[10px] truncate w-full text-center mt-1">{hero.hero_name}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Sidebar: Analytics & Suggestions */}
      <div className="space-y-4">
        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardHeader className="py-3">
            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <Zap size={14} className="text-primary" /> Tactical Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-0">
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-blue-500 uppercase">Your Team: {tacticalAnalysis.ally.archetype}</p>
              <StatBar label="Damage Balance" leftLabel="Phys" rightLabel="Magic" value={tacticalAnalysis.ally.physicalPercent} color="bg-blue-500" />
              <StatBar label="CC Density" value={tacticalAnalysis.ally.ccScore} color="bg-blue-500" />
            </div>

            <div className="space-y-3 border-t border-primary/10 pt-4">
              <p className="text-[10px] font-bold text-red-500 uppercase">Enemy Team: {tacticalAnalysis.enemy.archetype}</p>
              <StatBar label="Damage Balance" leftLabel="Phys" rightLabel="Magic" value={tacticalAnalysis.enemy.physicalPercent} color="bg-red-500" />
              <StatBar label="CC Density" value={tacticalAnalysis.enemy.ccScore} color="bg-red-500" />
            </div>

            <div className="bg-primary/5 p-3 rounded-lg border border-primary/10 space-y-2">
              <h4 className="text-[10px] font-black uppercase flex items-center gap-2">
                <Target size={12} className="text-primary" /> Win Condition
              </h4>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                {allyPicks.length < 3 
                  ? "Build a solid frontline and balance physical/magic damage."
                  : tacticalAnalysis.ally.archetype === "Dive/Pick-Off"
                  ? "Focus isolated enemies. Assassinate the backline before they can react."
                  : "Maintain formations. Protect your carry while chipping down the enemy frontline."
                }
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-500/20 bg-orange-500/5">
          <CardHeader className="py-3">
            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <X size={14} className="text-orange-500" /> Ban Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-2 pt-0">
            {banSuggestions.map(hero => (
              <div key={hero.id} className="flex flex-col items-center gap-1 group cursor-help">
                <div className="relative w-10 h-10 grayscale group-hover:grayscale-0 transition-all border border-orange-500/30 rounded-full overflow-hidden">
                  <Image src={hero.icon} alt={hero.hero_name} fill className="object-cover" unoptimized />
                </div>
                <span className="text-[8px] font-bold text-center truncate w-full">{hero.hero_name}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-gradient-to-b from-primary/10 to-transparent">
          <CardHeader className="py-3 space-y-3">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
              <TrendingUp className="text-primary" size={18} />
              Draft Suggestions
            </CardTitle>
            <div className="flex flex-wrap gap-1">
              {ROLES.map((role) => (
                <button
                  key={role}
                  className={cn(
                    "px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-colors border",
                    suggestionRoleFilter === role 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : "bg-background/50 text-muted-foreground border-muted-foreground/20 hover:border-primary/50"
                  )}
                  onClick={() => setSuggestionRoleFilter(role)}
                >
                  {role}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 max-h-[400px] overflow-y-auto pr-2">
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

function StatBar({ label, value, color, leftLabel, rightLabel }: { label: string; value: number; color: string; leftLabel?: string; rightLabel?: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-tighter">
        <span>{leftLabel || label}</span>
        {rightLabel && <span>{rightLabel}</span>}
      </div>
      <div className="relative h-1.5 w-full bg-muted rounded-full overflow-hidden border border-white/5">
        <div 
          className={cn("absolute inset-y-0 left-0 transition-all duration-500", color)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function PickedHeroCard({ hero, onRemove, variant }: { hero: Hero; onRemove: () => void; variant: "enemy" | "ally" }) {
  return (
    <div className={cn(
      "relative group flex flex-col items-center p-2 rounded-lg border",
      variant === "enemy" ? "border-red-500/30 bg-red-500/10" : "border-blue-500/30 bg-blue-500/10"
    )}>
      <button onClick={onRemove} className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <X size={12} />
      </button>
      <div className="relative w-12 h-12">
        <Image src={hero.icon} alt={hero.hero_name} fill className="object-contain rounded-full" unoptimized />
      </div>
      <span className="text-xs font-medium mt-1">{hero.hero_name}</span>
      <span className="text-[10px] text-muted-foreground">{getPrimaryRole(hero.role)}</span>
    </div>
  );
}

function EmptySlot({ onClick, isActive }: { onClick: () => void; isActive: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center w-[72px] h-[80px] rounded-lg border-2 border-dashed transition-colors",
        isActive ? "border-primary/50 bg-primary/5" : "border-muted-foreground/30 hover:border-muted-foreground/50"
      )}
    >
      <Plus className="text-muted-foreground" size={20} />
    </button>
  );
}

function CounterCard({ suggestion, rank, onPick }: { suggestion: CounterSuggestion; rank: number; onPick: () => void }) {
  const deltaColor = suggestion.avgWinRateDelta > 3 ? "text-green-500" : suggestion.avgWinRateDelta > 0 ? "text-yellow-500" : "text-red-500";
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg border bg-card hover:border-primary/50 transition-colors">
      <span className="text-lg font-bold text-muted-foreground w-6">#{rank}</span>
      <div className="relative w-10 h-10 flex-shrink-0">
        <Image src={suggestion.hero.icon} alt={suggestion.hero.hero_name} fill className="object-contain rounded-full" unoptimized />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{suggestion.hero.hero_name}</p>
        <p className="text-xs text-muted-foreground">{getPrimaryRole(suggestion.hero.role)}</p>
      </div>
      <div className="text-right">
        <p className={cn("text-sm font-bold", deltaColor)}>
          {suggestion.avgWinRateDelta > 0 ? "+" : ""}{suggestion.avgWinRateDelta.toFixed(1)}%
        </p>
        <p className="text-[10px] text-muted-foreground">Counters {suggestion.countersCount}</p>
      </div>
      <Button size="sm" variant="ghost" onClick={onPick}><Plus size={16} /></Button>
    </div>
  );
}
