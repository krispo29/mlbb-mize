import { HeroesResponseSchema, type Hero } from "@/lib/types/hero";

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

  return parsed.data.data;
}
