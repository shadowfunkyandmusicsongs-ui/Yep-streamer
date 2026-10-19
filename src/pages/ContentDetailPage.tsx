import React, { useState } from 'react';
import {
  Play,
  Plus,
  Check,
  Star,
  ArrowLeft,
  Volume2,
  Subtitles,
  Clock,
  Calendar,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { ContentItem, Episode } from '../types';
import { useWatchlist } from '../context/WatchlistContext';
import { ContentShelf } from '../components/content/ContentShelf';

interface ContentDetailPageProps {
  item: ContentItem;
  allCatalog: ContentItem[];
  onPlay: (item: ContentItem, episode?: Episode) => void;
  onSelectContent: (item: ContentItem) => void;
  onBack: () => void;
}

export const ContentDetailPage: React.FC<ContentDetailPageProps> = ({
  item,
  allCatalog,
  onPlay,
  onSelectContent,
  onBack,
}) => {
  const { isInWatchlist, toggleWatchlist, getWatchProgress } = useWatchlist();
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState(1);
  const inList = isInWatchlist(item.id);
  const progress = getWatchProgress(item.id);

  const relatedTitles = allCatalog
    .filter((c) => c.id !== item.id && c.genres.some((g) => item.genres.includes(g)))
    .slice(0, 6);

  const seasons = item.seasons || [];
  const currentSeason = seasons.find((s) => s.seasonNumber === selectedSeasonNumber) || seasons[0];

  return (
    <div className="w-full pb-16 animate-fade-in text-white">
      {/* Top Hero Banner Section */}
      <div className="relative w-full min-h-[500px] md:min-h-[560px] bg-slate-950 flex flex-col justify-end">
        {/* Backdrop Image */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={item.bannerUrl}
            alt={item.title}
            className="w-full h-full object-cover object-top opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent w-full md:w-2/3" />
        </div>

        {/* Back Button */}
        <div className="absolute top-6 left-4 sm:left-8 z-20">
          <button
            onClick={onBack}
            className="p-2 rounded-full bg-black/60 hover:bg-black text-white border border-white/20 backdrop-blur-md flex items-center gap-1.5 px-3 text-xs font-semibold transition-colors shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Browse</span>
          </button>
        </div>

        {/* Content Details Overlay */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 pb-10 z-10 w-full">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-end">
            {/* Poster Thumbnail (Desktop) */}
            <div className="hidden sm:block w-48 lg:w-56 rounded-xl overflow-hidden shadow-2xl border border-white/10 shrink-0 bg-slate-900">
              <img
                src={item.posterUrl}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Metadata and Description */}
            <div className="flex-1 space-y-3 max-w-3xl">
              {/* Badges line */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-semibold uppercase text-[10px]">
                  {item.type.replace('_', ' ')}
                </span>
                <span className="text-slate-300 font-mono">{item.releaseYear}</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-300 font-mono">{item.duration}</span>
                <span className="text-slate-500">·</span>
                <span className="px-1.5 py-0.5 rounded bg-white/10 text-slate-200 border border-white/10 text-[10px]">
                  {item.ageRating}
                </span>
                <div className="flex items-center gap-1 text-amber-400 font-semibold ml-2">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{item.ratingScore}</span>
                  <span className="text-slate-400 font-mono text-[11px]">({item.viewsCount.toLocaleString()} views)</span>
                </div>
              </div>

              {/* Title & Alternate Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
                {item.title}
              </h1>
              {item.alternateTitle && (
                <p className="text-sm sm:text-base text-cyan-300/80 font-mono tracking-wide">
                  {item.alternateTitle}
                </p>
              )}

              {/* Genres list (Zero-pill text) */}
              <div className="text-xs text-slate-400">
                <span>Genres: </span>
                <span className="text-slate-200 font-medium">
                  {item.genres.join(' · ')}
                </span>
              </div>

              {/* Synopsis */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
                {item.synopsis}
              </p>

              {/* Audio and Subtitle Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-slate-400">Audio:</span>
                  <span className="font-medium text-white">{item.audioLanguages.join(', ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Subtitles className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-slate-400">Subtitles:</span>
                  <span className="font-medium text-white">{item.subtitleLanguages.join(', ')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <button
                  onClick={() => onPlay(item)}
                  className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cyan-950/50 transition-all hover:scale-102 active:scale-98"
                >
                  <Play className="w-4 h-4 fill-current translate-x-0.5" />
                  <span>
                    {progress && progress.percentage > 0 ? `Resume (${progress.percentage}%)` : 'Watch Now'}
                  </span>
                </button>

                <button
                  onClick={() => toggleWatchlist(item.id)}
                  className={`px-4 py-3 rounded-xl border border-white/20 backdrop-blur-md text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors ${
                    inList ? 'bg-cyan-900/60 border-cyan-400 text-cyan-300' : 'bg-black/50 hover:bg-white/10 text-white'
                  }`}
                >
                  {inList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{inList ? 'In Watchlist' : 'Add to Watchlist'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Episodes Section (if TV Series or Anime Series) */}
      {seasons.length > 0 && currentSeason && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-10 border-t border-white/5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white tracking-tight">Episodes</h2>
              {seasons.length > 1 && (
                <div className="relative">
                  <select
                    value={selectedSeasonNumber}
                    onChange={(e) => setSelectedSeasonNumber(Number(e.target.value))}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white appearance-none pr-8 cursor-pointer"
                  >
                    {seasons.map((s) => (
                      <option key={s.seasonNumber} value={s.seasonNumber}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              )}
            </div>

            <span className="text-xs text-slate-400 font-mono">
              {currentSeason.episodes.length} Episodes Available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentSeason.episodes.map((ep) => (
              <div
                key={ep.id}
                onClick={() => onPlay(item, ep)}
                className="group p-3 rounded-xl bg-slate-900/70 hover:bg-slate-900 border border-white/5 hover:border-cyan-500/40 transition-all cursor-pointer flex flex-col justify-between shadow-md"
              >
                <div className="relative h-40 rounded-lg overflow-hidden mb-3 bg-slate-950">
                  <img
                    src={ep.thumbnailUrl}
                    alt={ep.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                      <Play className="w-4 h-4 fill-current translate-x-0.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 font-mono text-[10px] text-white">
                    {ep.duration}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono text-cyan-400 font-bold">
                      EP {ep.episodeNumber}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{ep.releaseDate}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                    {ep.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {ep.synopsis}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related Content Shelf */}
      {relatedTitles.length > 0 && (
        <div className="mt-6 border-t border-white/5 pt-6">
          <ContentShelf
            title="More Like This"
            subtitle="Recommended titles sharing similar genres and anime styles"
            items={relatedTitles}
            onSelect={onSelectContent}
            onPlay={onPlay}
            cardSize="normal"
          />
        </div>
      )}
    </div>
  );
};
