import { fetchMovieDetails } from '@/app/utils/api';
import { Movie } from '@/app/types';
import { TMDB_IMAGE_BASE_URL } from '@/app/config/constants';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

interface MovieDetailsPageProps {
  // Now expects slug instead of id
  params: { slug: string }; 
}

// Helper to extract ID from slug (e.g., "12345-the-movie")
function getMovieIdFromSlug(slug: string): number | null {
  const match = slug.match(/^(\d+)/); // Match digits at the beginning
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return null;
}

// Access params via props object, use slug
export async function generateMetadata(props: MovieDetailsPageProps) {
  const slug = props.params.slug;
  const movieId = getMovieIdFromSlug(slug);

  // Handle invalid slug format or missing ID
  if (movieId === null) return { title: 'Invalid Movie Link' };

  const movie = await fetchMovieDetails(movieId);
  if (!movie) return { title: 'Movie Not Found' };

  return {
    title: `${movie.title} - Displayr`,
    description: movie.overview,
  };
}

// Helper function to format runtime (e.g., 121 -> 2h 1m)
function formatRuntime(minutes?: number): string | null {
  if (!minutes) return null;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  let formatted = '';
  if (hours > 0) formatted += `${hours}h`;
  if (remainingMinutes > 0) formatted += ` ${remainingMinutes}m`;
  return formatted.trim() || null; // Return null if result is empty string
}

// Access params via props object, use slug
export default async function MovieDetailsPage(props: MovieDetailsPageProps) {
  const slug = props.params.slug;
  const movieId = getMovieIdFromSlug(slug);

  // Handle invalid slug format or missing ID
  if (movieId === null) {
    console.error("Invalid movie slug format:", slug);
    notFound();
  }

  const movie = await fetchMovieDetails(movieId);

  if (!movie) {
    notFound();
  }

  // Rest of the component logic remains the same, using the fetched 'movie' object
  const posterPath = movie.poster_path ? `${TMDB_IMAGE_BASE_URL}w500${movie.poster_path}` : '/placeholder-poster.png';
  const backdropPath = movie.backdrop_path ? `${TMDB_IMAGE_BASE_URL}original${movie.backdrop_path}` : null;
  const formattedRuntime = formatRuntime(movie.runtime);

  return (
    // ... existing JSX structure ...
    <div className="movie-detail-layout">
        {/* --- Backdrop Section --- */}
      <div className="backdrop-section">
        {backdropPath && (
          <Image
            src={backdropPath}
            alt={`${movie.title} backdrop`}
            fill
            style={{ objectFit: 'cover' }}
            priority
            quality={75}
          />
        )}
        <div className="backdrop-gradient-overlay"></div>
        <Link href="/" className="back-home-link">← Home</Link>
      </div>

      {/* --- Content Section (Below Backdrop/Overlapping Gradient) --- */}
      <div className="content-section">
        <div className="main-details-grid">
          {/* Poster Column */}
          <div className="poster-column">
            <Image
              src={posterPath}
              alt={movie.title}
              width={300} // Adjust size as needed
              height={450}
              className="detail-poster-image"
              priority
            />
          </div>

          {/* Info Column */}
          <div className="info-column">
            <h1 className="detail-title">{movie.title}</h1>
            <div className="meta-tags">
              {movie.release_date && <span>{movie.release_date.substring(0, 4)}</span>}
              {formattedRuntime && <span>{formattedRuntime}</span>}
              {movie.vote_average && (
                <span className="rating-tag">★ {movie.vote_average.toFixed(1)}</span>
              )}
            </div>
            <p className="detail-overview">{movie.overview}</p>
            <div className="detail-actions">
              {movie.trailerUrl && (
                <a href={movie.trailerUrl} target="_blank" rel="noopener noreferrer" className="detail-action-button secondary">
                  ▷ Watch Trailer
                </a>
              )}
              <button className="detail-action-button secondary" disabled>More</button>
            </div>
            <div className="detail-meta-info">
                {movie.genres && movie.genres.length > 0 && (
                   <p><strong>Genre:</strong> {movie.genres.map(g => g.name).join(', ')}</p>
                 )}
                 {movie.director && <p><strong>Director:</strong> {movie.director}</p>}
                 {movie.cinematographer && <p><strong>Cinematographer:</strong> {movie.cinematographer}</p>}
                 {/* Add more here */} 
            </div>
          </div>
        </div>

        {/* --- Cast Section --- */}
        {movie.cast && movie.cast.length > 0 && (
          <div className="cast-section">
            <h2 className="section-title">Cast</h2>
            <div className="cast-list">
              {movie.cast.map((member) => (
                <div key={member.id} className="cast-member">
                  <Image
                    src={member.profile_path ? `${TMDB_IMAGE_BASE_URL}w185${member.profile_path}` : '/placeholder-person.png'} // Placeholder for actor
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
        {/* Add Related/Recommended Section potentially here */}
      </div>
    </div>
  );
} 