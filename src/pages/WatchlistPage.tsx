import React, { useState } from 'react';
import { Bookmark, Clock, Trash2, Play, Sparkles } from 'lucide-react';
import { ContentItem, WatchProgress } from '../types';
import { useWatchlist } from '../context/WatchlistContext';
import { ContentCard } from '../components/content/ContentCard';

interface WatchlistPageProps {
  catalog: ContentItem[];
  onSelectContent: (item: ContentItem) => void;
  onPlayContent: (item: ContentItem) => void;
  onNavigate: (tab: string) => void;
}

export const WatchlistPage: React.FC<WatchlistPageProps> = ({
  catalog,
  onSelectContent,
  onPlayContent,
  onNavigate,
}) => {
  const { watchlist, watchProgress, clearHistory, clearWatchlist } = useWatchlist();
  const [activeTab, setActiveTab] = useState<'watchlist' | 'history'>('watchlist');

  const watchlistItems = catalog.filter((item) => watchlist.includes(item.id));

  const historyEntries = Object.values(watchProgress)
    .sort((a, b) => new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime())
    .map((prog) => ({
      progress: prog,
      item: catalog.find((c) => c.id === prog.contentId),
    }))
    .filter((entry): entry is { progress: WatchProgress; item: ContentItem } => Boolean(entry.item));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 animate-fade-in text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            My Entertainment Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Access your saved watchlists, viewing history, and active resume progress.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'watchlist'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Watchlist ({watchlistItems.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Viewing History ({historyEntries.length})</span>
          </button>
        </div>
      </div>

      {/* Watchlist Tab */}
      {activeTab === 'watchlist' && (
        <div>
          <div className="flex items-center justify-between mb-4 text-xs text-slate-400">
            <span>{watchlistItems.length} saved titles</span>
            {watchlistItems.length > 0 && (
              <button
                onClick={clearWatchlist}
                className="text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Watchlist</span>
              </button>
            )}
          </div>

          {watchlistItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {watchlistItems.map((item) => (
                <div key={item.id} className="flex justify-center">
                  <ContentCard
                    item={item}
                    onSelect={onSelectContent}
                    onPlay={onPlayContent}
                    size="normal"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-12 text-center my-8">
              <Bookmark className="w-10 h-10 text-cyan-400/50 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white mb-1">Your watchlist is empty</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                Explore anime series, cinema epics, or Telugu dubs and tap the + button to bookmark for later.
              </p>
              <button
                onClick={() => onNavigate('anime')}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Browse Anime Catalog
              </button>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div>
          <div className="flex items-center justify-between mb-4 text-xs text-slate-400">
            <span>{historyEntries.length} watched titles</span>
            {historyEntries.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}
          </div>

          {historyEntries.length > 0 ? (
            <div className="space-y-3">
              {historyEntries.map(({ progress, item }) => (
                <div
                  key={item.id}
                  className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.posterUrl}
                      alt={item.title}
                      className="w-14 h-20 rounded-lg object-cover bg-slate-950 shrink-0"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {item.type.replace('_', ' ')} · {progress.percentage}% completed
                      </p>
                      <div className="w-48 h-1.5 bg-slate-950 rounded-full mt-2 overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-cyan-400"
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onPlayContent(item)}
                      className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Resume Playback</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-12 text-center my-8">
              <Clock className="w-10 h-10 text-cyan-400/50 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white mb-1">No viewing history yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                Videos you watch will record your playback timestamp so you can resume seamlessly on any device.
              </p>
              <button
                onClick={() => onNavigate('home')}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Go to Home
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
