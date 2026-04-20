'use client';

import { useState } from 'react';
import InputForm from '@/components/InputForm';
import VideoResult from '@/components/VideoResult';
import AdBanner from '@/components/AdBanner';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (url) => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch video');
      }

      setResult(data);
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError('');
  };

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-4 animate-slide-up">
          <div className="inline-block">
            <h1 className="text-6xl md:text-7xl font-display font-bold text-gradient glow-text mb-2">
              Instagram Reel Downloader
            </h1>
            <div className="h-1 bg-gradient-to-r from-transparent via-neon-pink to-transparent animate-pulse" />
          </div>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Download Instagram reels and videos in high quality. Fast, free, and privacy-focused.
          </p>
        </header>

        {/* Top Ad Banner */}
        <AdBanner position="top" className="animate-fade-in" />

        {/* Main Content */}
        <div className="space-y-8">
          {!result ? (
            <>
              <InputForm onSubmit={handleSubmit} loading={loading} />
              
              {/* Error Display */}
              {error && (
                <div className="max-w-3xl mx-auto animate-slide-up">
                  <div className="glass-card p-6 border-red-500/30 bg-red-500/5">
                    <div className="flex items-start space-x-3">
                      <svg 
                        className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                        />
                      </svg>
                      <div>
                        <h3 className="font-display font-semibold text-red-400 mb-1">
                          Error
                        </h3>
                        <p className="text-gray-300">{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading skeleton */}
              {loading && (
                <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
                  <div className="glass-card p-4">
                    <div className="aspect-square sm:aspect-video rounded-xl skeleton" />
                  </div>
                  <div className="space-y-3">
                    <div className="glass-card p-6">
                      <div className="h-16 rounded-lg skeleton" />
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <VideoResult data={result} />
              
              {/* Reset button */}
              <div className="text-center">
                <button
                  onClick={handleReset}
                  className="btn-secondary inline-flex items-center space-x-2"
                >
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
                      d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                    />
                  </svg>
                  <span>Download Another Reel</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Middle Ad Banner */}
        <AdBanner position="middle" className="animate-fade-in" />

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              icon: (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 10V3L4 14h7v7l9-11h-7z" 
                />
              ),
              title: 'Lightning Fast',
              description: 'Download reels in seconds with our optimized processing',
            },
            {
              icon: (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                />
              ),
              title: 'Privacy First',
              description: 'No data stored. All processing happens in real-time',
            },
            {
              icon: (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
                />
              ),
              title: 'High Quality',
              description: 'Download in original quality with audio included',
            },
          ].map((feature, index) => (
            <div 
              key={index}
              className="glass-card p-6 text-center space-y-4 neon-border hover:bg-dark-card/70 transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-neon-pink/20 to-neon-purple/20 flex items-center justify-center">
                <svg 
                  className="w-8 h-8 text-neon-pink" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  {feature.icon}
                </svg>
              </div>
              <h3 className="text-xl font-display font-bold text-neon-pink">
                {feature.title}
              </h3>
              <p className="text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom Ad Banner */}
        <AdBanner position="bottom" className="animate-fade-in" />

        {/* Footer */}
        <footer className="text-center space-y-4 pt-12 border-t border-dark-border">
          <p className="text-gray-500 text-sm">
            Made with <span className="text-neon-pink">♥</span> for the community
          </p>
          <p className="text-gray-600 text-xs">
            This tool is for personal use only. Respect copyright and content creators.
          </p>
        </footer>
      </div>
    </main>
  );
}
