import { TMDB_API_KEY, TMDB_BASE_URL } from "../config/constants";
import { Movie, MovieCredits, TVShow, TVShowCredits, CastMember, TVCastMember, Season, Episode } from "../types";

export async function fetchTrendingMovies(
  timeWindow = "day"
): Promise<Movie[]> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/trending/movie/${timeWindow}?api_key=${TMDB_API_KEY}`
    );
    const data = await response.json();
    return data.results.map((movie: any) => ({ ...movie, media_type: 'movie' })) || [];
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    return [];
  }
}

export async function fetchMoviesByGenre(genreId: number): Promise<Movie[]> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&sort_by=popularity.desc`
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching movies by genre:", error);
    return [];
  }
}

export async function fetchMovieCredits(
  movieId: number
): Promise<MovieCredits> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`
    );
    const data = await response.json();

    const director = data.crew.find((person) => person.job === "Director");
    const cinematographer = data.crew.find(
      (person) =>
        person.job === "Director of Photography" ||
        person.job === "Cinematographer"
    );

    return {
      director: director?.name || "Not Available",
      cinematographer: cinematographer?.name || "Not Available",
    };
  } catch (error) {
    console.error("Error fetching credits:", error);
    return {
      director: "Not Available",
      cinematographer: "Not Available",
    };
  }
}

export async function fetchMovieTrailer(
  movieId: number
): Promise<string | null> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}`
    );
    const data = await response.json();
    const trailer = data.results.find(
      (video: any) => video.type === "Trailer" && video.site === "YouTube"
    );
    return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
  } catch (error) {
    console.error("Error fetching trailer:", error);
    return null;
  }
}

export async function fetchMovieDetails(movieId: number): Promise<Movie | null> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`
    );
    if (!response.ok) {
      console.error(`Error fetching movie details: ${response.statusText}`);
      return null;
    }
    const data = await response.json();

    const director = data.credits?.crew.find((person: any) => person.job === "Director")?.name || "Not Available";
    const cinematographer = data.credits?.crew.find(
      (person: any) => person.job === "Director of Photography" || person.job === "Cinematographer"
    )?.name || "Not Available";
    const trailer = data.videos?.results.find(
      (video: any) => video.type === "Trailer" && video.site === "YouTube"
    );
    const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
    const cast: CastMember[] = (data.credits?.cast || []).slice(0, 15);

    return {
      ...data, 
      director,
      cinematographer,
      trailerUrl,
      genres: data.genres || [], 
      cast, 
      media_type: 'movie',
    };
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return null;
  }
}

export async function fetchTrendingTV(
  timeWindow = "day"
): Promise<TVShow[]> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/trending/tv/${timeWindow}?api_key=${TMDB_API_KEY}`
    );
    const data = await response.json();
    return data.results.map((show: any) => ({ ...show, media_type: 'tv' })) || [];
  } catch (error) {
    console.error("Error fetching trending TV shows:", error);
    return [];
  }
}

export async function fetchTVSeasonDetails(tvId: number, seasonNumber: number): Promise<Season | null> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}`
    );
    if (!response.ok) {
      console.error(`Error fetching TV season details: ${response.statusText} (TV ID: ${tvId}, Season: ${seasonNumber})`);
      return null;
    }
    const data = await response.json();
    return { ...data, episodes: data.episodes || [] }; 
  } catch (error) {
    console.error(`Error fetching TV season details (TV ID: ${tvId}, Season: ${seasonNumber}):`, error);
    return null;
  }
}

export async function fetchTVDetails(tvId: number): Promise<TVShow | null> {
  try {
    // 1. Fetch base TV show details (includes basic season list)
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${tvId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`
    );
    if (!response.ok) {
      console.error(`Error fetching base TV details: ${response.statusText} (ID: ${tvId})`);
      return null;
    }
    const baseData = await response.json();

    // 2. Fetch details for EACH season concurrently
    const basicSeasons: Season[] = baseData.seasons || [];
    const seasonDetailPromises = basicSeasons.map(season => 
        fetchTVSeasonDetails(tvId, season.season_number)
    );
    
    const detailedSeasonsData = await Promise.all(seasonDetailPromises);

    // 3. Merge detailed episode data into the basic season info
    // We filter out null results in case a season fetch failed
    const mergedSeasons = basicSeasons.map(basicSeason => {
        const detailedData = detailedSeasonsData.find(
            detailed => detailed?.season_number === basicSeason.season_number
        );
        return {
            ...basicSeason, // Keep name, poster_path, etc. from base call
            episodes: detailedData?.episodes || [], // Add episodes from detailed call
            // Optionally merge other fields from detailedData if needed
            overview: detailedData?.overview || basicSeason.overview, // Prefer detailed overview
            name: detailedData?.name || basicSeason.name, // Prefer detailed name
        };
    }).filter(season => season !== null) as Season[]; // Ensure type correctness after filter

    // 4. Process other details (credits, videos, cast)
    const creators = baseData.created_by?.map((c: any) => c.name) || []; 
    const trailer = baseData.videos?.results.find(
      (video: any) => video.type === "Trailer" && video.site === "YouTube"
    );
    const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
    const cast: TVCastMember[] = (baseData.credits?.cast || []).slice(0, 15);

    // 5. Return combined data
    return {
      ...baseData,
      created_by: baseData.created_by || [],
      trailerUrl,
      genres: baseData.genres || [],
      cast,
      media_type: 'tv',
      seasons: mergedSeasons, // Use the merged seasons with episodes
      // latestSeason: undefined, // Remove latestSeason property explicitly if needed
    };
  } catch (error) {
    console.error(`Error fetching detailed TV details (ID: ${tvId}):`, error);
    return null;
  }
}

export async function searchMulti(query: string): Promise<(Movie | TVShow)[]> {
  if (!query) return [];
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`
    );
    const data = await response.json();
    return (data.results || []).filter(
      (item: any) => item.media_type === 'movie' || item.media_type === 'tv'
    );
  } catch (error) {
    console.error("Error searching multi:", error);
    return [];
  }
}
