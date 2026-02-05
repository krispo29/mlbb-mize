import { z } from "zod";
import type { Hero } from "./hero";

// Matchup data representing how one hero performs against another
export const MatchupSchema = z.object({
  heroId: z.string(),
  vsHeroId: z.string(),
  winRate: z.number().min(0).max(100), // Win rate when heroId plays against vsHeroId
  games: z.number().int().positive(), // Sample size
});

export type Matchup = z.infer<typeof MatchupSchema>;

// Counter suggestion result
export interface CounterSuggestion {
  hero: Hero;
  score: number; // Weighted counter score (higher = better counter)
  avgWinRateDelta: number; // Average win rate advantage against enemy team
  countersCount: number; // How many enemy heroes this pick counters
}

// Draft state
export interface DraftState {
  allyPicks: Hero[];
  allyBans: Hero[];
  enemyPicks: Hero[];
  enemyBans: Hero[];
}

// Function to calculate counter score
export function calculateCounterScore(
  heroId: string,
  enemyPicks: string[],
  matchups: Map<string, Map<string, Matchup>>
): { score: number; winRateDelta: number; countersCount: number } {
  const heroMatchups = matchups.get(heroId);
  if (!heroMatchups || enemyPicks.length === 0) {
    return { score: 0, winRateDelta: 0, countersCount: 0 };
  }

  let totalDelta = 0;
  let countersCount = 0;
  let validMatchups = 0;

  for (const enemyId of enemyPicks) {
    const matchup = heroMatchups.get(enemyId);
    if (matchup) {
      const delta = matchup.winRate - 50; // Positive = advantage
      totalDelta += delta;
      validMatchups++;
      if (delta > 2) countersCount++; // Consider it a counter if >2% advantage
    }
  }

  if (validMatchups === 0) {
    return { score: 0, winRateDelta: 0, countersCount: 0 };
  }

  const avgDelta = totalDelta / validMatchups;
  // Score formula: weighted by avg delta and counter count
  const score = avgDelta * 2 + countersCount * 5;

  return {
    score,
    winRateDelta: avgDelta,
    countersCount,
  };
}

// Get top counter suggestions for an enemy team
export function getCounterSuggestions(
  heroes: Hero[],
  enemyPicks: Hero[],
  allyPicks: Hero[],
  matchups: Map<string, Map<string, Matchup>>,
  limit: number = 10
): CounterSuggestion[] {
  const enemyIds = enemyPicks.map((h) => h.id);
  const pickedIds = new Set([
    ...allyPicks.map((h) => h.id),
    ...enemyPicks.map((h) => h.id),
  ]);

  const suggestions: CounterSuggestion[] = [];

  for (const hero of heroes) {
    if (pickedIds.has(hero.id)) continue; // Skip already picked heroes

    const { score, winRateDelta, countersCount } = calculateCounterScore(
      hero.id,
      enemyIds,
      matchups
    );

    suggestions.push({
      hero,
      score,
      avgWinRateDelta: winRateDelta,
      countersCount,
    });
  }

  // Sort by score descending
  suggestions.sort((a, b) => b.score - a.score);

  return suggestions.slice(0, limit);
}
