"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

export default function Navbar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const filterType = searchParams.get('filter') || 'all'

  return (
    <header className="fixed top-0 z-50 w-full bg-transparent">
      <div className="w-full flex h-12 items-center justify-between px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center">
          <Link
            href="/"
            className={cn(
              "text-sm font-medium transition-colors hover:text-white",
              pathname === "/" && !filterType ? "text-white" : "text-white/70",
            )}
          >
            Home
          </Link>
        </nav>
        
        <nav className="flex items-center space-x-4 sm:space-x-6">
          <Link
            href="/?filter=all"
            className={cn(
              "text-sm font-medium transition-colors hover:text-white",
              (pathname === "/" && filterType === 'all') ? "text-white" : "text-white/70",
            )}
          >
            All
          </Link>
          <Link
            href="/?filter=movie"
            className={cn(
              "text-sm font-medium transition-colors hover:text-white",
              (pathname === "/" && filterType === 'movie') ? "text-white" : "text-white/70",
            )}
          >
            Movies
          </Link>
          <Link
            href="/?filter=tv"
            className={cn(
              "text-sm font-medium transition-colors hover:text-white",
              (pathname === "/" && filterType === 'tv') ? "text-white" : "text-white/70",
            )}
          >
            TV Shows
          </Link>
        </nav>
      </div>
    </header>
  )
}
