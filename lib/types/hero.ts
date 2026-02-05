import { z } from "zod";

export const HeroSchema = z.object({
  id: z.string(),
  icon: z.string().url(),
  hero_name: z.string(),
  hero_title: z.string(),
  hero_order: z.string(),
  role: z.string(),
  specialty: z.string(),
  lane_recommendation: z.string(),
  region_of_origin: z.string(),
  bp_price: z.string().nullable(),
  diamond_price: z.string(),
  release_date: z.string(),
});

export type Hero = z.infer<typeof HeroSchema>;

export const HeroesResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(HeroSchema),
});

export type HeroesResponse = z.infer<typeof HeroesResponseSchema>;

// Helper function to extract primary role
export function getPrimaryRole(role: string): string {
  return role.split("/")[0].trim();
}

// Helper function to extract all roles
export function getRoles(role: string): string[] {
  return role.split("/").map((r) => r.trim());
}

// Helper function to get primary lane
export function getPrimaryLane(lane: string): string {
  return lane.split("/")[0].trim();
}

// Helper function to get all lanes
export function getLanes(lane: string): string[] {
  return lane.split("/").map((l) => l.trim());
}

// Role options for filtering
export const ROLES = [
  "All",
  "Tank",
  "Fighter",
  "Assassin",
  "Mage",
  "Marksman",
  "Support",
] as const;

export type RoleFilter = (typeof ROLES)[number];

// Lane options for filtering
export const LANES = [
  "All",
  "Gold Lane",
  "EXP Lane",
  "Mid Lane",
  "Jungling",
  "Roaming",
] as const;

export type LaneFilter = (typeof LANES)[number];
