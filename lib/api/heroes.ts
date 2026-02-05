import { HeroesResponseSchema, type Hero, type Tier } from "@/lib/types/hero";

const API_URL = "https://mlbb-wiki-api.vercel.app/api/heroes";

export async function fetchHeroes(): Promise<Hero[]> {
  const res = await fetch(API_URL, {
    next: { revalidate: 3600 }, // Revalidate every hour
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch heroes: ${res.status}`);
  }

  const json = await res.json();
  const parsed = HeroesResponseSchema.safeParse(json);

  if (!parsed.success) {
    console.error("API Response validation failed:", parsed.error);
    throw new Error("Invalid API response structure");
  }

  // Merge with Pro Meta Layer
  const { heroes: proData } = await import("@/lib/data/meta-pro-layer.json");
  
  return parsed.data.data.map(hero => {
    const meta = proData.find(m => m.hero_name === hero.hero_name);
    return {
      ...hero,
      tier: (meta?.tier as Tier) || "B",
      difficulty: meta?.difficulty || 1,
      utility: meta?.utility || ["Standard"],
      coreItems: meta?.coreItems || ["Boots", "Standard Item 1", "Standard Item 2"],
      counters: meta?.counters || [],
      synergies: meta?.synergies || [],
    };
  });
}
