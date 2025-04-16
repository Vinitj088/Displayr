import type { Movie, MovieCredits, TVShow, TVCredits } from "@/app/types"
import { TMDB_BASE_URL, TMDB_API_KEY } from "@/app/config/constants"

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

// Fetch trending movies
export async function fetchTrendingMovies(): Promise<Movie[]> {
  const url = `${TMDB_BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}`
  const response = await fetch(url, { next: { revalidate: 3600 } }) // Cache for 1 hour
  const data = await handleResponse<{ results: Movie[] }>(response)
  return data.results
}

// Fetch movie details
export async function fetchMovieDetails(movieId: string | number): Promise<Movie> {
  const url = `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`
  const response = await fetch(url, { next: { revalidate: 86400 } }) // Cache for 24 hours
  return handleResponse<Movie>(response)
}

// Fetch movie credits
export async function fetchMovieCredits(movieId: string | number): Promise<MovieCredits> {
  const url = `${TMDB_BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`
  const response = await fetch(url, { next: { revalidate: 86400 } }) // Cache for 24 hours
  return handleResponse<MovieCredits>(response)
}

// Fetch movie trailer
export async function fetchMovieTrailer(movieId: string | number) {
  const url = `${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}`
  const response = await fetch(url, { next: { revalidate: 86400 } }) // Cache for 24 hours
  const data = await handleResponse<{ results: { key: string; type: string; site: string }[] }>(response)

  // Find a YouTube trailer
  const trailer = data.results.find((video) => video.site === "YouTube" && video.type === "Trailer")

  // If no trailer, try to find a teaser
  if (!trailer) {
    return data.results.find((video) => video.site === "YouTube" && video.type === "Teaser")
  }

  return trailer
}

// Fetch TV show details
export async function fetchTVDetails(tvId: string | number): Promise<TVShow> {
  const url = `${TMDB_BASE_URL}/tv/${tvId}?api_key=${TMDB_API_KEY}`
  const response = await fetch(url, { next: { revalidate: 86400 } }) // Cache for 24 hours
  return handleResponse<TVShow>(response)
}

// Fetch TV show credits
export async function fetchTVCredits(tvId: string | number): Promise<TVCredits> {
  const url = `${TMDB_BASE_URL}/tv/${tvId}/credits?api_key=${TMDB_API_KEY}`
  const response = await fetch(url, { next: { revalidate: 86400 } }) // Cache for 24 hours
  return handleResponse<TVCredits>(response)
}

// Fetch TV show trailer
export async function fetchTVTrailer(tvId: string | number) {
  const url = `${TMDB_BASE_URL}/tv/${tvId}/videos?api_key=${TMDB_API_KEY}`
  const response = await fetch(url, { next: { revalidate: 86400 } }) // Cache for 24 hours
  const data = await handleResponse<{ results: { key: string; type: string; site: string }[] }>(response)

  // Find a YouTube trailer
  const trailer = data.results.find((video) => video.site === "YouTube" && video.type === "Trailer")

  // If no trailer, try to find a teaser
  if (!trailer) {
    return data.results.find((video) => video.site === "YouTube" && video.type === "Teaser")
  }

  return trailer
}

// Search for movies
export async function searchMovies(query: string): Promise<Movie[]> {
  const url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
  const response = await fetch(url)
  const data = await handleResponse<{ results: Movie[] }>(response)
  return data.results
}

// Search for movies and TV shows
export async function searchMulti(query: string): Promise<(Movie | TVShow)[]> {
  const url = `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
  const response = await fetch(url)
  const data = await handleResponse<{ results: (Movie | TVShow)[] }>(response)
  return data.results.filter((item) => item.media_type === "movie" || item.media_type === "tv")
}
