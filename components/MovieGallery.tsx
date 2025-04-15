// components/MovieGallery.tsx
"use client";

import { useEffect, useState } from "react";
import { gsap } from "gsap";
import { Movie, MovieCredits } from "@/app/types";
import { TMDB_IMAGE_BASE_URL, MOVIE_GENRES } from "@/app/config/constants";
import {
  fetchMovieCredits,
  fetchMovieTrailer,
  fetchTrendingMovies,
  fetchMoviesByGenre,
} from "@/app/utils/api";
import Link from 'next/link';
import SideMenu from './SideMenu';

interface MovieGalleryProps {
  initialMovies: Movie[];
}

export default function MovieGallery({ initialMovies }: MovieGalleryProps) {
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [credits, setCredits] = useState<MovieCredits | null>(null);
  const [, setTrailerUrl] = useState<string | null>(null);
  const [, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  let isUpdating = false;
  async function updateContent(movie: Movie, index: number, isInitial = false) {
    if (isUpdating) return;
    isUpdating = true;


    const tl = gsap.timeline();

    // Get all elements
    const titleElement = document.querySelector(".title h1");
    const infoElement = document.querySelector(".info p");
    const directorElement = document.querySelector(".director p");
    const cinematographerElement = document.querySelector(".cinematographer p");
    const projectImg = document.querySelector(".project-img img");
    const blurryImg = document.querySelector(".blurry-prev img");
    const infoDiv = document.querySelector(".info");
    const CreditsP = document.querySelector(".credits p");

    // Remove all existing trailer buttons within the info div
    if (infoDiv) {
      infoDiv.querySelectorAll(".trailer-button").forEach(button => button.remove());
    }

    // Fetch movie details
    const [newCredits, newTrailerUrl] = await Promise.all([
      fetchMovieCredits(movie.id),
      fetchMovieTrailer(movie.id),
    ]);

    // If not initial load, animate out old content
    if (!isInitial) {
      tl.to(
        [
          titleElement,
          infoElement,
          directorElement,
          cinematographerElement,
          CreditsP,
        ],
        {
          y: -20,
          opacity: 0,
          duration: 0.3,
          stagger: 0.1,
          ease: "power2.inOut",
        }
      ).to(
        projectImg,
        {
          scale: 0.8,
          opacity: 0,
          duration: 0.3,
          ease: "power2.inOut",
        },
        "-=0.2"
      );
    }

    // Update states
    setCredits(newCredits);
    setTrailerUrl(newTrailerUrl);
    setCurrentIndex(index);

    // Set up new content animation
    tl.set(
      [
        titleElement,
        infoElement,
        directorElement,
        cinematographerElement,
        CreditsP,
      ],
      {
        y: 20,
        opacity: 0,
      }
    )
      .set(projectImg, {
        scale: 0.8,
        opacity: 0,
      })
      .add(() => {
        // Update text content
        if (titleElement) titleElement.textContent = movie.title;
        if (infoElement) infoElement.textContent = movie.overview;
        if (directorElement)
          directorElement.textContent = `Director: ${newCredits.director}`;
        if (cinematographerElement)
          cinematographerElement.textContent = `Cinematographer: ${newCredits.cinematographer}`;

        // Update images
        if (movie.backdrop_path) {
          const imgUrlW780 = `${TMDB_IMAGE_BASE_URL}w780${movie.backdrop_path}`;
          const imgUrlW500 = `${TMDB_IMAGE_BASE_URL}w500${movie.backdrop_path}`;
          if (projectImg instanceof HTMLImageElement) projectImg.src = imgUrlW780;
          if (blurryImg instanceof HTMLImageElement) blurryImg.src = imgUrlW500;
        }

        // Add trailer button if available
        if (newTrailerUrl) {
          const trailerButton = document.createElement("a");
          trailerButton.href = newTrailerUrl;
          trailerButton.target = "_blank";
          trailerButton.rel = "noopener noreferrer";
          trailerButton.className = "trailer-button";
          trailerButton.textContent = "Watch Trailer";
          if (infoDiv && trailerButton) {
            infoDiv.appendChild(trailerButton);
          }
        }

        // Update active state in gallery
        document.querySelectorAll(".item").forEach((item, i) => {
          item.classList.toggle("active", i === index);
        });
      })
      // Animate in new content
      .to(
        [
          titleElement,
          infoElement,
          directorElement,
          cinematographerElement,
          CreditsP,
        ],
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
        }
      )
      .to(
        projectImg,
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
        },
        "-=0.3"
      );
  }

  async function handleFilterChange(
    category: string | number,
    timeWindow: string
  ) {
    setLoading(true);
    setError(null);

    try {
      const newMovies =
        category === "trending"
          ? await fetchTrendingMovies(timeWindow)
          : await fetchMoviesByGenre(Number(category));

      setMovies(newMovies);
      if (newMovies.length > 0) {
        await updateContent(newMovies[0], 0, true);
      }
    } catch (err) {
      setError("Error loading movies. Please try again.");
      console.error("Error loading movies:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
  // Function to refresh data
  const refreshData = async () => {
    const timeWindow = (document.getElementById("timeFilter") as HTMLSelectElement)?.value || "day";
    const category = (document.getElementById("categoryFilter") as HTMLSelectElement)?.value || "trending";
    await handleFilterChange(category, timeWindow);
  };

  // Initial fetch (this ensures fresh data on page load)
  refreshData();

  // Set up auto-refresh every 2 hours
  const refreshInterval = setInterval(refreshData, 2 * 60 * 60 * 1000);

  // Cleanup
  return () => clearInterval(refreshInterval);
}, []); // Empty dependency array means this runs once on mount

  if (error) return <div className="error">{error}</div>;
  if (!movies.length) return <div className="loading">Loading movies...</div>;

  const currentMovie = movies[currentIndex];

  return (
    <div className="container">
      <div className="blurry-prev">
        {currentMovie.backdrop_path && (
          <img
            src={`${TMDB_IMAGE_BASE_URL}w500${currentMovie.backdrop_path}`}
            alt="Background"
          />
        )}
        <div className="overlay" />
      </div>

      <div className="col site-info">
        <nav>
          <select
            id="categoryFilter"
            className="filter-select"
            onChange={(e) => {
              const timeWindow = (
                document.getElementById("timeFilter") as HTMLSelectElement
              ).value;
              handleFilterChange(e.target.value, timeWindow);
            }}
          >
            <option value="trending">Trending</option>
            {MOVIE_GENRES.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>

          <select
            id="timeFilter"
            className="filter-select"
            onChange={(e) => {
              const category = (
                document.getElementById("categoryFilter") as HTMLSelectElement
              ).value;
              handleFilterChange(category, e.target.value);
            }}
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
          </select>
        </nav>

        <div className="header">
           <SideMenu />
        </div>

        <div className="copy">
          <p>Trending Movies Finder</p>
        </div>
      </div>

      <div className="col project-preview">
        <div className="project-details">
          <div className="title">
            <h1>{currentMovie.title}</h1>
          </div>

          <div className="info">
            <p>{currentMovie.overview}</p>
            <Link href={`/movie/${currentMovie.id}`} className="project-details-button">
                More Details
            </Link>
          </div>

          <div className="credits">
            <p>Credits</p>
          </div>
          <div className="director">
            <p>Director: {credits?.director || "Loading..."}</p>
          </div>
          <div className="cinematographer">
            <p>Cinematographer: {credits?.cinematographer || "Loading..."}</p>
          </div>
        </div>

        <div className="project-img">
          {currentMovie.backdrop_path && (
            <img
              src={`${TMDB_IMAGE_BASE_URL}w780${currentMovie.backdrop_path}`}
              alt={currentMovie.title}
            />
          )}
        </div>
      </div>

      <div className="gallery-wrapper">
        <div className="gallery">
          {movies.map((movie, index) => (
            <div
              key={movie.id}
              className={`item ${index === currentIndex ? "active" : ""}`}
              onClick={() => updateContent(movie, index)}
            >
              {movie.backdrop_path && (
                <img
                  src={`${TMDB_IMAGE_BASE_URL}w300${movie.backdrop_path}`}
                  alt={movie.title}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
