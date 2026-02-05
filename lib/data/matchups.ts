import type { Hero } from "@/lib/types/hero";
import type { Matchup } from "@/lib/types/matchup";

// Generate semi-realistic mock matchup data based on hero roles
// In production, this would come from actual game statistics
export function generateMockMatchups(
  heroes: Hero[]
): Map<string, Map<string, Matchup>> {
  const matchups = new Map<string, Map<string, Matchup>>();

  // Role advantage matrix (simplified)
  // Positive = row role has advantage over column role
  const roleAdvantage: Record<string, Record<string, number>> = {
    Assassin: { Marksman: 8, Mage: 5, Support: 3, Fighter: -2, Tank: -5 },
    Fighter: { Assassin: 3, Tank: 2, Support: 0, Mage: -2, Marksman: -3 },
    Tank: { Assassin: 5, Fighter: -2, Mage: -3, Marksman: -4, Support: 2 },
    Mage: { Fighter: 3, Tank: 4, Marksman: 2, Support: 0, Assassin: -5 },
    Marksman: { Fighter: 4, Tank: 5, Support: 3, Mage: -1, Assassin: -8 },
    Support: { Tank: 0, Fighter: 0, Mage: 0, Marksman: -2, Assassin: -3 },
  };

  for (const hero of heroes) {
    const heroMatchups = new Map<string, Matchup>();
    const heroRole = hero.role.split("/")[0].trim();

    for (const opponent of heroes) {
      if (hero.id === opponent.id) continue;

      const oppRole = opponent.role.split("/")[0].trim();
      const baseAdvantage = roleAdvantage[heroRole]?.[oppRole] ?? 0;

      // Add some randomness for variety (-3 to +3)
      const randomFactor = Math.floor(Math.random() * 7) - 3;
      const winRate = Math.min(65, Math.max(35, 50 + baseAdvantage + randomFactor));

      heroMatchups.set(opponent.id, {
        heroId: hero.id,
        vsHeroId: opponent.id,
        winRate,
        games: Math.floor(Math.random() * 10000) + 1000,
      });
    }

    matchups.set(hero.id, heroMatchups);
  }

  return matchups;
}

// Cache for matchups (simulating in-memory cache)
let cachedMatchups: Map<string, Map<string, Matchup>> | null = null;

export function getMatchups(heroes: Hero[]): Map<string, Map<string, Matchup>> {
  if (!cachedMatchups) {
    cachedMatchups = generateMockMatchups(heroes);
  }
  return cachedMatchups;
}

export function clearMatchupsCache() {
  cachedMatchups = null;
}
