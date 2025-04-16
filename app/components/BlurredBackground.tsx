import React from 'react';
import Image from 'next/image';

interface BlurredBackgroundProps {
  imageUrl: string;
  alt?: string;
}

export default function BlurredBackground({ imageUrl, alt = "Background image" }: BlurredBackgroundProps) {
  return (
    <>
      {/* Main container */}
      <div className="fixed inset-0 w-screen h-screen overflow-hidden">
        {/* Base colored background from poster - similar to homepage */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(50px)',
            opacity: 0.18,
            transform: 'scale(1.2)',
          }}
        />
        
        
      </div>
    </>
  );
} 