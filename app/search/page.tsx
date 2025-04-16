"use client"

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { searchMulti } from '@/app/utils/api';
import { Movie, TVShow } from '@/app/types';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

// Increased backdrop size for potentially better quality
const BASE_IMAGE_URL = 'https://image.tmdb.org/t/p/';
const POSTER_SIZE = 'w500';
const BACKDROP_SIZE = 'w1280';

// Generic content type that could be a Movie or TVShow
type ContentItem = (Movie | TVShow) & {
  media_type: 'movie' | 'tv';
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
};

// Search content component that uses useSearchParams
function SearchContent() {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<ContentItem[]>([]);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentBackdropUrl, setCurrentBackdropUrl] = useState<string>('');
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Effect to detect mobile screens
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

  // Check for query parameters on load
  useEffect(() => {
    const initialQuery = searchParams?.get('q');
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [searchParams]);

  // Helper to get title from either movie or TV show
  const getTitle = (item: ContentItem) => {
    return item.media_type === 'movie' ? item.title : item.name;
  };

  // Handle search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        setError(null);
        try {
          const searchResults = await searchMulti(query);
          // Filter out results with undefined media_type and cast to ContentItem
          const filteredResults = searchResults
            .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
            .map(item => item as ContentItem);
          setResults(filteredResults);
          
          // Reset selection when search changes
          setSelectedContent(null);
          setIsDetailOpen(false);
        } catch (err) {
          console.error('Search error:', err);
          setError('Failed to search content. Please try again.');
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setSelectedContent(null);
        setIsDetailOpen(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Update backdrop when selected content changes
  useEffect(() => {
    if (!selectedContent || !selectedContent.backdrop_path) {
      setCurrentBackdropUrl('');
      return;
    }
    
    const newBackdropUrl = `${BASE_IMAGE_URL}${BACKDROP_SIZE}${selectedContent.backdrop_path}`;
    setCurrentBackdropUrl(newBackdropUrl);
  }, [selectedContent]);

  // Focus input on mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Handle content selection
  const handleContentSelect = (content: ContentItem) => {
    setSelectedContent(content);
    setIsDetailOpen(true);
    
    // On mobile, scroll to top when selecting content
    if (isMobile) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle view details click
  const handleViewDetails = () => {
    if (selectedContent) {
      const path = selectedContent.media_type === 'movie' 
        ? `/movies/${selectedContent.id}`
        : `/tv/${selectedContent.id}`;
      router.push(path);
    }
  };
  
  // Handle back from details on mobile
  const handleBackToResults = () => {
    setIsDetailOpen(false);
  };

  // Format year from date string
  const formatYear = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.getFullYear();
  };

  return (
    <div className="min-h-screen text-white relative bg-black overflow-hidden">
      {/* Background with blur effect */}
      <div 
        className="absolute inset-0 z-[-10] transition-opacity duration-700"
        style={{
          backgroundImage: currentBackdropUrl ? `url(${currentBackdropUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(80px)',
          opacity: 0.5,
        }}
      />
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 z-[-5]" />

      {/* Main content area */}
      <main className="px-4 pt-20 pb-10 min-h-screen">
        {/* Title and search input */}
        <div className={`transition-all duration-500 ${isMobile && isDetailOpen ? 'hidden' : 'block'}`}>
          <h1 className="text-4xl font-bold text-center mb-6 mt-4">
            Discover Movies & TV Shows
          </h1>
          
          <div className="max-w-xl mx-auto mb-8">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for titles, actors or genres..."
                className="w-full px-5 py-4 pl-12 rounded-xl bg-black/30 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 shadow-lg"
              />
              <svg 
                className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-white/50"
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Mobile Content Detail View */}
        {isMobile && isDetailOpen && selectedContent && (
          <div className="p-2 animate-fadeIn mb-6">
            <div className="relative aspect-[2/3] w-full max-w-xs mx-auto mb-6 rounded-xl overflow-hidden shadow-2xl">
              {selectedContent.poster_path ? (
                <Image
                  src={`${BASE_IMAGE_URL}${POSTER_SIZE}${selectedContent.poster_path}`}
                  alt={getTitle(selectedContent) || ''}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-xl"
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
              <div className="absolute top-3 right-3">
                <span className="px-2 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs capitalize">
                  {selectedContent.media_type}
                </span>
              </div>
            </div>
            
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">{getTitle(selectedContent)}</h2>
              {(selectedContent.release_date || selectedContent.first_air_date) && (
                <p className="text-gray-300 text-lg mb-4">
                  {selectedContent.media_type === 'movie' 
                    ? formatYear(selectedContent.release_date)
                    : formatYear(selectedContent.first_air_date)
                  }
                </p>
              )}
              
              <p className="text-gray-300 mb-8 text-left">
                {selectedContent.overview || 'No overview available.'}
              </p>
              
              <div className="flex flex-col items-center justify-center">
                <button
                  onClick={handleViewDetails}
                  className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all duration-300 font-semibold text-lg"
                >
                  View Details
                </button>
                
                <button 
                  onClick={handleBackToResults}
                  className="w-full block text-center py-3 mt-4 bg-transparent border border-white/20 rounded-lg transition-all duration-300 hover:bg-white/10"
                >
                  Return to Search
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Layout (Side by Side) / Mobile Results */}
        <div className={`${isMobile && isDetailOpen ? 'hidden' : 'grid'} grid-cols-1 md:grid-cols-3 gap-6 max-w-screen-xl mx-auto`}>
          {/* Results Column/Area */}
          <div className={`md:col-span-2 ${results.length > 0 ? '' : 'md:col-span-3'}`}>
            {/* Loading state */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                <p className="text-gray-300">Searching...</p>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="bg-red-500/20 backdrop-blur-md rounded-xl p-6 text-white text-center max-w-lg mx-auto">
                <svg 
                  className="w-8 h-8 mx-auto mb-2 text-red-400"
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                <p className="text-lg">{error}</p>
              </div>
            )}

            {/* No results state */}
            {query.length >= 2 && !isLoading && results.length === 0 && !error && (
              <div className="flex flex-col items-center justify-center py-16">
                <svg 
                  className="w-16 h-16 text-gray-500 mb-4"
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                <p className="text-lg text-gray-300 mb-2">No results found for "{query}"</p>
                <p className="text-gray-400">Try different keywords or check spelling</p>
              </div>
            )}

            {/* Empty state */}
            {query.length < 2 && !isLoading && (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <svg 
                  className="w-20 h-20 text-gray-600 mb-6"
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                  />
                </svg>
                <h2 className="text-2xl text-white mb-4 text-center">What are you looking for?</h2>
                <p className="text-gray-400 text-center max-w-md">
                  Start typing to search for movies, TV shows, actors, or genres. 
                  Type at least 2 characters to begin your search.
                </p>
              </div>
            )}

            {/* Results grid */}
            {results.length > 0 && !isLoading && !error && (
              <div className="animate-fadeIn">
                <h2 className="text-xl font-semibold mb-4 text-gray-200">
                  {results.length} results for "{query}"
                </h2>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {results.map((item) => (
                    <div 
                      key={`${item.media_type}-${item.id}`}
                      className={`
                        relative rounded-xl overflow-hidden bg-black/20 backdrop-blur-sm 
                        cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg
                        border ${selectedContent?.id === item.id ? 'border-white' : 'border-white/10'}
                      `}
                      onClick={() => handleContentSelect(item)}
                    >
                      <div className="aspect-[2/3] relative">
                        {item.poster_path ? (
                          <Image
                            src={`${BASE_IMAGE_URL}${POSTER_SIZE}${item.poster_path}`}
                            alt={getTitle(item) || ''}
                            layout="fill"
                            objectFit="cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                            <span className="text-gray-400 text-sm">No image</span>
                          </div>
                        )}
                        <div className="absolute top-2 right-2 z-10">
                          <span className="px-1.5 py-0.5 bg-black/50 backdrop-blur-sm rounded text-xs capitalize">
                            {item.media_type}
                          </span>
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium line-clamp-1 text-sm">{getTitle(item)}</h3>
                        <p className="text-gray-400 text-xs mt-1">
                          {item.media_type === 'movie' 
                            ? formatYear(item.release_date)
                            : formatYear(item.first_air_date)
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Detail Column */}
          {!isMobile && selectedContent && results.length > 0 && (
            <div className="hidden md:block">
              <div className="sticky top-24 backdrop-blur-md bg-black/30 rounded-xl p-6 border border-white/10 shadow-xl">
                <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden mb-4">
                  {selectedContent.poster_path ? (
                    <Image
                      src={`${BASE_IMAGE_URL}${POSTER_SIZE}${selectedContent.poster_path}`}
                      alt={getTitle(selectedContent) || ''}
                      layout="fill"
                      objectFit="cover"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>
                
                <h2 className="text-2xl font-bold mb-2">{getTitle(selectedContent)}</h2>
                
                {(selectedContent.release_date || selectedContent.first_air_date) && (
                  <p className="text-gray-300 text-sm mb-4">
                    {selectedContent.media_type === 'movie' 
                      ? formatYear(selectedContent.release_date)
                      : formatYear(selectedContent.first_air_date)
                    }
                  </p>
                )}
                
                <div className="mb-2 inline-block px-2 py-1 rounded-lg bg-white/10 text-xs capitalize">
                  {selectedContent.media_type}
                </div>
                
                <p className="text-gray-300 text-sm mb-6 mt-4 line-clamp-6">
                  {selectedContent.overview || 'No overview available.'}
                </p>
                
                <div className="flex flex-col items-center justify-center">
                  <button
                    onClick={handleViewDetails}
                    className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all duration-300"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Scrollbar styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        body {
          background-color: black;
        }
      `}</style>
    </div>
  );
}

// Dynamically import SearchContent with SSR disabled
const DynamicSearchContent = dynamic(() => Promise.resolve(SearchContent), {
  ssr: false,
  loading: () => <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading...</div>,
});

// Main page component now renders the dynamic component
export default function SearchPage() {
  // No Suspense needed here as dynamic handles loading state
  return <DynamicSearchContent />;
}
