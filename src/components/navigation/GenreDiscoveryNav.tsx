import React from 'react';
import {
  Flame,
  Wand2,
  Heart,
  Cpu,
  Shield,
  Ghost,
  Landmark,
  Smile,
  Compass,
  Check,
} from 'lucide-react';
import { ContentItem } from '../../types';

interface GenreDiscoveryNavProps {
  selectedGenre: string;
  onSelectGenre: (genre: string) => void;
  catalog: ContentItem[];
}

interface GenreMeta {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  activeBorder: string;
}

const GENRE_DISCOVERY_LIST: GenreMeta[] = [
  {
    id: 'Action',
    name: 'Action',
    description: 'Electrifying Katana duels & chariot battles',
    icon: Flame,
    gradient: 'from-rose-950/60 via-slate-900 to-rose-900/30',
    activeBorder: 'border-rose-500 shadow-rose-950/50',
  },
  {
    id: 'Fantasy',
    name: 'Fantasy',
    description: 'Celestial dragons, spirit kitsune & relics',
    icon: Wand2,
    gradient: 'from-violet-950/60 via-slate-900 to-violet-900/30',
    activeBorder: 'border-violet-500 shadow-violet-950/50',
  },
  {
    id: 'Romance',
    name: 'Romance',
    description: 'Heartfelt cosmic bonds & emotional drama',
    icon: Heart,
    gradient: 'from-pink-950/60 via-slate-900 to-pink-900/30',
    activeBorder: 'border-pink-500 shadow-pink-950/50',
  },
  {
    id: 'Sci-Fi',
    name: 'Sci-Fi',
    description: 'Cyberpunk neo-Tokyo, temporal loops & mecha',
    icon: Cpu,
    gradient: 'from-cyan-950/60 via-slate-900 to-cyan-900/30',
    activeBorder: 'border-cyan-500 shadow-cyan-950/50',
  },
  {
    id: 'Thriller',
    name: 'Thriller',
    description: 'Deep-sea anomalies & cybercrime heists',
    icon: Shield,
    gradient: 'from-amber-950/60 via-slate-900 to-amber-900/30',
    activeBorder: 'border-amber-500 shadow-amber-950/50',
  },
  {
    id: 'Supernatural',
    name: 'Supernatural',
    description: 'Alchemist seals & nine-tailed spirits',
    icon: Ghost,
    gradient: 'from-emerald-950/60 via-slate-900 to-emerald-900/30',
    activeBorder: 'border-emerald-500 shadow-emerald-950/50',
  },
  {
    id: 'Historical',
    name: 'Historical',
    description: 'Deccan fortress epics & ancient dynasties',
    icon: Landmark,
    gradient: 'from-orange-950/60 via-slate-900 to-orange-900/30',
    activeBorder: 'border-orange-500 shadow-orange-950/50',
  },
  {
    id: 'Comedy',
    name: 'Comedy',
    description: 'Wholesome slice-of-life & street adventures',
    icon: Smile,
    gradient: 'from-teal-950/60 via-slate-900 to-teal-900/30',
    activeBorder: 'border-teal-500 shadow-teal-950/50',
  },
];

export const GenreDiscoveryNav: React.FC<GenreDiscoveryNavProps> = ({
  selectedGenre,
  onSelectGenre,
  catalog,
}) => {
  // Count titles for each genre
  const getGenreCount = (genreName: string) => {
    return catalog.filter((item) => item.genres.includes(genreName)).length;
  };

  return (
    <div className="w-full my-6 select-none animate-fade-in">
      {/* Header and Filter Info */}
      <div className="flex items-baseline justify-between mb-3 px-1">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Explore by Cinematic Genre</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            Discover catalog titles curated by storyline themes and visual style
          </p>
        </div>

        {selectedGenre !== 'all' && (
          <button
            onClick={() => onSelectGenre('all')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors uppercase font-mono tracking-wider"
          >
            Show All ({catalog.length}) →
          </button>
        )}
      </div>

      {/* Primary Scrollable Genre Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
        {GENRE_DISCOVERY_LIST.map((genre) => {
          const isSelected = selectedGenre === genre.id;
          const count = getGenreCount(genre.id);
          const Icon = genre.icon;

          return (
            <button
              key={genre.id}
              onClick={() => onSelectGenre(isSelected ? 'all' : genre.id)}
              className={`group relative p-3 rounded-xl border text-left flex flex-col justify-between transition-all duration-300 bg-gradient-to-br ${
                genre.gradient
              } ${
                isSelected
                  ? `${genre.activeBorder} shadow-lg ring-1 ring-cyan-400 -translate-y-1`
                  : 'border-slate-800/80 hover:border-slate-700 hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`p-1.5 rounded-lg ${
                    isSelected ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-950/80 text-cyan-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-slate-400 group-hover:text-white font-semibold">
                  {count} {count === 1 ? 'title' : 'titles'}
                </span>
              </div>

              <div>
                <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 flex items-center justify-between">
                  <span>{genre.name}</span>
                  {isSelected && <Check className="w-3 h-3 text-cyan-400 shrink-0" />}
                </h3>
                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 leading-snug">
                  {genre.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Tag Pills Bar */}
      <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 no-scrollbar text-xs">
        <button
          onClick={() => onSelectGenre('all')}
          className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-colors ${
            selectedGenre === 'all'
              ? 'bg-cyan-500 text-slate-950 font-bold'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          All Genres ({catalog.length})
        </button>

        {['Action', 'Fantasy', 'Romance', 'Sci-Fi', 'Thriller', 'Supernatural', 'Historical', 'Comedy'].map(
          (tag) => {
            const isTagActive = selectedGenre === tag;
            return (
              <button
                key={tag}
                onClick={() => onSelectGenre(isTagActive ? 'all' : tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-colors ${
                  isTagActive
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-950/50'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                {tag} ({getGenreCount(tag)})
              </button>
            );
          }
        )}
      </div>
    </div>
  );
};
