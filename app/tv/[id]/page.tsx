'use client';

import { useState, useEffect } from "react";
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Calendar, Star, Play } from "lucide-react"
import { fetchTVDetails, fetchTVCredits, fetchTVTrailer, fetchSimilarTV } from "@/app/utils/api"
import { Button } from "@/components/ui/button"
import { TMDB_IMAGE_BASE_URL } from "@/app/config/constants"
import CastSection from "@/components/cast-section"
import SeasonsList from "@/components/seasons-list"
import { useParams } from "next/navigation";
import BlurredBackground from "@/app/components/BlurredBackground";

interface TVPageProps {
  params: {
    id: string
  }
}

export default function TVPage({ params }: TVPageProps) {
  // Use the hook-based approach
  const routeParams = useParams();
  const tvId = routeParams.id as string;

  const [show, setShow] = useState<any>(null);
  const [credits, setCredits] = useState<any>(null);
  const [trailer, setTrailer] = useState<any>(null);
  const [similarShows, setSimilarShows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeSeasonIndex, setActiveSeasonIndex] = useState(0);

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
        const [showData, creditsData, trailerData, similarData] = await Promise.all([
          fetchTVDetails(tvId),
          fetchTVCredits(tvId),
          fetchTVTrailer(tvId),
          fetchSimilarTV(tvId)
        ]);
        
        setShow(showData);
        setCredits(creditsData);
        setTrailer(trailerData);
        setSimilarShows(similarData.results || []);
      } catch (error) {
        console.error("Error fetching TV show data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [tvId]);

  if (isLoading || !show) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  const backdropPath = show.backdrop_path
    ? `${TMDB_IMAGE_BASE_URL}/original${show.backdrop_path}`
    : "/placeholder.svg?height=1080&width=1920"

  const posterPath = show.poster_path
    ? `${TMDB_IMAGE_BASE_URL}/w500${show.poster_path}`
    : "/placeholder.svg?height=450&width=300"

  // Format date to readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown";
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Get active season
  const activeSeason = show.seasons && show.seasons.length > 0 ? show.seasons[activeSeasonIndex] : null;

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Use the BlurredBackground component */}
      <BlurredBackground imageUrl={backdropPath} alt={show.name || "TV show backdrop"} />

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
                  alt={show.name || "TV show poster"}
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
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight">{show.name}</h1>
              
              {show.tagline && (
                <p className="text-white/70 text-lg mb-5 italic">{show.tagline}</p>
              )}

              {/* Info badges */}
              <div className="flex flex-wrap gap-3 mb-6">
                {show.first_air_date && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-sm">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(show.first_air_date).getFullYear()}
                  </span>
                )}

                {show.number_of_seasons > 0 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-sm">
                    {show.number_of_seasons} Season{show.number_of_seasons !== 1 ? "s" : ""}
                  </span>
                )}

                {show.vote_average > 0 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-sm">
                    <Star className="h-3.5 w-3.5 text-yellow-400" />
                    {show.vote_average.toFixed(1)}
                  </span>
                )}
              </div>

              {/* Genres */}
              {show.genres && show.genres.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm uppercase text-white/50 mb-2">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {show.genres.map((genre: any) => (
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
                <p className="text-white/90 text-base leading-relaxed">{show.overview}</p>
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

          {/* Seasons Section */}
          {show.seasons && show.seasons.length > 0 && (
            <div className="mt-16 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold mb-6">Seasons</h2>
              
              {/* Season tabs */}
              <div className="flex flex-nowrap gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {show.seasons.map((season: any, index: number) => (
                  <button
                    key={season.id}
                    onClick={() => setActiveSeasonIndex(index)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                      index === activeSeasonIndex
                        ? 'bg-white/20 text-white font-medium'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {season.name}
                  </button>
                ))}
              </div>
              
              {/* Active season details */}
              {activeSeason && (
                <div className="grid md:grid-cols-[180px_1fr] gap-6">
                  {activeSeason.poster_path && (
                    <div className="hidden md:block relative aspect-[2/3] w-full overflow-hidden rounded-xl shadow-lg">
                      <Image
                        src={`${TMDB_IMAGE_BASE_URL}/w342${activeSeason.poster_path}`}
                        alt={activeSeason.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  
                  <div>
                    <div className="flex flex-wrap gap-y-2 gap-x-6 mb-4">
                      <div>
                        <h3 className="text-sm uppercase text-white/50">Air Date</h3>
                        <p>{activeSeason.air_date ? formatDate(activeSeason.air_date) : 'Unknown'}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm uppercase text-white/50">Episodes</h3>
                        <p>{activeSeason.episode_count || 'Unknown'}</p>
                      </div>
                    </div>
                    
                    {activeSeason.overview && (
                      <div className="mb-4">
                        <h3 className="text-sm uppercase text-white/50 mb-1">Overview</h3>
                        <p className="text-white/90">{activeSeason.overview}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Additional Details Section */}
          <div className="mt-16 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold mb-6">Additional Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {show.first_air_date && (
                <div>
                  <h3 className="text-sm uppercase text-white/50 mb-1">First Air Date</h3>
                  <p>{formatDate(show.first_air_date)}</p>
                </div>
              )}
              
              {show.last_air_date && (
                <div>
                  <h3 className="text-sm uppercase text-white/50 mb-1">Last Air Date</h3>
                  <p>{formatDate(show.last_air_date)}</p>
                </div>
              )}
              
              {show.status && (
                <div>
                  <h3 className="text-sm uppercase text-white/50 mb-1">Status</h3>
                  <p>{show.status}</p>
                </div>
              )}
              
              {show.type && (
                <div>
                  <h3 className="text-sm uppercase text-white/50 mb-1">Type</h3>
                  <p>{show.type}</p>
                </div>
              )}
              
              {show.original_language && (
                <div>
                  <h3 className="text-sm uppercase text-white/50 mb-1">Language</h3>
                  <p>{new Intl.DisplayNames(['en'], {type: 'language'}).of(show.original_language)}</p>
                </div>
              )}
              
              {show.networks && show.networks.length > 0 && (
                <div>
                  <h3 className="text-sm uppercase text-white/50 mb-1">Networks</h3>
                  <p>{show.networks.map((network: any) => network.name).join(', ')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Similar Shows Section */}
          {similarShows.length > 0 && (
            <div className="mt-16">
              <h2 className="text-xl font-semibold mb-6">Similar TV Shows</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {similarShows.slice(0, 10).map((show) => (
                  <Link href={`/tv/${show.id}`} key={show.id} className="block group">
                    <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-white/10 transition-all group-hover:border-white/30">
                      <Image
                        src={show.poster_path ? `${TMDB_IMAGE_BASE_URL}/w342${show.poster_path}` : "/placeholder.svg"}
                        alt={show.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <h3 className="mt-2 text-sm font-medium truncate">{show.name}</h3>
                    {show.first_air_date && (
                      <p className="text-xs text-white/60">{new Date(show.first_air_date).getFullYear()}</p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
