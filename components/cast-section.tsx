import Image from "next/image"
import { TMDB_IMAGE_BASE_URL } from "@/app/config/constants"

interface CastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
}

interface CastSectionProps {
  cast: CastMember[]
}

export default function CastSection({ cast }: CastSectionProps) {
  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">Cast</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
        {cast.map((person) => {
          const profilePath = person.profile_path
            ? `${TMDB_IMAGE_BASE_URL}/w185${person.profile_path}`
            : "/placeholder.svg?height=185&width=185"

          return (
            <div key={person.id} className="text-center">
              <div className="relative mx-auto mb-2 aspect-square w-full max-w-[120px] overflow-hidden rounded-full">
                <Image
                  src={profilePath || "/placeholder.svg"}
                  alt={person.name}
                  fill
                  className="object-cover"
                  sizes="120px"
                />
              </div>
              <h3 className="text-sm font-medium">{person.name}</h3>
              <p className="text-xs text-white/60">{person.character}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
