import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Swords, Users, ShieldAlert, Sparkles, Zap, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/20 rounded-full blur-3xl opacity-30 pointer-events-none" />
        
        <div className="container mx-auto relative py-20 md:py-32 space-y-8">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-primary bg-primary/10 rounded-full px-4 py-1.5 mb-4 animate-pulse">
              <Zap size={14} />
              Powered by Real-Time Meta Data
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight text-balance leading-tight">
              Master the{" "}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                Draft
              </span>
              , <br className="hidden md:block" />
              Secure the{" "}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                Win
              </span>
            </h1>
            
            <p className="text-muted-foreground text-lg md:text-xl max-w-[700px] mx-auto leading-relaxed">
              The ultimate MLBB drafting assistant. Data-driven counter-picking 
              and intelligent hero randomization for{" "}
              <span className="text-foreground font-medium">professional teams</span> and{" "}
              <span className="text-foreground font-medium">friends</span>.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" className="w-full sm:w-auto px-8 gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow" asChild>
                <Link href="/draft">
                  <Swords size={20} /> Start Drafting
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8" asChild>
                <Link href="/heroes">
                  <BarChart3 size={20} className="mr-2" /> Hero Library
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
            Why Choose <span className="text-primary">MLBB MIZE</span>?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Built by players, for players. Every feature designed to give you the competitive edge.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="group relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="relative">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <Sparkles className="text-primary" size={24} />
              </div>
              <CardTitle className="text-lg">Intelligent Randomize</CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Randomly roll heroes for your teammates based on their role and the current meta tier. Perfect for fun games with friends.
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="relative">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <ShieldAlert className="text-primary" size={24} />
              </div>
              <CardTitle className="text-lg">Professional Counters</CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Analyze enemy picks and get mathematical counter suggestions based on win-rate deltas from real game data.
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="relative">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <Users className="text-primary" size={24} />
              </div>
              <CardTitle className="text-lg">Team Synergy</CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ensure your team composition has the right balance of CC, damage, and sustain for maximum effectiveness.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto py-16">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 p-8 md:p-12 text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold">Ready to Dominate the Draft?</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Start analyzing enemy picks and find the perfect counters in seconds.
            </p>
            <Button size="lg" className="mt-4 shadow-lg shadow-primary/25" asChild>
              <Link href="/draft">
                <Swords size={20} className="mr-2" /> Launch Draft Assistant
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
