import React, { useState, useEffect } from 'react';
import { Play, Plus, Check, Info, Star, ChevronLeft, ChevronRight, Volume2 } from 'lucide-react';
import { ContentItem } from '../../types';
import { useWatchlist } from '../../context/WatchlistContext';

interface HeroCarouselProps {
  items: ContentItem[];
  onSelect: (item: ContentItem) => void;
  onPlay: (item: ContentItem) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ items, onSelect, onPlay }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  const featuredItems = items.filter((i) => i.isFeatured);
  const displayItems = featuredItems.length > 0 ? featuredItems : items.slice(0, 4);

  useEffect(() => {
    if (displayItems.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % displayItems.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [displayItems.length]);

  if (!displayItems.length) return null;
  const current = displayItems[activeIndex];
  const inList = isInWatchlist(current.id);

  return (
    <div className="relative w-full h-[65vh] min-h-[460px] max-h-[700px] bg-slate-950 overflow-hidden select-none">
      {/* Dynamic Backdrop with Fade Transition */}
      <div className="absolute inset-0">
        <img
          src={current.bannerUrl}
          alt={current.title}
          className="w-full h-full object-cover object-top opacity-60 scale-105 transition-transform duration-1000 ease-out"
        />
        {/* Layered gradients for cinematic depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent w-full md:w-3/4" />
      </div>

      {/* Content Meta Container */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-8 flex flex-col justify-end pb-12 z-10">
        <div className="max-w-2xl space-y-3">
          {/* Top meta tags */}
          <div className="flex items-center gap-3 text-xs">
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-semibold tracking-wider uppercase text-[10px]">
              {current.type === 'anime_series' ? 'Anime Series' : current.type === 'anime_movie' ? 'Anime Movie' : current.type.toUpperCase()}
            </span>
            <span className="text-slate-300 font-mono">{current.releaseYear}</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-300 font-mono">{current.duration}</span>
            <span className="text-slate-400">·</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-slate-200 border border-white/10">
              {current.ageRating}
            </span>
            <div className="flex items-center gap-1 text-amber-400 font-semibold text-xs ml-1">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{current.ratingScore}</span>
            </div>
          </div>

          {/* Titles */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
            {current.title}
          </h1>
          {current.alternateTitle && (
            <p className="text-xs sm:text-sm text-cyan-300/90 font-mono tracking-wide">
              {current.alternateTitle}
            </p>
          )}

          {/* Synopsis */}
          <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed drop-shadow-xs">
            {current.synopsis}
          </p>

          {/* Audio Tracks and Dub Availability */}
          <div className="flex items-center gap-2 pt-1 text-xs text-slate-300">
            <Volume2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-medium text-white">Audio Dubs:</span>
            <span className="text-slate-300 font-mono text-[11px]">
              {current.audioLanguages.join(' · ')}
            </span>
          </div>

          {/* Call to Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onPlay(current)}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-cyan-950/50 hover:shadow-cyan-500/25 transition-all hover:scale-102 active:scale-98"
            >
              <Play className="w-4 h-4 fill-current translate-x-0.5" />
              <span>Watch Now</span>
            </button>

            <button
              onClick={() => toggleWatchlist(current.id)}
              className={`px-4 py-2.5 rounded-xl border border-white/20 backdrop-blur-md text-sm font-semibold flex items-center gap-2 transition-colors ${
                inList ? 'bg-cyan-900/60 border-cyan-400 text-cyan-300' : 'bg-black/40 hover:bg-white/10 text-white'
              }`}
            >
              {inList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{inList ? 'In Watchlist' : 'Watchlist'}</span>
            </button>

            <button
              onClick={() => onSelect(current)}
              className="px-4 py-2.5 rounded-xl bg-black/40 hover:bg-white/10 border border-white/20 backdrop-blur-md text-white text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Info className="w-4 h-4" />
              <span>Details</span>
            </button>
          </div>
        </div>
      </div>

      {/* Slide Navigation Dots and Arrows */}
      <div className="absolute bottom-5 right-4 sm:right-8 flex items-center gap-3 z-20">
        <button
          onClick={() => setActiveIndex((prev) => (prev === 0 ? displayItems.length - 1 : prev - 1))}
          className="p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 backdrop-blur-xs transition-colors"
          aria-label="Previous featured title"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5">
          {displayItems.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex ? 'w-6 bg-cyan-400' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => setActiveIndex((prev) => (prev + 1) % displayItems.length)}
          className="p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 backdrop-blur-xs transition-colors"
          aria-label="Next featured title"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
