'use client';

import { useState } from 'react';
import AdGateModal from './AdGateModal';

export default function VideoCard({ video, index }) {
  const [downloading, setDownloading] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);

  const triggerDownload = async () => {
    try {
      setDownloading(true);

      let response;
      if (video.audioUrl) {
        const mergeUrl =
          `/api/merge?videoUrl=${encodeURIComponent(video.url)}` +
          `&audioUrl=${encodeURIComponent(video.audioUrl)}`;
        response = await fetch(mergeUrl);
      } else {
        response = await fetch(`/api/proxy?url=${encodeURIComponent(video.url)}&download=1`);
      }

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: `Server error ${response.status}` }));
        throw new Error(err.error || `Server error ${response.status}`);
      }

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
      alert(`Failed to download: ${error.message}`);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownload = () => {
    if (video.adRequired) {
      setShowAdModal(true);
    } else {
      triggerDownload();
    }
  };

  const isHD = video.adRequired;
  const isAudio = video.type === 'audio/mp4';

  return (
    <>
      {showAdModal && (
        <AdGateModal
          onComplete={() => { setShowAdModal(false); triggerDownload(); }}
          onCancel={() => setShowAdModal(false)}
        />
      )}

      <div
        className="glass-card p-6 neon-border hover:bg-dark-card/70 transition-all duration-300 animate-slide-up"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${isHD ? 'from-yellow-500/20 to-orange-500/20' : isAudio ? 'from-neon-purple/20 to-neon-pink/20' : 'from-neon-cyan/20 to-neon-purple/20'}`}>
              {isAudio ? (
                <svg className="w-5 h-5 text-neon-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              ) : (
                <svg className={`w-5 h-5 ${isHD ? 'text-yellow-400' : 'text-neon-cyan'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className={`text-lg font-display font-semibold ${isHD ? 'text-yellow-400' : isAudio ? 'text-neon-purple' : 'text-neon-cyan'}`}>
                  {video.quality}
                </h3>
                {isHD && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-display">
                    Watch Ad
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400">
                {isAudio ? 'Audio only' : video.audioUrl ? 'Video + Audio' : 'Video only'}
              </p>
            </div>
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className={`px-5 py-2.5 rounded-lg font-display font-medium border transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${isHD ? 'bg-dark-card border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-500' : 'btn-secondary'}`}
          >
            {downloading ? (
              <>
                <div className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${isHD ? 'border-yellow-400' : 'border-neon-cyan'}`} />
                <span>{video.audioUrl ? 'Merging...' : 'Downloading...'}</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
