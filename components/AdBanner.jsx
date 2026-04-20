'use client';

/**
 * AdBanner Component
 * Placeholder for ad integration (Google AdSense, etc.)
 */
export default function AdBanner({ position = 'top', className = '' }) {
  return (
    <div 
      className={`glass-card p-6 text-center border-dashed border-2 border-dark-border ${className}`}
      data-ad-position={position}
    >
      <div className="flex flex-col items-center justify-center space-y-2 py-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center">
          <svg 
            className="w-6 h-6 text-neon-cyan" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" 
            />
          </svg>
        </div>
        <p className="text-sm text-gray-500 font-display">
          Advertisement Space
        </p>
        <p className="text-xs text-gray-600">
          {position.charAt(0).toUpperCase() + position.slice(1)} Ad Placement
        </p>
      </div>
    </div>
  );
}
