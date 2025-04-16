"use client"

import type React from "react"
import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import MovieGrid from "@/components/movie-grid"
import { searchMovies } from "@/app/utils/api"
import type { Movie } from "@/app/types"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Movie[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!query.trim()) return

    setIsSearching(true)
    setHasSearched(true)
    setError(null)

    try {
      const searchResults = await searchMovies(query)
      setResults(searchResults)
    } catch (error) {
      console.error("Search error:", error)
      setError("Failed to fetch search results. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="container px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="mb-8 text-center text-3xl font-bold sm:text-4xl">Search Movies & TV Shows</h1>

      <form onSubmit={handleSearch} className="mx-auto mb-12 flex max-w-2xl gap-2">
        <Input
          type="text"
          placeholder="Search for movies or TV shows..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-12 bg-white/5 text-white placeholder:text-white/50 focus-visible:ring-white/30"
        />
        <Button type="submit" className="h-12 px-6" disabled={isSearching}>
          {isSearching ? (
            "Searching..."
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Search
            </>
          )}
        </Button>
      </form>

      {error && (
        <div className="mb-8 rounded-lg bg-red-500/10 p-4 text-center text-red-500">
          <p>{error}</p>
        </div>
      )}

      {hasSearched && !error && (
        <div>
          {results.length > 0 ? (
            <>
              <h2 className="mb-6 text-xl font-medium">Search results for "{query}"</h2>
              <MovieGrid movies={results} />
            </>
          ) : (
            <div className="text-center">
              <p className="text-lg text-white/70">No results found for "{query}"</p>
              <p className="mt-2 text-white/50">Try a different search term</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
