import Image from "next/image"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { TMDB_IMAGE_BASE_URL } from "@/app/config/constants"

interface Season {
  id: number
  name: string
  season_number: number
  episode_count: number
  air_date: string | null
  poster_path: string | null
  overview: string | null
}

interface SeasonsListProps {
  seasons: Season[]
  showId: number
}

export default function SeasonsList({ seasons, showId }: SeasonsListProps) {
  // Filter out season 0 (specials) if it exists
  const filteredSeasons = seasons.filter((season) => season.season_number > 0)

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Seasons</h2>
      <div className="space-y-6">
        {filteredSeasons.map((season) => {
          const posterPath = season.poster_path
            ? `${TMDB_IMAGE_BASE_URL}/w300${season.poster_path}`
            : "/placeholder.svg?height=450&width=300"

          return (
            <div key={season.id} className="overflow-hidden rounded-lg bg-white/5 transition-colors hover:bg-white/10">
              <Link href={`/tv/${showId}/season/${season.season_number}`}>
                <div className="flex flex-col sm:flex-row">
                  <div className="relative h-48 w-full sm:h-auto sm:w-36 md:w-48">
                    <Image
                      src={posterPath || "/placeholder.svg"}
                      alt={season.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 144px, 192px"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-4">
                    <div>
                      <h3 className="text-lg font-medium">{season.name}</h3>
                      <div className="mt-1 text-sm text-white/70">
                        {season.episode_count} Episode{season.episode_count !== 1 ? "s" : ""}
                        {season.air_date && ` • ${new Date(season.air_date).getFullYear()}`}
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-white/60">
                        {season.overview || "No overview available."}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center text-sm font-medium text-white/80">
                      View Episodes
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
