import React, { createContext, useContext, useEffect, useState } from 'react';
import { WatchProgress, ContentType } from '../types';

interface WatchlistContextType {
  watchlist: string[]; // Content IDs
  watchProgress: Record<string, WatchProgress>;
  toggleWatchlist: (contentId: string) => void;
  isInWatchlist: (contentId: string) => boolean;
  updateWatchProgress: (progress: {
    contentId: string;
    episodeId?: string;
    title: string;
    posterUrl: string;
    positionSeconds: number;
    durationSeconds: number;
    type: ContentType;
    seasonNumber?: number;
    episodeNumber?: number;
  }) => void;
  getWatchProgress: (contentId: string, episodeId?: string) => WatchProgress | undefined;
  clearHistory: () => void;
  clearWatchlist: () => void;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

const STORAGE_KEY_WATCHLIST = 'yep_watchlist';
const STORAGE_KEY_PROGRESS = 'yep_watch_progress';

export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WATCHLIST);
      return saved ? JSON.parse(saved) : ['anime-shadowblade', 'movie-suryavanshi'];
    } catch {
      return ['anime-shadowblade', 'movie-suryavanshi'];
    }
  });

  const [watchProgress, setWatchProgress] = useState<Record<string, WatchProgress>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROGRESS);
      return saved
        ? JSON.parse(saved)
        : {
            'anime-shadowblade': {
              contentId: 'anime-shadowblade',
              episodeId: 'sb-s1-e1',
              title: 'Shadowblade: Kyoto Eclipse',
              posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
              positionSeconds: 680,
              durationSeconds: 1440,
              percentage: 47,
              lastWatchedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
              type: 'anime_series',
              seasonNumber: 1,
              episodeNumber: 1,
            },
            'movie-suryavanshi': {
              contentId: 'movie-suryavanshi',
              title: 'Suryavanshi: The Golden Citadel',
              posterUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&auto=format&fit=crop&q=80',
              positionSeconds: 4320,
              durationSeconds: 9900,
              percentage: 43,
              lastWatchedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
              type: 'movie',
            },
          };
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_WATCHLIST, JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(watchProgress));
  }, [watchProgress]);

  const toggleWatchlist = (contentId: string) => {
    setWatchlist((prev) =>
      prev.includes(contentId) ? prev.filter((id) => id !== contentId) : [...prev, contentId]
    );
  };

  const isInWatchlist = (contentId: string) => watchlist.includes(contentId);

  const updateWatchProgress = (item: {
    contentId: string;
    episodeId?: string;
    title: string;
    posterUrl: string;
    positionSeconds: number;
    durationSeconds: number;
    type: ContentType;
    seasonNumber?: number;
    episodeNumber?: number;
  }) => {
    const key = item.episodeId ? `${item.contentId}_${item.episodeId}` : item.contentId;
    const percentage = item.durationSeconds > 0
      ? Math.min(100, Math.round((item.positionSeconds / item.durationSeconds) * 100))
      : 0;

    const record: WatchProgress = {
      ...item,
      percentage,
      lastWatchedAt: new Date().toISOString(),
    };

    setWatchProgress((prev) => ({
      ...prev,
      [key]: record,
      [item.contentId]: record, // Also index by contentId for shelf resume
    }));
  };

  const getWatchProgress = (contentId: string, episodeId?: string): WatchProgress | undefined => {
    if (episodeId) {
      return watchProgress[`${contentId}_${episodeId}`] || watchProgress[contentId];
    }
    return watchProgress[contentId];
  };

  const clearHistory = () => {
    setWatchProgress({});
    localStorage.removeItem(STORAGE_KEY_PROGRESS);
  };

  const clearWatchlist = () => {
    setWatchlist([]);
    localStorage.removeItem(STORAGE_KEY_WATCHLIST);
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        watchProgress,
        toggleWatchlist,
        isInWatchlist,
        updateWatchProgress,
        getWatchProgress,
        clearHistory,
        clearWatchlist,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}
