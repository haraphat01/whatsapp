import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2 font-semibold text-zinc-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <MessageCircle className="h-4.5 w-4.5" />
          </span>
          ChatFrame <span className="text-emerald-600">AI</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-zinc-600 md:flex">
          <a href="#features" className="hover:text-zinc-900">Features</a>
          <a href="#use-cases" className="hover:text-zinc-900">Use cases</a>
          <Link href="/pricing" className="hover:text-zinc-900">Pricing</Link>
          <Link href="/projects" className="hover:text-zinc-900">Projects</Link>
          <Link href="/personas" className="hover:text-zinc-900">Characters</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Sign in</Button>
          </Link>
          <Link href="/create">
            <Button size="sm">Create Conversation</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
