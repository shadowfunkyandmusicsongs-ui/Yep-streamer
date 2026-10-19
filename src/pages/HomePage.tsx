import React from 'react';
import { Play, Sparkles, TrendingUp, Compass, Film, Tv, ChevronRight } from 'lucide-react';
import { ContentItem } from '../types';
import { HeroCarousel } from '../components/content/HeroCarousel';
import { ContentShelf } from '../components/content/ContentShelf';
import { useWatchlist } from '../context/WatchlistContext';
import { useTheme } from '../context/ThemeContext';

interface HomePageProps {
  catalog: ContentItem[];
  onSelectContent: (item: ContentItem) => void;
  onPlayContent: (item: ContentItem) => void;
  onNavigate: (tab: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  catalog,
  onSelectContent,
  onPlayContent,
  onNavigate,
}) => {
  const { watchProgress } = useWatchlist();
  const { t } = useTheme();

  const trendingAnime = catalog.filter(
    (i) => i.type.startsWith('anime') && (i.trendingRank || i.isPopular)
  );

  const popularMovies = catalog.filter(
    (i) => i.type === 'movie' || i.type === 'anime_movie'
  );

  const teluguDubbed = catalog.filter((i) =>
    i.audioLanguages.includes('Telugu')
  );

  const hindiDubbed = catalog.filter((i) =>
    i.audioLanguages.includes('Hindi')
  );

  const japaneseAudio = catalog.filter((i) =>
    i.audioLanguages.includes('Japanese')
  );

  const seriesList = catalog.filter(
    (i) => i.type === 'series' || i.type === 'anime_series'
  );

  // Continue Watching list based on stored watchProgress
  const continueWatchingItems = Object.values(watchProgress)
    .sort((a, b) => new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime())
    .map((prog) => catalog.find((c) => c.id === prog.contentId))
    .filter((c): c is ContentItem => Boolean(c));

  return (
    <div className="w-full pb-16 animate-fade-in">
      {/* Featured Cinematic Hero Banner */}
      <HeroCarousel
        items={catalog}
        onSelect={onSelectContent}
        onPlay={onPlayContent}
      />

      {/* Recent Admin Uploads & Live Streams Shelf */}
      {catalog.length > 0 && (
        <div className="my-6">
          <ContentShelf
            title="🎬 Recent Admin Uploads & Live Streams"
            subtitle="Directly uploaded from admin dashboard with 10s-30s turbo processing"
            items={catalog}
            onSelect={onSelectContent}
            onPlay={onPlayContent}
            cardSize="large"
          />
        </div>
      )}

      {/* Continue Watching Shelf (if any progress stored) */}
      {continueWatchingItems.length > 0 && (
        <div className="bg-slate-900/40 border-y border-white/5 py-2 my-4">
          <ContentShelf
            title={t('shelf.continue_watching')}
            subtitle="Pick up right where you left off with adaptive playback resume"
            items={continueWatchingItems}
            onSelect={onSelectContent}
            onPlay={onPlayContent}
            cardSize="normal"
          />
        </div>
      )}

      {/* Trending Anime Shelf */}
      <ContentShelf
        title={t('shelf.trending_anime')}
        subtitle="Top rated anime movies and seasonal series with multi-language dubs"
        items={trendingAnime}
        onSelect={onSelectContent}
        onPlay={onPlayContent}
        onViewAll={() => onNavigate('anime')}
        cardSize="large"
      />

      {/* Telugu Dubbed Exclusives */}
      <ContentShelf
        title={t('shelf.telugu_dubbed')}
        subtitle="Experience your favorite anime & blockbuster epics with authentic Telugu voice acting"
        items={teluguDubbed}
        onSelect={onSelectContent}
        onPlay={onPlayContent}
        onViewAll={() => onNavigate('discover')}
        cardSize="normal"
      />

      {/* Quick Category Banner Callout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 my-8">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-violet-950 via-slate-900 to-cyan-950 p-6 md:p-8 border border-white/10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <span className="text-xs font-mono tracking-wider px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-semibold uppercase">
              Creator Community
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Shorts & Behind the Scenes Reels
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Explore keyframe animations, VFX breakdowns, sound engineering, and voice actor interviews in vertical video.
            </p>
          </div>
          <button
            onClick={() => onNavigate('reels')}
            className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:shadow-cyan-500/25 transition-all hover:scale-102"
          >
            <Compass className="w-4 h-4" />
            <span>Launch Reels Feed</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Popular Movies Shelf */}
      <ContentShelf
        title={t('shelf.popular_movies')}
        subtitle="Feature-length cinematic journeys, Deccan historicals, and sci-fi mysteries"
        items={popularMovies}
        onSelect={onSelectContent}
        onPlay={onPlayContent}
        onViewAll={() => onNavigate('movies')}
        cardSize="normal"
      />

      {/* Hindi Dubbed Hits */}
      <ContentShelf
        title={t('shelf.hindi_dubbed')}
        subtitle="Blockbusters and anime hits featuring Hindi audio tracks"
        items={hindiDubbed}
        onSelect={onSelectContent}
        onPlay={onPlayContent}
        onViewAll={() => onNavigate('discover')}
        cardSize="normal"
      />

      {/* Japanese Original Audio */}
      <ContentShelf
        title={t('shelf.japanese_audio')}
        subtitle="Pure Japanese audio with high-accuracy closed captions"
        items={japaneseAudio}
        onSelect={onSelectContent}
        onPlay={onPlayContent}
        onViewAll={() => onNavigate('anime')}
        cardSize="normal"
      />

      {/* Series & Seasons */}
      <ContentShelf
        title="Web Series & Episodic Dramas"
        subtitle="Full multi-episode seasons with episode track persistence"
        items={seriesList}
        onSelect={onSelectContent}
        onPlay={onPlayContent}
        onViewAll={() => onNavigate('series')}
        cardSize="normal"
      />
    </div>
  );
};
