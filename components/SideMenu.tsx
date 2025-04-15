'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SideMenu() {
  const pathname = usePathname();

  return (
    <div className="side-menu-container">
      {/* This assumes the parent applies correct positioning (e.g., within .header or a grid/flex column) */}
      {/* Vertical Menu with Active State */}
      <div className="vertical-menu-content">
        <Link 
          href="/" 
          className={`menu-item ${pathname === '/' ? 'active' : ''}`}
        >
          Displayr
        </Link>
        <Link 
          href="/search" 
          className={`menu-item ${pathname === '/search' ? 'active' : ''}`}
        >
          Search
        </Link>
      </div>
    </div>
  );
} 