import { Suspense } from "react";
import { RoleRandomizer } from "@/components/role-randomizer";
import { fetchHeroes } from "@/lib/api/heroes";

export const metadata = {
  title: "Role Randomizer | MLBB Mize",
  description: "Randomly assign roles to your team. Perfect for deciding who plays which lane!",
};

async function RolesContent() {
  const heroes = await fetchHeroes();
  return <RoleRandomizer heroes={heroes} />;
}

export default function RolesPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="flex justify-center">
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-primary/20">
            <img
              src="/assets/brand/logo.png"
              alt="MLBB Mize Logo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter uppercase italic flex items-center justify-center gap-3">
            Role <span className="text-primary">Randomizer</span>
          </h1>
          <p className="text-muted-foreground text-lg font-medium">
            Let destiny decide your path on the battlefield. 🎲
          </p>
        </div>
      </div>
      <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
        <RolesContent />
      </Suspense>
    </div>
  );
}
