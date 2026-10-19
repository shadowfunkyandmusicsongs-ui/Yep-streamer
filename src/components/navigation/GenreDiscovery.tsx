import React, { useRef } from 'react';
import {
  Flame,
  Wand2,
  Heart,
  Smile,
  Shield,
  Cpu,
  Ghost,
  Landmark,
  Compass,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react';
import { ContentItem } from '../../types';

export interface GenreDiscoveryProps {
  selectedGenre: string;
  onSelectGenre: (genre: string) => void;
  catalog?: ContentItem[];
}

interface GenreTagItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badgeBg: string;
}

const GENRE_TAGS: GenreTagItem[] = [
  {
    id: 'all',
    label: 'All Genres',
    icon: Compass,
    accentColor: 'from-cyan-500 to-blue-600',
    badgeBg: 'bg-cyan-500/20 text-cyan-300',
  },
  {
    id: 'Action',
    label: 'Action',
    icon: Flame,
    accentColor: 'from-rose-500 to-amber-600',
    badgeBg: 'bg-rose-500/20 text-rose-300',
  },
  {
    id: 'Fantasy',
    label: 'Fantasy',
    icon: Wand2,
    accentColor: 'from-violet-500 to-fuchsia-600',
    badgeBg: 'bg-violet-500/20 text-violet-300',
  },
  {
    id: 'Romance',
    label: 'Romance',
    icon: Heart,
    accentColor: 'from-pink-500 to-rose-500',
    badgeBg: 'bg-pink-500/20 text-pink-300',
  },
  {
    id: 'Comedy',
    label: 'Comedy',
    icon: Smile,
    accentColor: 'from-teal-500 to-emerald-600',
    badgeBg: 'bg-teal-500/20 text-teal-300',
  },
  {
    id: 'Thriller',
    label: 'Thriller',
    icon: Shield,
    accentColor: 'from-amber-500 to-orange-600',
    badgeBg: 'bg-amber-500/20 text-amber-300',
  },
  {
    id: 'Sci-Fi',
    label: 'Sci-Fi',
    icon: Cpu,
    accentColor: 'from-cyan-500 to-teal-500',
    badgeBg: 'bg-cyan-500/20 text-cyan-300',
  },
  {
    id: 'Supernatural',
    label: 'Supernatural',
    icon: Ghost,
    accentColor: 'from-emerald-500 to-cyan-600',
    badgeBg: 'bg-emerald-500/20 text-emerald-300',
  },
  {
    id: 'Historical',
    label: 'Historical',
    icon: Landmark,
    accentColor: 'from-orange-500 to-amber-600',
    badgeBg: 'bg-orange-500/20 text-orange-300',
  },
];

export const GenreDiscovery: React.FC<GenreDiscoveryProps> = ({
  selectedGenre,
  onSelectGenre,
  catalog = [],
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const offset = direction === 'left' ? -280 : 280;
    scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const getCount = (genreId: string) => {
    if (!catalog || catalog.length === 0) return null;
    if (genreId === 'all') return catalog.length;
    return catalog.filter((item) => item.genres.includes(genreId)).length;
  };

  return (
    <div className="w-full my-4 select-none relative group/genreNav animate-fade-in">
      <div className="flex items-center justify-between mb-2.5 px-0.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
            Browse by Genre
          </span>
        </div>

        {selectedGenre !== 'all' && (
          <button
            onClick={() => onSelectGenre('all')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors uppercase font-mono tracking-wider"
          >
            Clear Filter ×
          </button>
        )}
      </div>

      {/* Horizontal Scroll Controls */}
      <div className="relative flex items-center">
        <button
          onClick={() => scroll('left')}
          className="hidden sm:flex absolute -left-3 z-20 w-8 h-8 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white items-center justify-center opacity-0 group-hover/genreNav:opacity-100 transition-opacity shadow-lg backdrop-blur-md"
          aria-label="Scroll genres left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Horizontal List of Clickable Genre Tags */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto py-1 scroll-smooth no-scrollbar w-full"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {GENRE_TAGS.map((tag) => {
            const isSelected = selectedGenre === tag.id;
            const Icon = tag.icon;
            const count = getCount(tag.id);

            return (
              <button
                key={tag.id}
                onClick={() => onSelectGenre(tag.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? `bg-gradient-to-r ${tag.accentColor} text-slate-950 shadow-md shadow-cyan-950/40 ring-1 ring-white/30 scale-102`
                    : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
                }`}
                aria-pressed={isSelected}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'stroke-[2.5]' : 'text-slate-400'}`} />
                <span>{tag.label}</span>
                {count !== null && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-black/30 text-slate-950 font-black' : tag.badgeBg
                    }`}
                  >
                    {count}
                  </span>
                )}
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] text-slate-950" />}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => scroll('right')}
          className="hidden sm:flex absolute -right-3 z-20 w-8 h-8 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white items-center justify-center opacity-0 group-hover/genreNav:opacity-100 transition-opacity shadow-lg backdrop-blur-md"
          aria-label="Scroll genres right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
