'use client';

import { useState } from 'react';

/**
 * VideoCard Component
 * Displays a single video quality option with download functionality
 */
export default function VideoCard({ video, index }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);

      const proxyUrl = `/api/proxy?url=${encodeURIComponent(video.url)}&download=1`;
      const response = await fetch(proxyUrl);

      if (!response.ok) throw new Error(`Server returned ${response.status}`);

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      const isAudio = video.type === 'audio/mp4';
      a.download = `instagram-reel-${video.quality.toLowerCase().replace(/[^a-z0-9]/g, '-')}.${isAudio ? 'm4a' : 'mp4'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(objectUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert(`Failed to download video: ${error.message}`);
    } finally {
      setDownloading(false);
    }
  };

  // Format bitrate for display
  const formatBitrate = (bitrate) => {
    if (!bitrate) return 'N/A';
    const kbps = Math.round(bitrate / 1000);
    if (kbps > 1000) {
      return `${(kbps / 1000).toFixed(1)} Mbps`;
    }
    return `${kbps} Kbps`;
  };

  return (
    <div 
      className="glass-card p-6 neon-border hover:bg-dark-card/70 transition-all duration-300 animate-slide-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center">
              <svg 
                className="w-5 h-5 text-neon-cyan" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" 
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-display font-semibold text-neon-cyan">
                {video.quality}
              </h3>
              <p className="text-sm text-gray-400">
                Bitrate: {formatBitrate(video.bitrate)}
              </p>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="btn-secondary flex items-center space-x-2"
        >
          {downloading ? (
            <>
              <div className="w-4 h-4 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
              <span>Downloading...</span>
            </>
          ) : (
            <>
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" 
                />
              </svg>
              <span>Download</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
