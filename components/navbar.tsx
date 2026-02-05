import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="relative w-8 h-8 overflow-hidden rounded-lg">
              <img
                src="/assets/brand/logo.png"
                alt="MLBB Mize"
                className="w-full h-full object-cover"
              />
            </div>
            <span>MLBB <span className="text-primary">MIZE</span></span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/draft" className="transition-colors hover:text-primary">Draft Assistant</Link>
          <Link href="/heroes" className="transition-colors hover:text-primary">Hero Library</Link>
          <Link href="/roles" className="transition-colors hover:text-primary">Role Randomizer</Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button size="sm" className="hidden sm:inline-flex" asChild>
            <Link href="/draft">Get Started</Link>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu size={20} />
          </Button>
        </div>
      </div>
    </header>
  );
}
