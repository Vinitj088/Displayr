import { fetchTVDetails } from '@/app/utils/api'; // Use fetchTVDetails
import { TVShow, Episode, Season } from '@/app/types'; // Use TVShow type, Episode type, and Season type
import { TMDB_IMAGE_BASE_URL } from '@/app/config/constants';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

interface TVDetailsPageProps {
  params: { slug: string }; 
}

// Helper to extract ID from slug
function getShowIdFromSlug(slug: string): number | null {
  const match = slug.match(/^(\d+)/); 
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return null;
}

// Generate Metadata for TV Show
export async function generateMetadata(props: TVDetailsPageProps) {
  const slug = props.params.slug;
  const showId = getShowIdFromSlug(slug);

  if (showId === null) return { title: 'Invalid TV Show Link' };

  const show = await fetchTVDetails(showId); // Use fetchTVDetails
  if (!show) return { title: 'TV Show Not Found' };

  return {
    // Use name for TV shows
    title: `${show.name} - Displayr`, 
    description: show.overview,
  };
}

// Helper function to format episode runtime (uses first element if array)
function formatEpisodeRuntime(runtime?: number[]): string | null {
  if (!runtime || runtime.length === 0) return null;
  const minutes = runtime[0]; // Take the first runtime value
  if (minutes <= 0) return null;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  let formatted = '';
  if (hours > 0) formatted += `${hours}h`;
  if (remainingMinutes > 0) formatted += ` ${remainingMinutes}m`;
  return formatted.trim() || null;
}

// --- Helper Function to format Date ---
function formatDate(dateString: string | null): string | null {
  if (!dateString) return null;
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return dateString; // Return original string if formatting fails
  }
}

