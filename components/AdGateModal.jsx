'use client';

import { useState, useEffect } from 'react';

export default function AdGateModal({ onComplete, onCancel }) {
  const [seconds, setSeconds] = useState(10);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="glass-card p-8 max-w-md w-full mx-4 space-y-6 text-center">
        <h2 className="text-2xl font-display font-bold text-gradient">HD Quality</h2>
        <p className="text-gray-400 text-sm">Please wait while a short ad plays to unlock HD download.</p>

        {/* Ad slot — replace with real AdSense unit */}
        <div className="w-full h-32 rounded-xl bg-dark-bg border border-white/10 flex items-center justify-center">
          <p className="text-gray-500 text-xs">[ Ad placeholder — add Google AdSense unit here ]</p>
        </div>

        {seconds > 0 ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-8 h-8 rounded-full border-2 border-neon-cyan border-t-transparent animate-spin" />
            <span className="text-neon-cyan font-display font-semibold">{seconds}s</span>
          </div>
        ) : (
          <button
            onClick={onComplete}
            className="w-full px-6 py-3 rounded-lg font-display font-medium bg-dark-card border border-neon-cyan/40 text-neon-cyan transition-all duration-300 hover:bg-neon-cyan/10 hover:border-neon-cyan active:scale-95"
          >
            Download HD
          </button>
        )}

        <button
          onClick={onCancel}
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
