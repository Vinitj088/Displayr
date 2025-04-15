'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { searchMulti } from '@/app/utils/api';
import { Movie, TVShow, isMovie, isTVShow } from '@/app/types';
import { TMDB_IMAGE_BASE_URL } from '@/app/config/constants';
import SideMenu from '@/components/SideMenu';

// Simple debounce function implementation
function debounce<F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => func(...args), waitFor);
  };

  // Add a cancel method like lodash debounce has
  debounced.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}

// Slugify function (needed for link generation)
const slugify = (text: string): string => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<(Movie | TVShow)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedSearchRef = useRef<ReturnType<typeof debounce> | null>(null); // Ref to hold the debounced function
  const [hoveredBackdropUrl, setHoveredBackdropUrl] = useState<string | null>(null);

  // Effect to create/update the debounced function when component mounts or search function changes
  useEffect(() => {
    const performSearch = async (searchTerm: string) => {
      if (!searchTerm) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const items = await searchMulti(searchTerm);
        setResults(items);
      } catch (err) {
        console.error("Search error:", err);
        setError("Failed to fetch search results.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    debouncedSearchRef.current = debounce(performSearch, 500);

    // Cleanup function to cancel any pending debounced calls when component unmounts
    return () => {
      debouncedSearchRef.current?.cancel();
    };
  }, []); // Empty dependency array: create debounce function once on mount

  // Effect to call the debounced function when query changes
  useEffect(() => {
    if (debouncedSearchRef.current) {
      debouncedSearchRef.current(query);
    }
  }, [query]);

  const handleHoverStart = (backdropPath: string | null) => {
    if (backdropPath) {
       // Use a larger size for background
      setHoveredBackdropUrl(`${TMDB_IMAGE_BASE_URL}w1280${backdropPath}`); 
    } else {
      setHoveredBackdropUrl(null);
    }
  };

  const handleHoverEnd = () => {
    setHoveredBackdropUrl(null);
  };

  // Define the style for the background pseudo-element
  const dynamicBgStyle = hoveredBackdropUrl 
    ? { '--dynamic-bg-image': `url(${hoveredBackdropUrl})` } 
    : { '--dynamic-bg-image': 'none' };

  return (
    <div className="search-layout-container">
      <div 
        className={`side-menu-column ${hoveredBackdropUrl ? 'bg-active' : ''}`}
        style={dynamicBgStyle as React.CSSProperties}
      >
        <SideMenu />
      </div>

      <div 
        className={`search-content-area ${hoveredBackdropUrl ? 'bg-active' : ''}`}
        style={dynamicBgStyle as React.CSSProperties}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for movies or TV shows..."
          className="search-input"
        />

        {loading && <div className="loading">Searching...</div>}
        {error && <div className="error">{error}</div>}

        <div className="search-results-grid">
          {!loading && query && results.length === 0 && (
            <p className="no-results-message">No results found for "{query}".</p>
          )}
          {results.map((item) => {
            const title = isMovie(item) ? item.title : item.name;
            const slug = slugify(title);
            const linkHref = isMovie(item) 
              ? `/movie/${item.id}-${slug}` 
              : `/tv/${item.id}-${slug}`;
            const posterPath = item.poster_path ? `${TMDB_IMAGE_BASE_URL}w342${item.poster_path}` : '/placeholder-poster.png';

            return (
              <Link 
                href={linkHref} 
                key={`${item.media_type}-${item.id}`}
                className="search-result-item"
                onMouseEnter={() => handleHoverStart(item.backdrop_path)}
                onMouseLeave={handleHoverEnd}
              >
                <img
                  src={posterPath}
                  alt={title}
                  className="search-result-image"
                  loading="lazy"
                />
                <div className="search-result-title">{title}</div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
} 