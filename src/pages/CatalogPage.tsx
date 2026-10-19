import React, { useState, useMemo } from 'react';
import { Search, Filter, RotateCcw, Sparkles } from 'lucide-react';
import { ContentItem, AudioLanguage } from '../types';
import { ContentCard } from '../components/content/ContentCard';
import { GenreDiscovery } from '../components/navigation/GenreDiscovery';

interface CatalogPageProps {
  category: 'all' | 'anime' | 'movies' | 'series' | 'discover';
  catalog: ContentItem[];
  onSelectContent: (item: ContentItem) => void;
  onPlayContent: (item: ContentItem) => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  category,
  catalog,
  onSelectContent,
  onPlayContent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedAudio, setSelectedAudio] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState<'trending' | 'rating' | 'newest' | 'title'>('trending');

  const pageTitles: Record<string, { title: string; subtitle: string }> = {
    all: {
      title: 'Complete Entertainment Catalog',
      subtitle: 'Browse all movies, anime series, and web dramas on YEP Streamer',
    },
    anime: {
      title: 'Anime Universe',
      subtitle: 'Seasonal series, anime feature films, and multi-language dubs',
    },
    movies: {
      title: 'Movies & Cinema',
      subtitle: 'Blockbuster epics, action thrillers, and cinematic stories',
    },
    series: {
      title: 'Web Series & Seasons',
      subtitle: 'Binge-worthy multi-episode series and gripping crime investigations',
    },
    discover: {
      title: 'Discover Audio Dubs & Genres',
      subtitle: 'Explore authentic Telugu dubs, Hindi voice tracks, and rare original audios',
    },
  };

  const audioList: { id: string; label: string }[] = [
    { id: 'all', label: 'All Audio Tracks' },
    { id: 'Telugu', label: 'Telugu Dub' },
    { id: 'Hindi', label: 'Hindi Dub' },
    { id: 'Japanese', label: 'Japanese Audio' },
    { id: 'English', label: 'English Audio' },
  ];

  // Scoped catalog for this specific page view
  const scopedCatalog = useMemo(() => {
    return catalog.filter((item) => {
      if (category === 'anime' && !item.type.startsWith('anime')) return false;
      if (category === 'movies' && item.type !== 'movie' && item.type !== 'anime_movie') return false;
      if (category === 'series' && item.type !== 'series' && item.type !== 'anime_series') return false;
      return true;
    });
  }, [catalog, category]);

  const filteredCatalog = useMemo(() => {
    return scopedCatalog.filter((item) => {
      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesAlt = item.alternateTitle?.toLowerCase().includes(query);
        const matchesGenre = item.genres.some((g) => g.toLowerCase().includes(query));
        if (!matchesTitle && !matchesAlt && !matchesGenre) return false;
      }

      // Genre filter
      if (selectedGenre !== 'all' && !item.genres.includes(selectedGenre)) {
        return false;
      }

      // Audio Dub filter
      if (selectedAudio !== 'all' && !item.audioLanguages.includes(selectedAudio as AudioLanguage)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (selectedSort === 'rating') return b.ratingScore - a.ratingScore;
      if (selectedSort === 'newest') return b.releaseYear - a.releaseYear;
      if (selectedSort === 'title') return a.title.localeCompare(b.title);
      // default: trending rank
      return (a.trendingRank || 99) - (b.trendingRank || 99);
    });
  }, [scopedCatalog, searchQuery, selectedGenre, selectedAudio, selectedSort]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedGenre('all');
    setSelectedAudio('all');
    setSelectedSort('trending');
  };

  const info = pageTitles[category] || pageTitles.all;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 animate-fade-in text-white">
      {/* Header section */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {info.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">{info.subtitle}</p>
      </div>

      {/* Clickable Horizontal List of Genre Tags (Action, Fantasy, Romance, Comedy, Thriller, etc.) */}
      <GenreDiscovery
        selectedGenre={selectedGenre}
        onSelectGenre={(g) => setSelectedGenre(g)}
        catalog={scopedCatalog}
      />

      {/* Filter and Search Controls Bar */}
      <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-4 mb-8 space-y-4 shadow-lg backdrop-blur-md">
        {/* Search bar and Sort selector */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search within this category by title, Japanese romaji, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedAudio}
              onChange={(e) => setSelectedAudio(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-hidden focus:border-cyan-500"
              aria-label="Filter by audio track"
            >
              {audioList.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>

            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-hidden focus:border-cyan-500"
              aria-label="Sort catalog by"
            >
              <option value="trending">Sort: Trending</option>
              <option value="rating">Sort: Highest Rating</option>
              <option value="newest">Sort: Release Year</option>
              <option value="title">Sort: Title A-Z</option>
            </select>

            {(searchQuery || selectedGenre !== 'all' || selectedAudio !== 'all' || selectedSort !== 'trending') && (
              <button
                onClick={resetFilters}
                title="Reset filters"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Count & Grid */}
      <div className="flex items-center justify-between mb-4 text-xs text-slate-400">
        <span>Showing {filteredCatalog.length} titles</span>
        {selectedGenre !== 'all' && (
          <span className="text-cyan-400 font-mono">
            Active Genre Filter: <strong className="text-white">{selectedGenre}</strong>
          </span>
        )}
      </div>

      {filteredCatalog.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {filteredCatalog.map((item) => (
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
          <Sparkles className="w-10 h-10 text-cyan-400/50 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white mb-1">No matching titles found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Try switching genre, resetting the audio track filter, or searching with another keyword.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};
