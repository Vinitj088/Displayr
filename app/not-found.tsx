"use client";

import Link from "next/link";
import dynamic from 'next/dynamic';

function NotFoundContent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="mb-8">The page you are looking for doesn't exist or has been moved.</p>
      <Link 
        href="/"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
}

const DynamicNotFoundContent = dynamic(() => Promise.resolve(NotFoundContent), {
  ssr: false,
  loading: () => <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading...</div>,
});

export default function NotFound() {
  return <DynamicNotFoundContent />;
} 