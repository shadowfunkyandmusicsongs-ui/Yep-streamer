import React, { useState } from 'react';
import { Play, Plus, Check, Info, Star } from 'lucide-react';
import { ContentItem } from '../../types';
import { useWatchlist } from '../../context/WatchlistContext';

interface ContentCardProps {
  item: ContentItem;
  onSelect: (item: ContentItem) => void;
  onPlay: (item: ContentItem) => void;
  size?: 'normal' | 'large' | 'compact';
}

export const ContentCard: React.FC<ContentCardProps> = ({
  item,
  onSelect,
  onPlay,
  size = 'normal',
}) => {
  const { isInWatchlist, toggleWatchlist, getWatchProgress } = useWatchlist();
  const [imageError, setImageError] = useState(false);
  const inList = isInWatchlist(item.id);
  const progress = getWatchProgress(item.id);

  const fallbackSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"><rect width="300" height="450" fill="%230f172a"/><text x="50%" y="50%" fill="%2394a3b8" font-size="16" font-family="sans-serif" text-anchor="middle">${encodeURIComponent(item.title)}</text></svg>`;

  const widthClasses = {
    normal: 'w-[170px] sm:w-[190px] md:w-[210px]',
    large: 'w-[210px] sm:w-[240px] md:w-[270px]',
    compact: 'w-[140px] sm:w-[160px]',
  }[size];

  const heightClasses = {
    normal: 'h-[250px] sm:h-[280px] md:h-[310px]',
    large: 'h-[310px] sm:h-[350px] md:h-[390px]',
    compact: 'h-[200px] sm:h-[230px]',
  }[size];

  // Zero-pill metadata line: Action · 2024 · 2h 15m
  const metadataLine = [
    item.genres[0],
    item.releaseYear,
    item.duration,
  ].filter(Boolean).join(' · ');

  // Dubs line
  const dubsLine = item.audioLanguages.slice(0, 3).join(', ') + ' Dub';

  return (
    <div
      className={`group relative shrink-0 ${widthClasses} flex flex-col cursor-pointer transition-transform duration-300 ease-out hover:-translate-y-1.5 focus-within:-translate-y-1.5`}
      onClick={() => onSelect(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onSelect(item);
      }}
      aria-label={`${item.title}, ${item.type.replace('_', ' ')}`}
    >
      {/* Poster Image Container */}
      <div className={`relative w-full ${heightClasses} rounded-xl overflow-hidden bg-slate-900 border border-white/5 shadow-md group-hover:border-cyan-500/40 group-hover:shadow-cyan-950/50 group-hover:shadow-xl transition-all duration-300`}>
        <img
          src={imageError ? fallbackSvg : item.posterUrl}
          alt={item.title}
          onError={() => setImageError(true)}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top Badges: Rating & Trending */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {item.trendingRank && item.trendingRank <= 5 ? (
            <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/90 text-slate-950 uppercase shadow-xs">
              TOP {item.trendingRank}
            </span>
          ) : (
            <span className="text-[10px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-slate-300 border border-white/10 uppercase">
              {item.type.replace('_', ' ')}
            </span>
          )}

          <div className="flex items-center gap-1 text-[11px] font-semibold bg-black/70 backdrop-blur-xs text-amber-400 px-1.5 py-0.5 rounded border border-white/10">
            <Star className="w-3 h-3 fill-current" />
            <span>{item.ratingScore}</span>
          </div>
        </div>

        {/* Continue Watching Progress bar if active */}
        {progress && progress.percentage > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/70">
            <div
              className="h-full bg-cyan-400 transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        )}

        {/* Quick Action Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-250 flex flex-col justify-end p-3">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlay(item);
              }}
              title="Watch Now"
              className="w-9 h-9 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
              aria-label={`Play ${item.title}`}
            >
              <Play className="w-4 h-4 fill-current translate-x-0.5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWatchlist(item.id);
              }}
              title={inList ? 'Remove from Watchlist' : 'Add to Watchlist'}
              className={`w-9 h-9 rounded-full border border-white/20 backdrop-blur-md flex items-center justify-center transition-colors ${
                inList ? 'bg-cyan-600 text-white border-cyan-400' : 'bg-black/60 text-white hover:bg-white/20'
              }`}
              aria-label={inList ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              {inList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(item);
              }}
              title="More Info"
              className="w-9 h-9 rounded-full bg-black/60 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white flex items-center justify-center transition-colors ml-auto"
              aria-label="View title details"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          <div className="text-[11px] text-cyan-300 font-medium truncate">
            {dubsLine}
          </div>
        </div>
      </div>

      {/* Unboxed Metadata Discipline */}
      <div className="mt-2.5 px-0.5">
        <h3 className="text-xs sm:text-sm font-semibold text-slate-100 truncate group-hover:text-cyan-400 transition-colors">
          {item.title}
        </h3>
        <p className="text-[11px] text-slate-400 font-mono tracking-tight mt-0.5 truncate">
          {metadataLine}
        </p>
      </div>
    </div>
  );
};
