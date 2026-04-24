'use client';

import VideoCard from './VideoCard';

export default function VideoResult({ data }) {
  const { thumbnail, videos, source } = data;

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
                    {videos.length} option{videos.length !== 1 ? 's' : ''} available
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

        <div className="space-y-3">
          {videos.map((video, index) => (
            <VideoCard key={index} video={video} index={index} />
          ))}
        </div>
      </div>

      <div className="glass-card p-4 text-center">
        <p className="text-sm text-gray-400">
          <span className="font-display font-semibold">Pro Tip:</span>{' '}
          HD quality requires watching a short ad. All video downloads include audio.
        </p>
      </div>
    </div>
  );
}
