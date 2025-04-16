import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Calendar, Clock, Star } from "lucide-react"
import { fetchMovieDetails, fetchMovieCredits, fetchMovieTrailer } from "@/app/utils/api"
import { Button } from "@/components/ui/button"
import { TMDB_IMAGE_BASE_URL } from "@/app/config/constants"
import CastSection from "@/components/cast-section"

interface MoviePageProps {
  params: {
    id: string
  }
}

export default async function MoviePage({ params }: MoviePageProps) {
  const movieId = params.id
  const [movie, credits, trailer] = await Promise.all([
    fetchMovieDetails(movieId),
    fetchMovieCredits(movieId),
    fetchMovieTrailer(movieId),
  ])

  const backdropPath = movie.backdrop_path
    ? `${TMDB_IMAGE_BASE_URL}/original${movie.backdrop_path}`
    : "/placeholder.svg?height=1080&width=1920"

  const posterPath = movie.poster_path
    ? `${TMDB_IMAGE_BASE_URL}/w500${movie.poster_path}`
    : "/placeholder.svg?height=450&width=300"

  // Format runtime to hours and minutes
  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="relative min-h-screen bg-black pb-12">
      {/* Backdrop */}
      <div className="absolute inset-0 z-0 h-[70vh]">
        <Image
          src={backdropPath || "/placeholder.svg"}
          alt={movie.title || "Movie backdrop"}
          fill
          priority
          className="object-cover object-top"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black" />
      </div>

      {/* Back button */}
      <Link
        href="/"
        className="relative z-10 ml-4 mt-4 inline-flex items-center rounded-full bg-black/50 px-3 py-2 text-sm backdrop-blur-sm transition-colors hover:bg-black/70 sm:ml-6 sm:mt-6"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back
      </Link>

      {/* Content */}
      <div className="container relative z-10 px-4 pt-16 sm:px-6 sm:pt-24">
        <div className="grid gap-8 md:grid-cols-[300px_1fr] lg:gap-12">
          {/* Poster */}
          <div className="mx-auto w-full max-w-[300px]">
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl shadow-2xl">
              <Image
                src={posterPath || "/placeholder.svg"}
                alt={movie.title || "Movie poster"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 80vw, 300px"
              />
            </div>
          </div>

          {/* Details */}
          <div>
            <h1 className="mb-2 text-3xl font-bold sm:text-4xl md:text-5xl">{movie.title}</h1>

            <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/70 sm:text-base">
              {movie.release_date && (
                <div className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  <span>{new Date(movie.release_date).getFullYear()}</span>
                </div>
              )}

              {movie.runtime && (
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  <span>{formatRuntime(movie.runtime)}</span>
                </div>
              )}

              {movie.vote_average && (
                <div className="flex items-center">
                  <Star className="mr-1 h-4 w-4 text-yellow-400" />
                  <span>{movie.vote_average.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <span key={genre.id} className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {/* Overview */}
            <p className="mb-6 text-white/80 sm:text-lg">{movie.overview}</p>

            {/* Action buttons */}
            <div className="mb-8 flex flex-wrap gap-3">
              {trailer && (
                <Button asChild size="lg" className="gap-2">
                  <a href={`https://www.youtube.com/watch?v=${trailer.key}`} target="_blank" rel="noopener noreferrer">
                    Watch Trailer
                  </a>
                </Button>
              )}

              <Button variant="outline" size="lg">
                Add to Watchlist
              </Button>
            </div>

            {/* Cast */}
            {credits && credits.cast && credits.cast.length > 0 && <CastSection cast={credits.cast.slice(0, 6)} />}
          </div>
        </div>
      </div>
    </div>
  )
}