// TV Show Details Page Component
export default async function TVDetailsPage(props: TVDetailsPageProps) {
  const slug = props.params.slug;
  console.log('[TVDetailsPage] Received slug:', slug); // Log slug
  const showId = getShowIdFromSlug(slug);
  console.log('[TVDetailsPage] Extracted showId:', showId); // Log showId

  if (showId === null) {
    console.error("[TVDetailsPage] Invalid TV show slug format, calling notFound():", slug);
    notFound();
  }

  const show = await fetchTVDetails(showId); // Use fetchTVDetails
  console.log('[TVDetailsPage] Fetched show details:', show); // Log fetched show

  if (!show) {
    console.error(`[TVDetailsPage] TV show not found for ID ${showId}, calling notFound().`);
    notFound();
  }

  // Use TVShow properties
  const posterPath = show.poster_path ? `${TMDB_IMAGE_BASE_URL}w500${show.poster_path}` : '/placeholder-poster.png';
  const backdropPath = show.backdrop_path ? `${TMDB_IMAGE_BASE_URL}original${show.backdrop_path}` : null;
  const formattedRuntime = formatEpisodeRuntime(show.episode_run_time); // Use episode runtime

  return (
    <div className="movie-detail-layout"> {/* Can reuse layout class */}
      {/* --- Backdrop Section --- */}
      <div className="backdrop-section">
        {backdropPath && (
          <Image
            src={backdropPath}
            alt={`${show.name} backdrop`} // Use name
            fill
            style={{ objectFit: 'cover' }}
            priority
            quality={75}
          />
        )}
        <div className="backdrop-gradient-overlay"></div>
        <Link href="/" className="back-home-link">← Home</Link>
      </div>

      {/* --- Content Section --- */}
      <div className="content-section">
        <div className="main-details-grid">
          {/* Poster Column */}
          <div className="poster-column">
            <Image
              src={posterPath}
              alt={show.name} // Use name
              width={300} 
              height={450}
              className="detail-poster-image"
              priority
            />
          </div>

          {/* Info Column */}
          <div className="info-column">
            <h1 className="detail-title">{show.name}</h1> {/* Use name */}
            <div className="meta-tags">
               {/* Use first_air_date */}
              {show.first_air_date && <span>{show.first_air_date.substring(0, 4)}</span>}
              {formattedRuntime && <span>~{formattedRuntime}/ep</span>} {/* Add /ep indicator */}
              {show.vote_average && (
                <span className="rating-tag">★ {show.vote_average.toFixed(1)}</span>
              )}
              {show.number_of_seasons && <span>{show.number_of_seasons} Season(s)</span>}
            </div>
            <p className="detail-overview">{show.overview}</p>
            <div className="detail-actions">
              {show.trailerUrl && (
                <a href={show.trailerUrl} target="_blank" rel="noopener noreferrer" className="detail-action-button secondary">
                  ▷ Watch Trailer
                </a>
              )}
              <button className="detail-action-button secondary" disabled>More</button>
            </div>
            <div className="detail-meta-info">
                {show.genres && show.genres.length > 0 && (
                   <p><strong>Genre:</strong> {show.genres.map(g => g.name).join(', ')}</p>
                 )}
                 {show.created_by && show.created_by.length > 0 && (
                     <p><strong>Creator(s):</strong> {show.created_by.map(c => c.name).join(', ')}</p>
                 )}
                 {show.number_of_episodes && <p><strong>Episodes:</strong> {show.number_of_episodes}</p>}
            </div>
          </div>
        </div>

        {/* --- Cast Section --- */}
        {show.cast && show.cast.length > 0 && (
          <div className="cast-section">
            <h2 className="section-title">Cast</h2>
            <div className="cast-list">
              {show.cast.map((member) => (
                <div key={member.id} className="cast-member">
                  <Image
                    src={member.profile_path ? `${TMDB_IMAGE_BASE_URL}w185${member.profile_path}` : '/placeholder-person.png'}
                    alt={member.name}
                    width={100}
                    height={150}
                    className="cast-member-image"
                  />
                  <p className="cast-member-name">{member.name}</p>
                  <p className="cast-member-character">{member.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- All Seasons Episodes Section --- */}
        {show.seasons && show.seasons.length > 0 && (
          <div className="all-seasons-section">
            <h2 className="section-title">Seasons & Episodes</h2>
            {show.seasons
              // Optional: Filter out seasons with no episodes if desired
              // .filter(season => season.episodes && season.episodes.length > 0)
              // Optional: Sort seasons by number (TMDB usually returns them sorted)
              .sort((a, b) => a.season_number - b.season_number)
              .map((season: Season) => (
                <div key={season.id || season.season_number} className="season-container">
                  <h3 className="season-title">
                    {/* Display season name or number. Handle Season 0 gracefully. */}
                    {season.season_number === 0 ? "Specials" : season.name || `Season ${season.season_number}`}
                    {season.episodes && ` (${season.episodes.length} Episodes)`}
                  </h3>
                  {season.overview && <p className="season-overview">{season.overview}</p>}
                  
                  {/* Only render episodes list if episodes exist */}
                  {season.episodes && season.episodes.length > 0 && (
                      <div className="episodes-list">
                        {season.episodes
                          // Optional: Sort episodes within a season
                          .sort((a, b) => a.episode_number - b.episode_number)
                          .map((episode: Episode) => (
                            <div key={episode.id} className="episode-item">
                              <div className="episode-image-container">
                                {episode.still_path ? (
                                  <Image
                                    src={`${TMDB_IMAGE_BASE_URL}w300${episode.still_path}`}
                                    alt={`Still image for ${episode.name}`}
                                    width={200}
                                    height={113}
                                    className="episode-still-image"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="episode-still-placeholder">No Image</div>
                                )}
                              </div>
                              <div className="episode-info">
                                <h4 className="episode-title"> {/* Use h4 for episode title */} 
                                  E{String(episode.episode_number).padStart(2, '0')}: {episode.name}
                                </h4>
                                {episode.air_date && (
                                  <p className="episode-meta">Aired: {formatDate(episode.air_date)}</p>
                                )}
                                <p className="episode-overview">{episode.overview || "No overview available."}</p>
                                {episode.vote_average && episode.vote_average > 0 && (
                                  <span className="episode-rating">★ {episode.vote_average.toFixed(1)}</span>
                                )}
                              </div>
                            </div>
                        ))}
                      </div>
                  )}
                </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 