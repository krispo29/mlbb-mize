import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function getHeroes() {
  try {
    const res = await fetch("https://mlbb-wiki-api.vercel.app/api/heroes", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error("Failed to fetch heroes");
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function TestPage() {
  const heroes = await getHeroes();

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>MLBB Wiki API Test</CardTitle>
        </CardHeader>
        <CardContent>
          {heroes ? (
            <div>
              <p className="text-green-500 mb-4 font-bold">Success! Connected to MLBB Wiki API.</p>
              <p>Total Heroes Found: {heroes.length}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-4">
                {heroes.slice(0, 12).map((hero: { id: string; hero_name: string }) => (
                  <div key={hero.id} className="text-xs border p-2 rounded bg-muted">
                    {hero.hero_name}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-red-500">Failed to connect to API. See console for details.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
