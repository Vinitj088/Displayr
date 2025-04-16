'use client';

import { useState, useEffect } from "react";
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Calendar, Clock, Star, Play } from "lucide-react"
import { fetchMovieDetails, fetchMovieCredits, fetchMovieTrailer, fetchSimilarMovies } from "@/app/utils/api"
import { Button } from "@/components/ui/button"
import { TMDB_IMAGE_BASE_URL } from "@/app/config/constants"
import CastSection from "@/components/cast-section"
import { useParams } from "next/navigation";
import BlurredBackground from "@/app/components/BlurredBackground";

interface MoviePageProps {
  params: {
    id: string
  }
}

export default function MoviePage({ params }: MoviePageProps) {
  const routeParams = useParams();
  if (!routeParams?.id) {
    throw new Error('Movie ID is required');
  }
  const movieId = routeParams.id;
  
  const [movie, setMovie] = useState<any>(null);
  const [credits, setCredits] = useState<any>(null);
  const [trailer, setTrailer] = useState<any>(null);
  const [similarMovies, setSimilarMovies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check on initial load
    checkIfMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [movieData, creditsData, trailerData, similarMoviesData] = await Promise.all([
          fetchMovieDetails(Number(movieId)),
          fetchMovieCredits(Number(movieId)),
          fetchMovieTrailer(Number(movieId)),
          fetchSimilarMovies(Number(movieId)),
        ]);
        
        setMovie(movieData);
        setCredits(creditsData);
        setTrailer(trailerData);
        setSimilarMovies(similarMoviesData.results || []);
       } catch (error) {
        console.error("Error fetching movie data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [movieId]);

  if (isLoading || !movie) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  const backdropPath = movie.backdrop_path
    ? `${TMDB_IMAGE_BASE_URL}/original${movie.backdrop_path}`
    : "/placeholder.svg?height=1080&width=1920"

  const posterPath = movie.poster_path
    ? `${TMDB_IMAGE_BASE_URL}/w500${movie.poster_path}`
    : "/placeholder.svg?height=450&width=300"

  // Format runtime to hours and minutes
  const formatRuntime = (minutes: number) => {
    if (!minutes) return "Unknown";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown";
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Use the BlurredBackground component */}
      <BlurredBackground imageUrl={backdropPath} alt={movie.title} />
      {/* Modal for trailer */}
      {showTrailer && trailer && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setShowTrailer(false)}>
          <div className="relative w-full max-w-5xl aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
              className="absolute inset-0 w-full h-full rounded-xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <button 
              className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              onClick={(e) => { e.stopPropagation(); setShowTrailer(false); }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="min-h-screen px-4 py-6 md:px-8 lg:px-12">
        

        <div className="max-w-7xl mx-auto mt-12 md:mt-16">
          <div className="grid gap-8 md:grid-cols-[320px_1fr] lg:gap-12">
            {/* Poster */}
            <div className="relative">
              <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl shadow-2xl border border-white/10">
                <Image
                  src={posterPath}
                  alt={movie.title || "Movie poster"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 320px"
                  priority
                />
              </div>
              
              {/* Watch Trailer Button (Mobile) */}
              {trailer && isMobile && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 py-3 text-white font-medium hover:bg-white/20 transition-colors w-5/6"
                >
                  <Play className="h-5 w-5" />
                  Watch Trailer
                </button>
              )}
            </div>

            {/* Details */}
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight text-white">{movie.title}</h1>
              
              {movie.tagline && (
                <p className="text-white/70 text-lg mb-5 italic">{movie.tagline}</p>
              )}

              {/* Info badges */}
              <div className="flex flex-wrap gap-3 mb-6">
                {movie.release_date && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-sm">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(movie.release_date).getFullYear()}
                  </span>
                )}

                {movie.runtime > 0 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-sm">
                    <Clock className="h-3.5 w-3.5" />
                    {formatRuntime(movie.runtime)}
                  </span>
                )}

                {movie.vote_average > 0 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-sm">
                    <Star className="h-3.5 w-3.5 text-yellow-400" />
                    {movie.vote_average.toFixed(1)}
                  </span>
                )}
              </div>

              {/* Genres */}
              {movie.genres && movie.genres.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm uppercase text-white/50 mb-2">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map((genre: any) => (
                      <span key={genre.id} className="px-3 py-1 rounded-lg bg-white/10 text-sm">
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Overview */}
              <div className="mb-8">
                <h3 className="text-sm uppercase text-white/50 mb-2">Overview</h3>
                <p className="text-white/90 text-base leading-relaxed">{movie.overview}</p>
              </div>

              {/* Watch Trailer Button (Desktop) */}
              {trailer && !isMobile && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-6 py-3 text-white font-medium hover:bg-white/20 transition-colors max-w-xs"
                >
                  <Play className="h-5 w-5" />
                  Watch Trailer
                </button>
              )}

              {/* Cast Section */}
              {credits && credits.cast && credits.cast.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-sm uppercase text-white/50 mb-4">Top Cast</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {credits.cast.slice(0, 8).map((person: any) => (
                      <div key={person.id} className="flex items-center gap-3 bg-white/5 backdrop-blur-md rounded-lg p-2">
                        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md">
                          <Image
                            src={person.profile_path ? `${TMDB_IMAGE_BASE_URL}/w185${person.profile_path}` : "/avatar-placeholder.png"}
                            alt={person.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{person.name}</p>
                          <p className="text-xs text-white/60 truncate">{person.character}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Details Section */}
          <div className="mt-16 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold mb-6">Additional Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {movie.release_date && (
                <div>
                  <h3 className="text-sm uppercase text-white/50 mb-1">Release Date</h3>
                  <p>{formatDate(movie.release_date)}</p>
                </div>
              )}
              
              {movie.status && (
                <div>
                  <h3 className="text-sm uppercase text-white/50 mb-1">Status</h3>
                  <p>{movie.status}</p>
                </div>
              )}
              
              {movie.original_language && (
                <div>
                  <h3 className="text-sm uppercase text-white/50 mb-1">Language</h3>
                  <p>{new Intl.DisplayNames(['en'], {type: 'language'}).of(movie.original_language)}</p>
                </div>
              )}
              
              {movie.budget > 0 && (
                <div>
                  <h3 className="text-sm uppercase text-white/50 mb-1">Budget</h3>
                  <p>${movie.budget.toLocaleString()}</p>
                </div>
              )}
              
              {movie.revenue > 0 && (
                <div>
                  <h3 className="text-sm uppercase text-white/50 mb-1">Revenue</h3>
                  <p>${movie.revenue.toLocaleString()}</p>
                </div>
              )}
              
              {movie.production_companies && movie.production_companies.length > 0 && (
                <div>
                  <h3 className="text-sm uppercase text-white/50 mb-1">Production</h3>
                  <p>{movie.production_companies.map((company: any) => company.name).join(', ')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Similar Movies Section */}
          {similarMovies.length > 0 && (
            <div className="mt-16">
              <h2 className="text-xl font-semibold mb-6">Similar Movies</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {similarMovies.slice(0, 10).map((movie) => (
                  <Link href={`/movies/${movie.id}`} key={movie.id} className="block group">
                    <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-white/10 transition-all group-hover:border-white/30">
                      <Image
                        src={movie.poster_path ? `${TMDB_IMAGE_BASE_URL}/w342${movie.poster_path}` : "/placeholder.svg"}
                        alt={movie.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <h3 className="mt-2 text-sm font-medium truncate">{movie.title}</h3>
                    {movie.release_date && (
                      <p className="text-xs text-white/60">{new Date(movie.release_date).getFullYear()}</p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
