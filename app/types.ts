export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

// Can often be reused for TV
export type TVCastMember = CastMember; 

export interface Genre {
  id: number;
  name: string;
}

export interface Movie {
  id: number;
  title: string;
  overview: string;
  backdrop_path: string | null;
  poster_path: string | null;
  release_date?: string;
  vote_average?: number;
  genres?: Genre[];
  runtime?: number; 
  director?: string;
  cinematographer?: string;
  trailerUrl?: string | null;
  cast?: CastMember[];
  media_type?: 'movie'; // Add media_type for multi search
}

export interface MovieCredits {
  director: string;
  cinematographer: string;
}

// --- TV Show Types ---

// Define the structure for a single episode
export interface Episode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  air_date: string | null;
  still_path: string | null; // Image for the episode
  vote_average?: number;
  // Add other relevant episode fields if needed
}

// Define the structure for a single season
export interface Season {
  _id?: string; // Internal ID from TMDB if needed, often prefixed
  id: number; // TMDB's unique ID for the season object itself
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  air_date: string | null; // Air date of the first episode of the season
  episode_count?: number; // This often comes from the main TV show details
  episodes?: Episode[]; // Embed episodes fetched for this season
}

export interface TVShow {
  id: number;
  name: string; // TV shows use 'name' instead of 'title'
  overview: string;
  backdrop_path: string | null;
  poster_path: string | null;
  first_air_date?: string; // TV shows use 'first_air_date'
  vote_average?: number;
  genres?: Genre[];
  episode_run_time?: number[]; // Often an array of runtimes
  number_of_seasons?: number;
  number_of_episodes?: number;
  created_by?: { id: number; name: string; profile_path: string | null }[]; // Creators
  trailerUrl?: string | null;
  cast?: TVCastMember[];
  media_type?: 'tv'; // Add media_type for multi search
  seasons?: Season[]; // Include basic season list from main call
  latestSeason?: Season | null; // Add field for the detailed latest season with episodes
}

// Simplified TV Credits (can expand later if needed)
export interface TVShowCredits {
   // Example: Add creators or specific crew roles if needed
   creators?: string[]; 
}

// Type guard to check if an item is a Movie
export function isMovie(item: Movie | TVShow): item is Movie {
  return (item as Movie).title !== undefined;
}

// Type guard to check if an item is a TVShow
export function isTVShow(item: Movie | TVShow): item is TVShow {
  return (item as TVShow).name !== undefined;
}
