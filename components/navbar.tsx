"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Home, Film, Tv } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="container flex h-16 items-center px-4 sm:px-6">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Film className="h-6 w-6 text-white" />
          <span className="hidden font-bold sm:inline-block">Displayr</span>
        </Link>
        <nav className="flex flex-1 items-center justify-between">
          <div className="flex items-center space-x-1 sm:space-x-4">
            <Link
              href="/"
              className={cn(
                "flex h-9 items-center rounded-md px-2 text-sm font-medium transition-colors hover:bg-white/10",
                pathname === "/" ? "bg-white/10 text-white" : "text-white/60",
              )}
            >
              <Home className="mr-1 h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline-block">Home</span>
            </Link>
            <Link
              href="/movies"
              className={cn(
                "flex h-9 items-center rounded-md px-2 text-sm font-medium transition-colors hover:bg-white/10",
                pathname.startsWith("/movies") ? "bg-white/10 text-white" : "text-white/60",
              )}
            >
              <Film className="mr-1 h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline-block">Movies</span>
            </Link>
            <Link
              href="/tv"
              className={cn(
                "flex h-9 items-center rounded-md px-2 text-sm font-medium transition-colors hover:bg-white/10",
                pathname.startsWith("/tv") ? "bg-white/10 text-white" : "text-white/60",
              )}
            >
              <Tv className="mr-1 h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline-block">TV Shows</span>
            </Link>
          </div>
          <Link
            href="/search"
            className={cn(
              "flex h-9 items-center rounded-md px-2 text-sm font-medium transition-colors hover:bg-white/10",
              pathname === "/search" ? "bg-white/10 text-white" : "text-white/60",
            )}
          >
            <Search className="mr-1 h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline-block">Search</span>
          </Link>
        </nav>
      </div>
    </header>
  )
}
