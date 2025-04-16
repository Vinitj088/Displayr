'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { fetchTrendingMovies, fetchTrendingTVShows, fetchTrendingAll } from '@/app/utils/api';
import { Movie, TVShow } from '@/app/types';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Increased backdrop size for potentially better quality
const BASE_IMAGE_URL = 'https://image.tmdb.org/t/p/';
const POSTER_SIZE = 'w500';
const BACKDROP_SIZE = 'w1280'; // Or 'original' for highest quality

// Generic content type that could be a Movie or TVShow
type ContentItem = (Movie | TVShow) & {
  media_type: 'movie' | 'tv';
  title?: string;
  name?: string;
};

export default function Home() {
  const searchParams = useSearchParams();
  const filterType = searchParams.get('filter') || 'all';

  const [content, setContent] = useState<ContentItem[]>([]);
  const [loopedContent, setLoopedContent] = useState<ContentItem[]>([]); // For infinite scrolling
  const [centeredContentIndex, setCenteredContentIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isScrolling, setIsScrolling] = useState<boolean>(false); // State to track scroll activity
  const [currentBackdropUrl, setCurrentBackdropUrl] = useState<string>(''); // State for backdrop URL
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]); // Refs for each content item
  const pageContainerRef = useRef<HTMLDivElement>(null); // Ref for the main page container
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref for scroll end timeout

  // Helper function to create a looped array of content
  const getLoopedContent = useCallback((originalContent: ContentItem[], repetitions: number = 3) => {
    if (originalContent.length === 0) return [];
    
    let result: ContentItem[] = [];
    for (let i = 0; i < repetitions; i++) {
      result = [...result, ...originalContent];
    }
    return result;
  }, []);

  // Helper function to get the original content index from the looped index
  const getOriginalIndex = useCallback((loopedIndex: number) => {
    if (content.length === 0) return 0;
    return loopedIndex % content.length;
  }, [content.length]);

  // Get the centered content using the original index
  const centeredContent = useMemo(() => {
    if (content.length === 0) return null;
    const originalIndex = getOriginalIndex(centeredContentIndex);
    return content[originalIndex];
  }, [content, centeredContentIndex, getOriginalIndex]);

  // Helper to get title from either movie or TV show
  const getTitle = useCallback((item: ContentItem) => {
    return item.media_type === 'movie' ? item.title : item.name;
  }, []);

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

  // Calculate centered item (no debounce)
  const updateCenteredIndexAndScrollState = useCallback(() => {
    const scrollElement = scrollContainerRef.current;
    if (!scrollElement || itemRefs.current.length === 0) return;

    const containerRect = scrollElement.getBoundingClientRect();
    
    // Use different centering logic based on mobile/desktop
    const containerCenter = isMobile 
      ? containerRect.left + containerRect.width / 2 // Horizontal center for mobile
      : containerRect.top + containerRect.height / 2; // Vertical center for desktop

    let closestIndex = 0;
    let minDistance = Infinity;

    itemRefs.current.forEach((item, index) => {
      if (!item) return;
      const itemRect = item.getBoundingClientRect();
      
      // Calculate distance to center differently for mobile/desktop
      const itemCenter = isMobile
        ? itemRect.left + itemRect.width / 2 // Horizontal center for mobile
        : itemRect.top + itemRect.height / 2; // Vertical center for desktop
      
      const distance = Math.abs(containerCenter - itemCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    const indexChanged = centeredContentIndex !== closestIndex;
    if (indexChanged) {
      setCenteredContentIndex(closestIndex);
    }

    // Set scrolling state and timeout to reset it
    setIsScrolling(true);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
      
      // Implement smooth snapping to the centered item
      const targetItem = itemRefs.current[closestIndex];
      if (targetItem && scrollElement) {
        if (isMobile) {
          // Horizontal snapping for mobile
          const containerLeft = scrollElement.getBoundingClientRect().left;
          const itemLeftRelativeToContainer = targetItem.getBoundingClientRect().left - containerLeft;
          const desiredItemLeft = (scrollElement.clientWidth - targetItem.clientWidth) / 2;
          const scrollToX = scrollElement.scrollLeft + itemLeftRelativeToContainer - desiredItemLeft;

          scrollElement.scrollTo({
            left: scrollToX,
            behavior: 'smooth'
          });
        } else {
          // Vertical snapping for desktop
          const containerTop = scrollElement.getBoundingClientRect().top;
          const itemTopRelativeToContainer = targetItem.getBoundingClientRect().top - containerTop;
          const desiredItemTop = (scrollElement.clientHeight - targetItem.clientHeight) / 2;
          const scrollToY = scrollElement.scrollTop + itemTopRelativeToContainer - desiredItemTop;

          scrollElement.scrollTo({
            top: scrollToY,
            behavior: 'smooth'
          });
        }
      }
    }, 350);

  }, [content.length, centeredContentIndex, isMobile]);

  // Effect to attach scroll listener to the middle column
  useEffect(() => {
    const scrollElement = scrollContainerRef.current;
    if (!scrollElement) return;

    // Use a flag to prevent immediate snapping during native scroll
    const handleNativeScroll = () => {
      updateCenteredIndexAndScrollState();
    }

    scrollElement.addEventListener('scroll', handleNativeScroll, { passive: true });
    // Initial check without snap
    updateCenteredIndexAndScrollState();

    return () => {
      scrollElement.removeEventListener('scroll', handleNativeScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [updateCenteredIndexAndScrollState]);

  // Effect to attach wheel listener to the main page container
  useEffect(() => {
    const pageElement = pageContainerRef.current;
    const scrollElement = scrollContainerRef.current;
    if (!pageElement || !scrollElement) return;

    // Only enable whole-page scrolling on non-mobile devices
    const handleWheel = (event: WheelEvent) => {
      if (isMobile) return; // Let native scrolling work on mobile
      
      let targetElement = event.target as Node;
      let isInScrollContainer = false;
      while(targetElement && targetElement !== document.body) {
        if (targetElement === scrollElement) { isInScrollContainer = true; break; }
        targetElement = targetElement.parentNode as Node;
      }

      if (!isInScrollContainer) {
        event.preventDefault();
        // Apply scroll immediately
        scrollElement.scrollTop += event.deltaY;
        // Update index/state and trigger snap logic after timeout
        updateCenteredIndexAndScrollState();
      } else {
        // If inside, update state but don't force snap immediately
        updateCenteredIndexAndScrollState();
      }
    };

    // Only add wheel handler for non-touch devices
    if (!('ontouchstart' in window)) {
      pageElement.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (!('ontouchstart' in window)) {
        pageElement.removeEventListener('wheel', handleWheel);
      }
    };
  }, [updateCenteredIndexAndScrollState, isMobile]);

  // Determine scale based on scrolling state and index
  const getScaleClass = (index: number) => {
    if (index === centeredContentIndex && !isScrolling) {
      return 'scale-110'; // Zoom in when centered and not scrolling
    } else {
      return 'scale-90'; // Zoom out during scroll or for non-centered items
    }
  };

  // Utility function to scroll to a specific content index
  const scrollToContentIndex = useCallback((index: number) => {
    if (index < 0 || index >= loopedContent.length || !scrollContainerRef.current) return;
    
    const targetItem = itemRefs.current[index];
    if (!targetItem) return;
    
    const scrollElement = scrollContainerRef.current;
    
    if (isMobile) {
      // Horizontal scrolling for mobile
      const containerLeft = scrollElement.getBoundingClientRect().left;
      const itemLeftRelativeToContainer = targetItem.getBoundingClientRect().left - containerLeft;
      const desiredItemLeft = (scrollElement.clientWidth - targetItem.clientWidth) / 2;
      const scrollToX = scrollElement.scrollLeft + itemLeftRelativeToContainer - desiredItemLeft;
      
      scrollElement.scrollTo({
        left: scrollToX,
        behavior: 'smooth'
      });
    } else {
      // Vertical scrolling for desktop
      const containerTop = scrollElement.getBoundingClientRect().top;
      const itemTopRelativeToContainer = targetItem.getBoundingClientRect().top - containerTop;
      const desiredItemTop = (scrollElement.clientHeight - targetItem.clientHeight) / 2;
      const scrollToY = scrollElement.scrollTop + itemTopRelativeToContainer - desiredItemTop;
      
      scrollElement.scrollTo({
        top: scrollToY,
        behavior: 'smooth'
      });
    }
    
    setCenteredContentIndex(index);
  }, [loopedContent.length, isMobile]);

  // Load content based on filter
  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let trendingContent: ContentItem[] = [];
        
        switch (filterType) {
          case 'movie':
            trendingContent = await fetchTrendingMovies() as ContentItem[];
            break;
          case 'tv':
            trendingContent = await fetchTrendingTVShows() as ContentItem[];
            break;
          case 'all':
          default:
            trendingContent = await fetchTrendingAll() as ContentItem[];
            break;
        }
        
        setContent(trendingContent);
        
        // Create looped array for infinite scrolling
        const repeated = getLoopedContent(trendingContent);
        setLoopedContent(repeated);
        
        // Initialize refs for all the repeated items
        itemRefs.current = Array(repeated.length).fill(null);
        
        // Set initial backdrop
        if (trendingContent.length > 0) {
          const firstItem = trendingContent[0];
          if (firstItem.backdrop_path) {
            const initialUrl = `${BASE_IMAGE_URL}${BACKDROP_SIZE}${firstItem.backdrop_path}`;
            setCurrentBackdropUrl(initialUrl);
          }
        }

        // Reset centered index when filter changes
        setCenteredContentIndex(0);
      } catch (err) {
        console.error('Error fetching trending content:', err);
        setError('Failed to load content. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadContent();
  }, [filterType, getLoopedContent]);

  // Update backdrop when centered content changes
  useEffect(() => {
    if (!centeredContent || !centeredContent.backdrop_path) {
      setCurrentBackdropUrl('');
      return;
    }
    
    const newBackdropUrl = `${BASE_IMAGE_URL}${BACKDROP_SIZE}${centeredContent.backdrop_path}`;
    setCurrentBackdropUrl(newBackdropUrl);
  }, [centeredContent]);

  return (
    <>
      <div
        ref={pageContainerRef}
        className={`flex flex-col md:flex-row h-screen text-white overflow-hidden relative`}
      >
        {/* Simple background with direct blur applied to the image */}
        <div 
          className="absolute inset-0 z-[-10]"
          style={{
            backgroundImage: currentBackdropUrl ? `url(${currentBackdropUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(80px)',
            opacity: 0.5,
          }}
        ></div>
        
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60 z-[-5]"></div>

        {/* Left Section - Stack on top for mobile, 1/3 width for desktop */}
        <div className="w-full md:w-1/3 flex flex-col justify-start md:justify-center items-center md:items-start p-4 md:p-8 lg:p-12 pointer-events-none order-1 mt-12 md:mt-0">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">Displayr</h1>
        </div>

        {/* Middle Section - Horizontal scroll on mobile, vertical on desktop */}
        <div
          ref={scrollContainerRef}
          className="w-full md:w-1/3 h-[50vh] md:h-full overflow-x-auto md:overflow-x-hidden overflow-y-hidden md:overflow-y-auto no-scrollbar flex flex-row md:flex-col items-center md:items-center py-0 px-4 md:py-16 md:px-0 order-3 md:order-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {isLoading && <div className="text-center p-10">Loading...</div>}
          {error && <div className="text-center p-10 text-red-500">{error}</div>}
          
          {/* Spacer for mobile (left) and desktop (top) */}
          <div className="w-[10vw] md:w-auto h-auto md:h-[calc(50vh-225px)] flex-shrink-0"></div>
          
          {!isLoading && !error && loopedContent.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              ref={(el: HTMLDivElement | null) => { itemRefs.current[index] = el; }}
              className={`flex-shrink-0 w-[180px] md:w-[300px] h-[270px] md:h-[450px] mx-2 my-0 md:mx-0 md:my-4 relative cursor-pointer transition-all duration-500 ease-out ${getScaleClass(index)}`}
              style={{ opacity: index === centeredContentIndex ? 1 : 0.5 }}
            >
              <Link 
                href={item.media_type === 'movie' ? `/movies/${item.id}` : `/tv/${item.id}`} 
                passHref
              >
                <Image
                  src={`${BASE_IMAGE_URL}${POSTER_SIZE}${item.poster_path}`}
                  alt={getTitle(item) || ''}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg shadow-lg"
                  priority={index < 5}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 rounded-b-lg">
                  <div className="text-sm capitalize bg-white/20 rounded px-2 py-0.5 w-fit mb-1">
                    {item.media_type}
                  </div>
                </div>
              </Link>
            </div>
          ))}
          
          {/* Spacer for mobile (right) and desktop (bottom) */}
          <div className="w-[10vw] md:w-auto h-auto md:h-[calc(50vh-225px)] flex-shrink-0"></div>
        </div>

        {/* Right Section - Below content for mobile, 1/3 width for desktop */}
        <div className="w-full md:w-1/3 flex flex-col justify-center items-center md:items-end p-4 md:p-8 lg:p-12 pointer-events-none order-2 md:order-3 relative">
          {centeredContent ? (
            <div className="text-center md:text-right max-w-md relative">
              {/* Hidden on mobile - Use getOriginalIndex to loop titles */}
              <h2 className="hidden md:block text-xl font-semibold text-gray-500 mb-1 opacity-50 transition-all duration-300 ease-in-out">
                {content[(getOriginalIndex(centeredContentIndex) - 2 + content.length) % content.length] 
                  ? getTitle(content[(getOriginalIndex(centeredContentIndex) - 2 + content.length) % content.length]) 
                  : ''}
              </h2>
              <h2 className="hidden md:block text-2xl font-semibold text-gray-400 mb-2 opacity-75 transition-all duration-300 ease-in-out">
                {content[(getOriginalIndex(centeredContentIndex) - 1 + content.length) % content.length]
                  ? getTitle(content[(getOriginalIndex(centeredContentIndex) - 1 + content.length) % content.length])
                  : ''}
              </h2>
              
              {/* Main title */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 transition-all duration-300 ease-in-out relative z-10">
                {getTitle(centeredContent)}
              </h1>
              
              {/* Hidden on mobile */}
              <h2 className="hidden md:block text-2xl font-semibold text-gray-400 mt-2 opacity-75 transition-all duration-300 ease-in-out">
                {content[(getOriginalIndex(centeredContentIndex) + 1) % content.length]
                  ? getTitle(content[(getOriginalIndex(centeredContentIndex) + 1) % content.length])
                  : ''}
              </h2>
              <h2 className="hidden md:block text-xl font-semibold text-gray-500 mt-1 opacity-50 transition-all duration-300 ease-in-out">
                {content[(getOriginalIndex(centeredContentIndex) + 2) % content.length]
                  ? getTitle(content[(getOriginalIndex(centeredContentIndex) + 2) % content.length])
                  : ''}
              </h2>
              
              {/* Only show overview on mobile */}
              <p className="mt-2 md:hidden text-sm text-gray-300 line-clamp-3">
                {centeredContent.overview}
              </p>
            </div>
          ) : (
            <div className="text-gray-500">{isLoading ? 'Loading...' : 'No content selected'}</div>
          )}
        </div>

        {/* Combine both style rules in a single style tag */}
        <style jsx global>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </>
  );
}