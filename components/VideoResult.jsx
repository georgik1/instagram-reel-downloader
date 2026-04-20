'use client';

import { useState } from 'react';
import VideoCard from './VideoCard';

export default function VideoResult({ data }) {
  const { thumbnail, videos, source } = data;
  const [merging, setMerging] = useState(false);

  const videoTrack = videos.find((v) => v.type === 'video/mp4');
  const audioTrack = videos.find((v) => v.type === 'audio/mp4');
  const hasSeparateTracks = !!(videoTrack && audioTrack);

  const handleMergedDownload = async () => {
    try {
      setMerging(true);
      const mergeUrl =
        `/api/merge?videoUrl=${encodeURIComponent(videoTrack.url)}` +
        `&audioUrl=${encodeURIComponent(audioTrack.url)}`;
      const response = await fetch(mergeUrl);
      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: `Server error ${response.status}` }));
        throw new Error(err.error || `Server error ${response.status}`);
      }
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = 'instagram-reel.mp4';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(objectUrl);
      document.body.removeChild(a);
    } catch (error) {
      alert(`Failed to download: ${error.message}`);
    } finally {
      setMerging(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-slide-up">
      {/* Source indicator */}
      <div className="flex items-center justify-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${source === 'cache' ? 'bg-neon-purple' : 'bg-neon-cyan'} animate-pulse`} />
        <p className="text-sm text-gray-400 font-display">
          {source === 'cache' ? 'Loaded from cache' : 'Fetched live'}
        </p>
      </div>

      {/* Video preview */}
      {thumbnail && (
        <div className="glass-card p-4 overflow-hidden">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-dark-bg">
            <img
              src={`/api/proxy?url=${encodeURIComponent(thumbnail)}`}
              alt="Video thumbnail"
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/80 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center space-x-2">
                <div className="w-12 h-12 rounded-full bg-neon-cyan/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-6 h-6 text-neon-cyan" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-display font-semibold text-white">Video Preview</p>
                  <p className="text-xs text-gray-300">
                    {videos.length} track{videos.length !== 1 ? 's' : ''} available
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Download options */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neon-cyan to-transparent" />
          <h2 className="text-2xl font-display font-bold text-gradient">Download Options</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neon-cyan to-transparent" />
        </div>

        {/* Combined download — shown first when tracks are separate */}
        {hasSeparateTracks && (
          <div className="glass-card p-6 neon-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-pink/20 to-neon-purple/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-neon-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-display font-semibold text-neon-pink">Combined (Video + Audio)</h3>
                  <p className="text-sm text-gray-400">Merged into a single MP4</p>
                </div>
              </div>
              <button
                onClick={handleMergedDownload}
                disabled={merging}
                className="px-6 py-3 rounded-lg font-display font-medium bg-dark-card border border-neon-pink/30 text-neon-pink transition-all duration-300 hover:bg-neon-pink/10 hover:border-neon-pink active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {merging ? (
                  <>
                    <div className="w-4 h-4 border-2 border-neon-pink border-t-transparent rounded-full animate-spin" />
                    <span>Merging...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Download</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Individual tracks */}
        <div className="space-y-3">
          {videos.map((video, index) => (
            <VideoCard key={index} video={video} index={index} />
          ))}
        </div>
      </div>

      <div className="glass-card p-4 text-center">
        <p className="text-sm text-gray-400">
          <span className="font-display font-semibold">Pro Tip:</span>{' '}
          {hasSeparateTracks
            ? 'Use the Combined button above for a single file with video and audio.'
            : 'Download the highest quality for best results.'}
        </p>
      </div>
    </div>
  );
}
