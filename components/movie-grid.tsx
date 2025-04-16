import type { Movie } from "@/app/types"
import MovieCard from "./movie-card"

interface MovieGridProps {
  movies: Movie[]
  title?: string
}

export default function MovieGrid({ movies, title }: MovieGridProps) {
  return (
    <div>
      {title && <h2 className="mb-6 text-2xl font-bold">{title}</h2>}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  )
}
