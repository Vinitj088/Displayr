import { fetchTrendingMovies } from "@/app/utils/api"
import MovieGrid from "@/components/movie-grid"
import HeroSection from "@/components/hero-section"

export default async function Home() {
  try {
    const trendingMovies = await fetchTrendingMovies()

    // Use the first movie as the hero
    const heroMovie = trendingMovies[0]
    const gridMovies = trendingMovies.slice(1)

    return (
      <div className="flex flex-col">
        {heroMovie && <HeroSection movie={heroMovie} />}
        <div className="container px-4 py-8 sm:px-6 sm:py-12">
          <h2 className="mb-6 text-2xl font-bold sm:text-3xl">Trending Movies</h2>
          <MovieGrid movies={gridMovies} />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error in Home page:", error)
    return (
      <div className="container flex min-h-[50vh] items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Something went wrong</h1>
          <p className="text-white/70">Unable to load movies. Please try again later.</p>
        </div>
      </div>
    )
  }
}
