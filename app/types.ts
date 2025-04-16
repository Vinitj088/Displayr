// Movie type
export interface Movie {
  id: number
  title: string
  name?: string // For compatibility with TV shows in search results
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  popularity: number
  media_type?: string
  genre_ids?: number[]
  genres?: { id: number; name: string }[]
  runtime?: number
  first_air_date?: string // For compatibility with TV shows in search results
}

// TV Show type
export interface TVShow {
  id: number
  name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  first_air_date: string
  vote_average: number
  vote_count: number
  popularity: number
  media_type?: string
  genre_ids?: number[]
  genres?: { id: number; name: string }[]
  number_of_seasons?: number
  number_of_episodes?: number
  seasons?: {
    id: number
    name: string
    season_number: number
    episode_count: number
    air_date: string | null
    poster_path: string | null
    overview: string | null
  }[]
}

// Cast and crew types
export interface Person {
  id: number
  name: string
  profile_path: string | null
  character?: string
  job?: string
}

// Movie credits
export interface MovieCredits {
  id: number
  cast: Person[]
  crew: Person[]
}

// TV credits
export interface TVCredits {
  id: number
  cast: Person[]
  crew: Person[]
}

// Type guard to check if an item is a Movie
export function isMovie(item: Movie | TVShow): item is Movie {
  return "title" in item
}
