"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Shuffle,
  User,
  Swords,
  Shield,
  Crosshair,
  Heart,
  TreeDeciduous,
  Eraser,
  History,
  Lock,
  ArrowLeftRight,
  X,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Hero } from "@/lib/types/hero";

const ROLES = [
  { 
    id: "gold", 
    name: "Gold Lane", 
    icon: Swords, 
    color: "text-yellow-500", 
    bg: "bg-yellow-500/10", 
    abbr: "Gold", 
    image: "/assets/icons/gold.png",
    metaHeroes: ["Beatrix", "Claude", "Natan"]
  },
  { 
    id: "exp", 
    name: "EXP Lane", 
    icon: Shield, 
    color: "text-blue-500", 
    bg: "bg-blue-500/10", 
    abbr: "EXP", 
    image: "/assets/icons/exp.png",
    metaHeroes: ["Arlott", "Terizla", "Yu Zhong"]
  },
  { 
    id: "mid", 
    name: "Mid Lane", 
    icon: Crosshair, 
    color: "text-purple-500", 
    bg: "bg-purple-500/10", 
    abbr: "Mid", 
    image: "/assets/icons/mid.png",
    metaHeroes: ["Valentina", "Novaria", "Faramis"]
  },
  { 
    id: "roam", 
    name: "Roamer", 
    icon: Heart, 
    color: "text-green-500", 
    bg: "bg-green-500/10", 
    abbr: "Roam", 
    image: "/assets/icons/roam.png",
    metaHeroes: ["Kaja", "Chou", "Mathilda"]
  },
  { 
    id: "jungle", 
    name: "Jungle", 
    icon: TreeDeciduous, 
    color: "text-red-500", 
    bg: "bg-red-500/10", 
    abbr: "JG", 
    image: "/assets/icons/jungle.png",
    metaHeroes: ["Ling", "Lancelot", "Fanny"]
  },
];

const STRATEGIES = [
  { title: "Early Aggression ⚔️", description: "โจมตีต้นเกมตั้งแต่นาทีที่ 1 กดดันเลน Gold และแย่ง Blue Buff ศัตรู" },
  { title: "Split Push 🏃‍♂️", description: "เน้นการดันเลนแยกโดย EXP Lane ในขณะที่ 4 คนที่เหลือคอยดึงความสนใจ" },
  { title: "Late Game Insurance 🛡️", description: "เน้นการฟาร์มของ Gold Lane ให้เร็วที่สุด ปกป้องแครี่เพื่อพลิกเกมช่วงนาทีที่ 12" },
  { title: "Turtle Control 🐢", description: "รวมกลุ่มก่อนเต่าเกิด 10 วินาที เน้นการคุมโซนและไม่ให้ศัตรูเข้าใกล้แม่น้ำ" },
  { title: "Fast Rotation ⚡", description: "Mid และ Roam เน้นการกางปีกช่วยเลนที่โดนกดดันอย่างรวดเร็ว ห้ามแช่เลนนาน" },
];

const DEFAULT_PLAYERS = [
  { id: "1", name: "Player 1", role: null, excludedRoles: [] as string[], history: [] as string[] },
  { id: "2", name: "Player 2", role: null, excludedRoles: [] as string[], history: [] as string[] },
  { id: "3", name: "Player 3", role: null, excludedRoles: [] as string[], history: [] as string[] },
  { id: "4", name: "Player 4", role: null, excludedRoles: [] as string[], history: [] as string[] },
  { id: "5", name: "Player 5", role: null, excludedRoles: [] as string[], history: [] as string[] },
];

const STORAGE_KEY = "mlbb-mize-players-v2";

interface Player {
  id: string;
  name: string;
  role: string | null;
  excludedRoles: string[];
  history: string[];
  rolledHero?: Hero | null;
  isRollingHero?: boolean;
}

interface RoleRandomizerProps {
  heroes?: Hero[];
}

