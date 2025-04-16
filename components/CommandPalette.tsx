"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchMulti } from '@/app/utils/api';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// TMDB constants
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w92';

type SearchResult = {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  media_type: 'movie' | 'tv';
  release_date?: string;
  first_air_date?: string;
};

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Listen for CMD+K or Ctrl+K to open the command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }

      if (isOpen && e.key === 'Escape') {
        setIsOpen(false);
      }

      // Navigation with arrow keys when open
      if (isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < results.length - 1 ? prev + 1 : prev
          );
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : 0
          );
        } else if (e.key === 'Enter' && results.length > 0) {
          e.preventDefault();
          handleResultClick(results[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  // Focus the input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Search as user types
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setLoading(true);
        try {
          const searchResults = await searchMulti(searchQuery);
          // Filter out results with undefined media_type and cast the rest to SearchResult
          const filteredResults = searchResults
            .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
            .map(item => item as SearchResult)
            .slice(0, 8); // Limit to 8 results
          setResults(filteredResults);
          setSelectedIndex(0); // Reset selected index
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Handle clicking on a result
  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setSearchQuery('');
    
    if (result.media_type === 'movie') {
      router.push(`/movies/${result.id}`);
    } else if (result.media_type === 'tv') {
      router.push(`/tv/${result.id}`);
    }
  };

  // Get title based on media type
  const getTitle = (result: SearchResult) => {
    return result.media_type === 'movie' ? result.title : result.name;
  };

  // Get year based on media type
  const getYear = (result: SearchResult) => {
    const dateString = result.media_type === 'movie' 
      ? result.release_date 
      : result.first_air_date;
    
    if (!dateString) return '';
    
    return new Date(dateString).getFullYear();
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Command palette */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -20 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300 
            }}
            className="fixed top-24 inset-x-0 mx-auto w-full max-w-2xl bg-zinc-900 rounded-xl shadow-2xl overflow-hidden z-50"
          >
            <div className="p-4">
              <div className="flex items-center border-b border-zinc-700 pb-3">
                <svg 
                  className="w-5 h-5 text-zinc-500 mr-3"
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
                <input
                  ref={inputRef}
                  className="w-full bg-transparent border-none focus:outline-none text-white text-lg placeholder-zinc-500"
                  placeholder="Search for movies & TV shows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="bg-zinc-800 px-2 py-1 rounded text-xs text-zinc-400">
                  ESC
                </div>
              </div>

              {/* Search results */}
              <div className="mt-4 max-h-[60vh] overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                ) : (
                  <ul>
                    {results.length > 0 ? (
                      results.map((result, index) => (
                        <motion.li
                          key={`${result.media_type}-${result.id}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`flex items-center p-3 rounded-lg cursor-pointer ${
                            selectedIndex === index ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'
                          }`}
                          onClick={() => handleResultClick(result)}
                        >
                          <div className="w-12 h-16 relative flex-shrink-0 bg-zinc-800 rounded overflow-hidden">
                            {result.poster_path ? (
                              <Image
                                src={`${IMAGE_BASE_URL}${result.poster_path}`}
                                alt={getTitle(result) || ''}
                                layout="fill"
                                objectFit="cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                No image
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-white font-medium">{getTitle(result)}</div>
                            <div className="flex items-center text-sm text-zinc-400 mt-1">
                              <span className="capitalize">{result.media_type}</span>
                              {getYear(result) && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>{getYear(result)}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </motion.li>
                      ))
                    ) : searchQuery.length > 0 && !loading ? (
                      <div className="text-center py-8 text-zinc-500">
                        No results found
                      </div>
                    ) : searchQuery.length > 0 ? (
                      <div className="text-center py-8 text-zinc-500">
                        Type to search...
                      </div>
                    ) : (
                      <div className="text-center py-8 text-zinc-500">
                        <p>Press <kbd className="bg-zinc-800 px-2 py-1 rounded">⌘K</kbd> to search</p>
                        <p className="mt-2 text-sm">Search for movies and TV shows</p>
                      </div>
                    )}
                  </ul>
                )}
              </div>
            </div>

            <div className="bg-zinc-950 py-3 px-4 text-xs text-zinc-500 flex justify-between">
              <div>
                <span className="mr-3">
                  <kbd className="bg-zinc-800 px-2 py-1 rounded">↑</kbd>
                  <kbd className="bg-zinc-800 px-2 py-1 rounded ml-1">↓</kbd> 
                  to navigate
                </span>
                <span>
                  <kbd className="bg-zinc-800 px-2 py-1 rounded">Enter</kbd> 
                  to select
                </span>
              </div>
              <div>
                Press <kbd className="bg-zinc-800 px-2 py-1 rounded">Esc</kbd> to close
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 