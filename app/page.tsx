'use client';

import { useEffect, useState } from 'react';
import { fetchTrendingMovies } from "./utils/api";
import MovieGallery from "@/components/MovieGallery";
import { Movie } from './types';

export default function Home() {
  const [initialMovies, setInitialMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInitialMovies = async () => {
      try {
        const movies = await fetchTrendingMovies();
        setInitialMovies(movies);
      } catch (error) {
        console.error("Error in Home page:", error);
        setError("Unable to load movies. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadInitialMovies();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return (
    <div className="error-container">
      <h1>Something went wrong</h1>
      <p>{error}</p>
    </div>
  );

  return <MovieGallery initialMovies={initialMovies} />;
}