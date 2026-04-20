'use client';

import { useState } from 'react';

/**
 * InputForm Component
 * Handles Twitter URL input and form submission
 */
export default function InputForm({ onSubmit, loading }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      setError('');
    } catch (err) {
      setError('Failed to access clipboard. Please paste manually.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Please enter an Instagram URL');
      return;
    }

    // Basic URL validation
    if (!url.includes('instagram.com')) {
      setError('Please enter a valid Instagram URL');
      return;
    }

    onSubmit(url);
  };

  const handleClear = () => {
    setUrl('');
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto space-y-6">
      <div className="glass-card p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-display font-bold text-gradient">
            Enter Reel URL
          </h2>
          <p className="text-gray-400">
            Paste an Instagram reel or video URL to download
          </p>
        </div>

        {/* Input field */}
        <div className="relative">
          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError('');
            }}
            placeholder="https://www.instagram.com/reel/..."
            className="input-field pr-32"
            disabled={loading}
          />
          
          {/* Paste and Clear buttons */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
            {url && (
              <button
                type="button"
                onClick={handleClear}
                className="p-2 rounded-lg hover:bg-dark-bg/50 transition-colors"
                disabled={loading}
              >
                <svg 
                  className="w-5 h-5 text-gray-400 hover:text-neon-pink" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>
            )}
            <button
              type="button"
              onClick={handlePaste}
              className="p-2 rounded-lg hover:bg-dark-bg/50 transition-colors"
              disabled={loading}
            >
              <svg 
                className="w-5 h-5 text-gray-400 hover:text-neon-cyan" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 animate-fade-in">
            <div className="flex items-center space-x-2">
              <svg 
                className="w-5 h-5 text-red-400 flex-shrink-0" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="btn-primary w-full"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-3">
              <div className="spinner" />
              <span>Processing...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <svg 
                className="w-6 h-6" 
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
              <span>Download Video</span>
            </div>
          )}
        </button>

        {/* Example URLs */}
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-2">Supported formats:</p>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            <code className="px-3 py-1 rounded bg-dark-bg/50 text-neon-cyan">
              instagram.com/reel/...
            </code>
            <code className="px-3 py-1 rounded bg-dark-bg/50 text-neon-cyan">
              instagram.com/p/...
            </code>
          </div>
        </div>
      </div>
    </form>
  );
}
