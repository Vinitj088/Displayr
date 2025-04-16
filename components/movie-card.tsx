import Link from "next/link"
import Image from "next/image"
import { Star } from "lucide-react"
import type { Movie } from "@/app/types"
import { TMDB_IMAGE_BASE_URL } from "@/app/config/constants"
import { cn } from "@/lib/utils"

interface MovieCardProps {
  movie: Movie
  className?: string
}

export default function MovieCard({ movie, className }: MovieCardProps) {
  const posterPath = movie.poster_path
    ? `${TMDB_IMAGE_BASE_URL}/w500${movie.poster_path}`
    : "/placeholder.svg?height=450&width=300"

  const href = movie.media_type === "tv" ? `/tv/${movie.id}` : `/movies/${movie.id}`

  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col overflow-hidden rounded-lg bg-black/20 transition-all hover:scale-105 hover:bg-black/40",
        className,
      )}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        <Image
          src={posterPath || "/placeholder.svg"}
          alt={movie.title || movie.name || "Movie poster"}
          fill
          className="object-cover transition-transform group-hover:scale-110"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
        />
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-1 font-medium">{movie.title || movie.name}</h3>
        <div className="mt-1 flex items-center text-xs text-white/70">
          <div className="flex items-center">
            <Star className="mr-1 h-3 w-3 text-yellow-400" />
            <span>{movie.vote_average?.toFixed(1)}</span>
          </div>
          <span className="mx-2">•</span>
          <span>{movie.release_date?.split("-")[0] || movie.first_air_date?.split("-")[0]}</span>
        </div>
      </div>
    </Link>
  )
}
