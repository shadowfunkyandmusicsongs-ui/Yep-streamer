import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WatchlistProvider, useWatchlist } from './context/WatchlistContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { ProfileModal } from './components/modals/ProfileModal';
import { AdminPasscodeModal } from './components/modals/AdminPasscodeModal';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ContentDetailPage } from './pages/ContentDetailPage';
import { SearchPage } from './pages/SearchPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpSupportPage } from './pages/HelpSupportPage';
import { ReelsFeed } from './components/video/ReelsFeed';
import { VideoPlayer } from './components/video/VideoPlayer';
import { VideoErrorBoundary } from './components/video/VideoErrorBoundary';
import { FirebaseSetupModal } from './components/modals/FirebaseSetupModal';
import { ContentItem, Episode, ReelItem } from './types';
import { INITIAL_CATALOG } from './data/mockCatalog';
import { INITIAL_REELS } from './data/mockReels';

function MainLayout() {
  const STORAGE_CATALOG_KEY = 'yep_stream_catalog_v2';
  const [catalog, setCatalog] = useState<ContentItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CATALOG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return INITIAL_CATALOG;
  });

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CATALOG_KEY, JSON.stringify(catalog));
    } catch {}
  }, [catalog]);

  const [currentTab, setCurrentTab] = useState<string>('home');
  const [reels, setReels] = useState<ReelItem[]>(INITIAL_REELS);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [activePlayback, setActivePlayback] = useState<{
    content: ContentItem;
    episode?: Episode;
  } | null>(null);
  const [isFirebaseSetupOpen, setIsFirebaseSetupOpen] = useState(false);

  const { updateWatchProgress, getWatchProgress } = useWatchlist();
  const {
    adminPrivileges,
    showProfileModal,
    setShowProfileModal,
    showAdminPasscodeModal,
    setShowAdminPasscodeModal,
  } = useAuth();

  // Navigation handler - Upload and Admin features strictly restricted to passcode verification
  const handleNavigate = (tab: string) => {
    if (tab === 'creator-studio' || tab === 'admin-dashboard') {
      if (adminPrivileges.verified) {
        setCurrentTab('admin-dashboard');
      } else {
        setShowAdminPasscodeModal(true);
      }
      return;
    }
    setCurrentTab(tab);
    setSelectedContent(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Play content handler
  const handlePlayContent = (content: ContentItem, episode?: Episode) => {
    setActivePlayback({ content, episode });
  };

  // Content Selection handler
  const handleSelectContent = (item: ContentItem) => {
    setSelectedContent(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Content mutation handlers for Creator Studio & Admin
  const handleAddContent = (newItem: ContentItem) => {
    setCatalog((prev) => [newItem, ...prev]);
  };

  const handleUpdateContent = (updated: ContentItem) => {
    setCatalog((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  const handleDeleteContent = (id: string) => {
    if (confirm('Are you sure you want to remove this title from the catalog?')) {
      setCatalog((prev) => prev.filter((item) => item.id !== id));
      if (selectedContent?.id === id) {
        setSelectedContent(null);
      }
    }
  };

  const handleTogglePublish = (id: string) => {
    setCatalog((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === 'published' ? 'draft' : 'published';
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  const handleToggleFeatured = (id: string) => {
    setCatalog((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFeatured: !item.isFeatured } : item))
    );
  };

  // Reel mutation handlers
  const handleAddReel = (newReel: ReelItem) => {
    setReels((prev) => [newReel, ...prev]);
  };

  const handleDeleteReel = (id: string) => {
    setReels((prev) => prev.filter((r) => r.id !== id));
  };

  // Episode Next / Prev navigation
  const currentSeason = activePlayback?.content.seasons?.[0];
  const currentEpisodeIndex = currentSeason && activePlayback?.episode
    ? currentSeason.episodes.findIndex((e) => e.id === activePlayback.episode?.id)
    : -1;

  const hasNextEpisode = currentSeason && currentEpisodeIndex !== -1 && currentEpisodeIndex < currentSeason.episodes.length - 1;
  const hasPrevEpisode = currentSeason && currentEpisodeIndex > 0;

  const handleNextEpisode = () => {
    if (hasNextEpisode && currentSeason) {
      const nextEp = currentSeason.episodes[currentEpisodeIndex + 1];
      setActivePlayback({ content: activePlayback!.content, episode: nextEp });
    }
  };

  const handlePrevEpisode = () => {
    if (hasPrevEpisode && currentSeason) {
      const prevEp = currentSeason.episodes[currentEpisodeIndex - 1];
      setActivePlayback({ content: activePlayback!.content, episode: prevEp });
    }
  };

  // Video progress persistence callback
  const handlePlayerProgress = (currSec: number, durSec: number) => {
    if (!activePlayback) return;
    updateWatchProgress({
      contentId: activePlayback.content.id,
      episodeId: activePlayback.episode?.id,
      title: activePlayback.content.title,
      posterUrl: activePlayback.content.posterUrl,
      positionSeconds: currSec,
      durationSeconds: durSec,
      type: activePlayback.content.type,
      seasonNumber: activePlayback.content.seasons?.[0]?.seasonNumber,
      episodeNumber: activePlayback.episode?.episodeNumber,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Universal Desktop & Tablet Header */}
      <Header currentTab={currentTab} onNavigate={handleNavigate} />

      {/* Main Content Area (extra bottom padding on mobile for MobileBottomNav) */}
      <main className="flex-1 pb-16 lg:pb-0">
        {selectedContent ? (
          <ContentDetailPage
            item={selectedContent}
            allCatalog={catalog}
            onPlay={handlePlayContent}
            onSelectContent={handleSelectContent}
            onBack={() => setSelectedContent(null)}
          />
        ) : (
          <>
            {currentTab === 'home' && (
              <HomePage
                catalog={catalog}
                onSelectContent={handleSelectContent}
                onPlayContent={handlePlayContent}
                onNavigate={handleNavigate}
              />
            )}

            {currentTab === 'anime' && (
              <CatalogPage
                category="anime"
                catalog={catalog}
                onSelectContent={handleSelectContent}
                onPlayContent={handlePlayContent}
              />
            )}

            {currentTab === 'movies' && (
              <CatalogPage
                category="movies"
                catalog={catalog}
                onSelectContent={handleSelectContent}
                onPlayContent={handlePlayContent}
              />
            )}

            {currentTab === 'series' && (
              <CatalogPage
                category="series"
                catalog={catalog}
                onSelectContent={handleSelectContent}
                onPlayContent={handlePlayContent}
              />
            )}

            {currentTab === 'discover' && (
              <CatalogPage
                category="discover"
                catalog={catalog}
                onSelectContent={handleSelectContent}
                onPlayContent={handlePlayContent}
              />
            )}

            {currentTab === 'reels' && <ReelsFeed />}

            {currentTab === 'search' && (
              <SearchPage
                catalog={catalog}
                onSelectContent={handleSelectContent}
                onPlayContent={handlePlayContent}
              />
            )}

            {currentTab === 'watchlist' && (
              <WatchlistPage
                catalog={catalog}
                onSelectContent={handleSelectContent}
                onPlayContent={handlePlayContent}
                onNavigate={handleNavigate}
              />
            )}



            {currentTab === 'admin-dashboard' && (
              <AdminDashboardPage
                catalog={catalog}
                reels={reels}
                onAddContent={handleAddContent}
                onUpdateContent={handleUpdateContent}
                onDeleteContent={handleDeleteContent}
                onAddReel={handleAddReel}
                onDeleteReel={handleDeleteReel}
                onToggleFeatured={handleToggleFeatured}
                onTogglePublish={handleTogglePublish}
                onOpenPasscodeModal={() => setShowAdminPasscodeModal(true)}
                onPlayContent={handlePlayContent}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsPage onOpenFirebaseSetup={() => setIsFirebaseSetupOpen(true)} />
            )}

            {currentTab === 'help' && <HelpSupportPage />}
          </>
        )}
      </main>

      {/* Universal Footer (hidden in reels view) */}
      {currentTab !== 'reels' && <Footer onNavigate={handleNavigate} />}

      {/* Mobile Screen Bottom Navigation Bar (Set for Home, Anime, Movie, Series, Reels, Discover, Search, Watchlist, Profile) */}
      {currentTab !== 'reels' && (
        <MobileBottomNav
          currentTab={currentTab}
          onNavigate={handleNavigate}
          onOpenProfile={() => setShowProfileModal(true)}
        />
      )}

      {/* Profile Options Modal with Admin Portal Access */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onOpenAdminPasscode={() => setShowAdminPasscodeModal(true)}
        onNavigate={handleNavigate}
      />

      {/* Admin Passcode Gate Modal */}
      <AdminPasscodeModal
        isOpen={showAdminPasscodeModal}
        onClose={() => setShowAdminPasscodeModal(false)}
        onSuccess={() => handleNavigate('admin-dashboard')}
      />

      {/* Floating Fullscreen Video Player Modal */}
      {activePlayback && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center animate-fade-in">
          <VideoErrorBoundary onClose={() => setActivePlayback(null)}>
            <VideoPlayer
              contentId={activePlayback.content.id}
              episodeId={activePlayback.episode?.id}
              title={activePlayback.content.title}
              subtitle={
                activePlayback.episode
                  ? `Episode ${activePlayback.episode.episodeNumber}: ${activePlayback.episode.title}`
                  : activePlayback.content.duration
              }
              streamUrl={
                activePlayback.episode?.streamUrl ||
                activePlayback.content.streamUrl ||
                'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
              }
              hlsUrl={
                activePlayback.episode?.hlsUrl ||
                activePlayback.content.hlsUrl
              }
              posterUrl={
                activePlayback.episode?.thumbnailUrl || activePlayback.content.bannerUrl
              }
              initialTime={
                getWatchProgress(
                  activePlayback.content.id,
                  activePlayback.episode?.id
                )?.positionSeconds || 0
              }
              availableAudios={activePlayback.content.audioLanguages}
              availableSubtitles={activePlayback.content.subtitleLanguages}
              onProgress={handlePlayerProgress}
              hasNextEpisode={Boolean(hasNextEpisode)}
              hasPrevEpisode={Boolean(hasPrevEpisode)}
              onNextEpisode={handleNextEpisode}
              onPrevEpisode={handlePrevEpisode}
              onClose={() => setActivePlayback(null)}
            />
          </VideoErrorBoundary>
        </div>
      )}

      {/* Firebase Setup Modal */}
      <FirebaseSetupModal
        isOpen={isFirebaseSetupOpen}
        onClose={() => setIsFirebaseSetupOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WatchlistProvider>
          <MainLayout />
        </WatchlistProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
