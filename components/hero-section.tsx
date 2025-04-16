import Link from "next/link"
import Image from "next/image"
import { Play, Star } from "lucide-react"
import type { Movie } from "@/app/types"
import { TMDB_IMAGE_BASE_URL } from "@/app/config/constants"
import { Button } from "@/components/ui/button"

interface HeroSectionProps {
  movie: Movie
}

export default function HeroSection({ movie }: HeroSectionProps) {
  const backdropPath = movie.backdrop_path
    ? `${TMDB_IMAGE_BASE_URL}/original${movie.backdrop_path}`
    : "/placeholder.svg?height=1080&width=1920"

  return (
    <div className="relative h-[50vh] w-full overflow-hidden sm:h-[60vh] lg:h-[70vh]">
      {/* Backdrop Image */}
      <div className="absolute inset-0">
        <Image
          src={backdropPath || "/placeholder.svg"}
          alt={movie.title || "Movie backdrop"}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/20" />
      </div>

      {/* Content */}
      <div className="container relative z-10 flex h-full flex-col justify-end px-4 pb-8 sm:px-6 sm:pb-12">
        <div className="max-w-2xl">
          <h1 className="mb-2 text-3xl font-bold sm:text-4xl md:text-5xl">{movie.title}</h1>

          <div className="mb-4 flex items-center space-x-4">
            <div className="flex items-center">
              <Star className="mr-1 h-4 w-4 text-yellow-400" />
              <span>{movie.vote_average?.toFixed(1)}</span>
            </div>
            <span className="text-white/70">{movie.release_date?.split("-")[0]}</span>
          </div>

          <p className="mb-6 line-clamp-2 text-sm text-white/80 sm:line-clamp-3 sm:text-base md:line-clamp-4">
            {movie.overview}
          </p>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link href={`/movies/${movie.id}`}>
                <Play className="h-4 w-4" />
                Watch Now
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href={`/movies/${movie.id}`}>More Info</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