export function RoleRandomizer({ heroes = [] }: RoleRandomizerProps) {
  const [players, setPlayers] = useState<Player[]>(DEFAULT_PLAYERS);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatingPlayerId, setAnimatingPlayerId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [swapMode, setSwapMode] = useState(false);
  const [selectedForSwap, setSelectedForSwap] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [currentStrategy, setCurrentStrategy] = useState<typeof STRATEGIES[0] | null>(null);
  const [copying, setCopying] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const savedPlayers = localStorage.getItem(STORAGE_KEY);
    if (savedPlayers) {
      try {
        const parsed = JSON.parse(savedPlayers);
        setPlayers(parsed.map((p: Player) => ({ ...p, role: null })));
      } catch {
        setPlayers(DEFAULT_PLAYERS);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
    }
  }, [players, isLoaded]);

  const updatePlayerName = useCallback((id: string, name: string) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  }, []);

  const clearAllNames = useCallback(() => {
    setPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        name: "",
        role: null,
        excludedRoles: [],
        history: [],
        rolledHero: null,
        isRollingHero: false,
      }))
    );
  }, []);

  const clearHistory = useCallback(() => {
    setPlayers((prev) => prev.map((p) => ({ ...p, history: [] })));
  }, []);

  const copyLineup = useCallback(async () => {
    setCopying(true);
    const text = players.map(p => {
      const heroInfo = p.rolledHero ? ` (${p.rolledHero.hero_name} - ${p.rolledHero.specialty})` : '';
      return `${p.name || 'Unknown'}: ${p.role || 'No Role'}${heroInfo}`;
    }).join('\n');
    const strategyText = currentStrategy ? `\n\nStrategy: ${currentStrategy.title}\n${currentStrategy.description}` : '';
    const fullText = `🎮 MLBB MIZE - Team Lineup:\n${text}${strategyText}`;
    
    try {
      await navigator.clipboard.writeText(fullText);
      setTimeout(() => setCopying(false), 2000);
    } catch (err) {
      console.error("Failed to copy lineup", err);
      setCopying(false);
    }
  }, [players, currentStrategy]);

  const toggleExcludedRole = useCallback((playerId: string, roleId: string) => {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id !== playerId) return p;
        const excluded = p.excludedRoles.includes(roleId)
          ? p.excludedRoles.filter((r) => r !== roleId)
          : [...p.excludedRoles, roleId];
        // Limit to max 3 excluded roles per player
        return { ...p, excludedRoles: excluded.slice(0, 3) };
      })
    );
  }, []);

  const rollHero = useCallback(async (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (!player || !player.role || !heroes.length || player.isRollingHero) return;

    const roleData = ROLES.find(r => r.name === player.role);
    if (!roleData) return;

    // Filter heroes by lane/role
    const relevantHeroes = heroes.filter(h => 
      h.lane_recommendation.toLowerCase().includes(roleData.id.toLowerCase()) ||
      h.role.toLowerCase().includes(roleData.id.toLowerCase())
    );

    const pool = relevantHeroes.length > 0 ? relevantHeroes : heroes;
    
    // Start animation
    setPlayers(prev => prev.map(p => 
      p.id === playerId ? { ...p, isRollingHero: true } : p
    ));

    // Animation loop
    const cycles = 10;
    for (let i = 0; i < cycles; i++) {
      const tempHero = pool[Math.floor(Math.random() * pool.length)];
      setPlayers(prev => prev.map(p => 
        p.id === playerId ? { ...p, rolledHero: tempHero } : p
      ));
      await new Promise(r => setTimeout(r, 60 + i * 15));
    }

    // Final hero
    const finalHero = pool[Math.floor(Math.random() * pool.length)];
    setPlayers(prev => prev.map(p => 
      p.id === playerId ? { ...p, rolledHero: finalHero, isRollingHero: false } : p
    ));
  }, [players, heroes]);

  const handleSwap = useCallback((playerId: string) => {
    if (!swapMode) return;
    if (!selectedForSwap) {
      setSelectedForSwap(playerId);
    } else if (selectedForSwap === playerId) {
      setSelectedForSwap(null);
    } else {
      // Swap roles
      setPlayers((prev) => {
        const player1 = prev.find((p) => p.id === selectedForSwap);
        const player2 = prev.find((p) => p.id === playerId);
        if (!player1 || !player2 || !player1.role || !player2.role) return prev;
        
        const role1 = player1.role as string;
        const role2 = player2.role as string;
        const rolledHero1 = player1.rolledHero;
        const rolledHero2 = player2.rolledHero;
        const isRollingHero1 = player1.isRollingHero;
        const isRollingHero2 = player2.isRollingHero;

        return prev.map((p) => {
          if (p.id === selectedForSwap) {
            // Replace the latest history entry with the swapped role
            const newHistory = [...p.history];
            if (newHistory.length > 0) {
              newHistory[newHistory.length - 1] = role2;
            } else {
              newHistory.push(role2);
            }
            return { 
              ...p, 
              role: role2,
              history: newHistory.slice(-5),
              rolledHero: rolledHero2,
              isRollingHero: isRollingHero2,
            };
          }
          if (p.id === playerId) {
            // Replace the latest history entry with the swapped role
            const newHistory = [...p.history];
            if (newHistory.length > 0) {
              newHistory[newHistory.length - 1] = role1;
            } else {
              newHistory.push(role1);
            }
            return { 
              ...p, 
              role: role1,
              history: newHistory.slice(-5),
              rolledHero: rolledHero1,
              isRollingHero: isRollingHero1,
            };
          }
          return p;
        });
      });
      setSelectedForSwap(null);
      setSwapMode(false);
    }
  }, [swapMode, selectedForSwap]);

  const randomizeRoles = useCallback(async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSwapMode(false);
    setSelectedForSwap(null);

    // Build available roles for each player (respecting excludes)
    const playerRoleOptions: Map<string, string[]> = new Map();
    players.forEach((p) => {
      const available = ROLES.filter((r) => !p.excludedRoles.includes(r.id)).map((r) => r.name);
      playerRoleOptions.set(p.id, available.length > 0 ? available : ROLES.map((r) => r.name));
    });

    // Fair mode: weight roles player hasn't done recently
    const assignRoles = (): string[] => {
      const roles = ROLES.map((r) => r.name);
      
      // Try to give roles players haven't had recently
      const assigned: string[] = [];
      const remainingRoles = [...roles];
      
      for (const player of players) {
        const available = playerRoleOptions.get(player.id) || roles;
        const notRecentlyPlayed = available.filter(
          (r) => !player.history.slice(0, 3).includes(r) && remainingRoles.includes(r)
        );
        
        let chosenRole: string;
        if (notRecentlyPlayed.length > 0) {
          chosenRole = notRecentlyPlayed[Math.floor(Math.random() * notRecentlyPlayed.length)];
        } else {
          const stillAvailable = available.filter((r) => remainingRoles.includes(r));
          chosenRole = stillAvailable.length > 0
            ? stillAvailable[Math.floor(Math.random() * stillAvailable.length)]
            : remainingRoles[0];
        }
        
        assigned.push(chosenRole);
        const idx = remainingRoles.indexOf(chosenRole);
        if (idx > -1) remainingRoles.splice(idx, 1);
      }
      return assigned;
    };

    const finalRoles = assignRoles();

    // Clear roles and hero rolls first
    setPlayers((prev) => prev.map((p) => ({ ...p, role: null, rolledHero: null, isRollingHero: false })));

    // Animate
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      setAnimatingPlayerId(player.id);

      for (let cycle = 0; cycle < 8; cycle++) {
        const randomRole = ROLES[Math.floor(Math.random() * ROLES.length)].name;
        setPlayers((prev) =>
          prev.map((p) => (p.id === player.id ? { ...p, role: randomRole } : p))
        );
        await new Promise((resolve) => setTimeout(resolve, 60 + cycle * 12));
      }

      // Set final role and update history
      setPlayers((prev) =>
        prev.map((p) => {
          if (p.id !== player.id) return p;
          const newHistory = [...p.history, finalRoles[i]].slice(-5);
          return { ...p, role: finalRoles[i], history: newHistory };
        })
      );
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    setAnimatingPlayerId(null);
    setCurrentStrategy(STRATEGIES[Math.floor(Math.random() * STRATEGIES.length)]);
    setIsAnimating(false);
  }, [players, isAnimating]);

  const resetRoles = useCallback(() => {
    setPlayers((prev) => prev.map((p) => ({ ...p, role: null, rolledHero: null })));
    setCurrentStrategy(null);
    setSwapMode(false);
    setSelectedForSwap(null);
  }, []);

  const hasRoles = players.some((p) => p.role !== null);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Role Legend - Professional Reference Strip */}
      <div className="flex flex-wrap justify-center gap-4 py-4 px-6 bg-gradient-to-b from-muted/20 to-transparent rounded-2xl border border-primary/5">
        {ROLES.map((role) => {
          return (
            <div 
              key={role.id} 
              className="group flex items-center gap-3 transition-all hover:scale-105"
              title={role.name}
            >
              <div className={cn(
                "relative w-10 h-10 rounded-xl overflow-hidden shadow-lg ring-1 ring-primary/10 group-hover:ring-primary/40 transition-all",
                role.bg
              )}>
                <img
                  src={role.image}
                  alt={role.name}
                  className="w-full h-full object-cover p-1.5"
                />
              </div>
              <div className="flex flex-col -space-y-1">
                <span className={cn("text-xs font-black uppercase italic tracking-tighter transition-colors", role.color)}>
                  {role.abbr}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest opacity-60">
                  {role.id}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Options Bar */}
      <Card className="bg-muted/30">
        <CardContent className="py-3">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <History size={16} className="text-primary" />
              <span className="text-sm">Show History</span>
              <Switch checked={showHistory} onCheckedChange={setShowHistory} />
            </div>
            {hasRoles && (
              <Button
                size="sm"
                variant={swapMode ? "default" : "outline"}
                onClick={() => {
                  setSwapMode(!swapMode);
                  setSelectedForSwap(null);
                }}
                className="gap-2"
              >
                <ArrowLeftRight size={16} />
                Quick Swap
              </Button>
            )}
            {players.every(p => p.role !== null) && (
              <Button
                size="sm"
                variant="outline"
                onClick={copyLineup}
                className="gap-2 text-primary border-primary/20 hover:bg-primary/10"
              >
                {copying ? <div className="text-xs">Copied!</div> : <ArrowLeftRight size={16} />}
                {copying ? "" : "Copy Lineup"}
              </Button>
            )}
            {players.some((p) => p.history.length > 0) && (
              <Button
                size="sm"
                variant="ghost"
                onClick={clearHistory}
                disabled={isAnimating}
                className="gap-2 text-muted-foreground hover:text-destructive"
              >
                <History size={16} />
                Clear History
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Players Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {players.map((player) => {
          const roleData = ROLES.find((r) => r.name === player.role);
          const RoleIcon = roleData?.icon || User;
          const isSelectedForSwap = selectedForSwap === player.id;

          return (
            <Card
              key={player.id}
              onClick={() => swapMode && player.role && handleSwap(player.id)}
              className={cn(
                "relative overflow-hidden transition-all duration-300",
                animatingPlayerId === player.id && "ring-2 ring-primary animate-pulse",
                player.role && roleData?.bg,
                swapMode && player.role && "cursor-pointer hover:ring-2 hover:ring-primary",
                isSelectedForSwap && "ring-2 ring-primary"
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={player.name}
                    onChange={(e) => updatePlayerName(player.id, e.target.value)}
                    className="text-center text-base font-semibold border-none bg-transparent p-0 h-auto focus-visible:ring-1"
                    disabled={isAnimating || swapMode}
                    placeholder="Name"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      updatePlayerName(player.id, "");
                    }}
                  >
                    <Eraser size={12} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Role Display */}
                <div
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-300",
                    player.role ? roleData?.bg : "bg-muted/50",
                    animatingPlayerId === player.id && "scale-105"
                  )}
                >
                  <div
                    className={cn(
                      "relative w-16 h-16 rounded-full overflow-hidden flex items-center justify-center transition-all",
                      player.role ? "ring-2 ring-offset-2 ring-primary ring-offset-background" : "bg-muted"
                    )}
                  >
                    {player.role && roleData?.image ? (
                      <img
                        src={roleData.image}
                        alt={player.role}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <RoleIcon
                        size={32}
                        className={cn(
                          "transition-colors",
                          player.role ? roleData?.color : "text-muted-foreground"
                        )}
                      />
                    )}
                  </div>
                  <p
                    className={cn(
                      "font-bold text-sm transition-colors",
                      player.role ? roleData?.color : "text-muted-foreground"
                    )}
                  >
                    {player.role || "?"}
                  </p>
                </div>

                {/* Rolled Hero Display */}
                {player.role && !animatingPlayerId && (
                  <div className="pt-2 border-t border-primary/10">
                    {player.rolledHero || player.isRollingHero ? (
                      <div className={cn(
                        "flex items-center gap-2 bg-background/50 p-2 rounded-lg ring-1 ring-primary/20 transition-all",
                        player.isRollingHero && "animate-pulse ring-primary/50 scale-[1.02]"
                      )}>
                        <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-primary/30">
                          {player.rolledHero && (
                            <Image 
                              src={player.rolledHero.icon} 
                              alt={player.rolledHero.hero_name} 
                              fill 
                              className="object-cover"
                              unoptimized
                            />
                          )}
                        </div>
                        <div className="min-w-0 overflow-hidden">
                          <p className="text-xs font-bold truncate">{player.rolledHero?.hero_name || 'Rolling...'}</p>
                          <p className="text-[9px] text-muted-foreground truncate italic opacity-70">
                            {player.rolledHero?.hero_title || 'Waiting for result...'}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 ml-auto shrink-0 opacity-50 hover:opacity-100"
                          disabled={player.isRollingHero}
                          onClick={(e) => {
                            e.stopPropagation();
                            rollHero(player.id);
                          }}
                        >
                          <Shuffle size={12} className={player.isRollingHero ? "animate-spin" : ""} />
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="w-full text-[10px] h-8 gap-2 bg-primary/10 text-primary hover:bg-primary/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          rollHero(player.id);
                        }}
                      >
                        <Shuffle size={12} /> Roll a Hero 🎲
                      </Button>
                    )}
                  </div>
                )}

                {/* Role Exclude */}
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Lock size={10} /> Exclude:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {ROLES.map((role) => {
                      const isExcluded = player.excludedRoles.includes(role.id);
                      return (
                        <button
                          key={role.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExcludedRole(player.id, role.id);
                          }}
                          disabled={isAnimating}
                          className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded transition-colors",
                            isExcluded
                              ? "bg-destructive/20 text-destructive line-through"
                              : "bg-muted hover:bg-muted/80 text-muted-foreground"
                          )}
                        >
                          {role.abbr}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* History */}
                {showHistory && player.history.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <History size={10} /> Recent:
                    </p>
                    <div className="flex gap-1">
                      {player.history.slice(0, 5).map((h, i) => {
                        const r = ROLES.find((role) => role.name === h);
                        return (
                          <span
                            key={i}
                            className={cn("text-[9px] px-1 rounded", r?.bg, r?.color)}
                          >
                            {r?.abbr}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Swap Instructions */}
      {swapMode && (
        <div className="text-center text-sm text-muted-foreground animate-pulse">
          {selectedForSwap
            ? "Now click another player to swap roles"
            : "Click a player to select for swap"}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button
          size="lg"
          onClick={randomizeRoles}
          disabled={isAnimating}
          className={cn("gap-2 px-8", isAnimating && "animate-bounce")}
        >
          <Shuffle size={20} className={isAnimating ? "animate-spin" : ""} />
          {isAnimating ? "Rolling..." : "Random Roles!"}
        </Button>
        <Button size="lg" variant="outline" onClick={resetRoles} disabled={isAnimating}>
          Reset Roles
        </Button>
        <Button size="lg" variant="ghost" onClick={clearAllNames} disabled={isAnimating} className="gap-2">
          <X size={18} />
          Clear All
        </Button>
      </div>

      {/* Bottom Insights Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Strategy Card */}
        {currentStrategy && (
          <Card className="bg-primary/5 border-primary/20 overflow-hidden relative h-full">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Swords size={60} className="text-primary" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-primary flex items-center gap-2">
                <History size={18} /> Team Strategy Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h3 className="font-bold text-lg">{currentStrategy.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {currentStrategy.description}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Meta Recommendations */}
        <Card className={cn(
          "bg-primary/5 border-primary/10 h-full",
          !currentStrategy && "lg:col-span-2"
        )}>
          <CardHeader className="py-3">
            <CardTitle className="text-sm text-primary font-medium flex items-center gap-2">
              <Swords size={14} /> Meta Tier Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="py-3 pt-0">
            <div className="space-y-2">
              {ROLES.map((role) => (
                <div key={role.id} className="flex items-center justify-between text-xs py-1 border-b border-primary/5 last:border-0">
                  <span className={cn("font-bold w-16", role.color)}>{role.abbr}:</span>
                  <div className="flex gap-4 flex-1 justify-end">
                    {role.metaHeroes.map((heroName) => {
                      const hero = heroes.find(h => h.hero_name.toLowerCase() === heroName.toLowerCase());
                      const isNew = hero && (new Date().getTime() - new Date(hero.release_date).getTime() < 1000 * 60 * 60 * 24 * 180); // 6 months
                      
                      return (
                        <div key={heroName} className="flex items-center gap-1 group/hero cursor-help relative">
                          {hero ? (
                            <div className="flex items-center gap-2 pr-3 py-1 rounded-full bg-background/40 hover:bg-background/80 transition-all ring-1 ring-primary/5 hover:ring-primary/20">
                              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-primary/20 group-hover/hero:border-primary transition-colors">
                                <Image 
                                  src={hero.icon} 
                                  alt={heroName} 
                                  fill 
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1">
                                  <span className="font-bold text-[11px] leading-tight text-foreground transition-colors">{heroName}</span>
                                  {isNew && <span className="text-[8px] px-1 bg-red-500 text-white rounded-full font-black animate-pulse">NEW</span>}
                                  {heroName === "Natan" && <span className="text-[8px] px-1 bg-yellow-500 text-black rounded-full font-black">HOT</span>}
                                </div>
                                <span className="text-[9px] text-muted-foreground leading-tight truncate max-w-[100px]">
                                  {hero.specialty.replace(/\//g, ' • ')}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground group-hover/hero:text-foreground transition-colors">{heroName}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
