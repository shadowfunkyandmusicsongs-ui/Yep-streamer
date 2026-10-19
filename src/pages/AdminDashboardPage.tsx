import React, { useState } from 'react';
import {
  ShieldAlert,
  Film,
  Tv,
  Sparkles,
  Clapperboard,
  Compass,
  Plus,
  Edit3,
  Trash2,
  Star,
  CheckCircle2,
  Lock,
  Unlock,
  AlertCircle,
  UploadCloud,
  Layers,
  X,
  Play,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ContentItem, ContentType, ReelItem, AudioLanguage } from '../types';
import { MediaUploadForm } from '../components/admin/SecureVideoUploadForm';
import { EpisodesList } from '../components/admin/EpisodesList';

interface AdminDashboardPageProps {
  catalog: ContentItem[];
  reels: ReelItem[];
  onAddContent: (item: ContentItem) => void;
  onUpdateContent: (item: ContentItem) => void;
  onDeleteContent: (id: string) => void;
  onAddReel: (reel: ReelItem) => void;
  onDeleteReel: (id: string) => void;
  onToggleFeatured: (id: string) => void;
  onTogglePublish: (id: string) => void;
  onOpenPasscodeModal: () => void;
  onPlayContent: (item: ContentItem) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  catalog,
  reels,
  onAddContent,
  onUpdateContent,
  onDeleteContent,
  onAddReel,
  onDeleteReel,
  onToggleFeatured,
  onTogglePublish,
  onOpenPasscodeModal,
  onPlayContent,
}) => {
  const { adminPrivileges, logoutAdmin } = useAuth();
  const [adminTab, setAdminTab] = useState<'home' | 'anime' | 'movie' | 'series' | 'reels'>('home');

  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);

  // Upload / Edit form states
  const [formTitle, setFormTitle] = useState('');
  const [formAltTitle, setFormAltTitle] = useState('');
  const [formType, setFormType] = useState<ContentType>('movie');
  const [formPoster, setFormPoster] = useState('');
  const [formBanner, setFormBanner] = useState('');
  const [formStreamUrl, setFormStreamUrl] = useState('');
  const [formSynopsis, setFormSynopsis] = useState('');
  const [formDuration, setFormDuration] = useState('2h 15m');
  const [formAudios, setFormAudios] = useState<AudioLanguage[]>(['Telugu', 'Hindi', 'English']);
  const [formIsFeatured, setFormIsFeatured] = useState(false);

  // Reel Upload form state
  const [reelCaption, setReelCaption] = useState('');
  const [reelCreator, setReelCreator] = useState('Studio YEP');
  const [reelVideoUrl, setReelVideoUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
  const [reelAudioTitle, setReelAudioTitle] = useState('Original Background Score');

  // Episode management state
  const [managingEpisodesItem, setManagingEpisodesItem] = useState<ContentItem | null>(null);
  const [epTitle, setEpTitle] = useState('');
  const [epNumber, setEpNumber] = useState(1);
  const [epDuration, setEpDuration] = useState('24m');
  const [epUrl, setEpUrl] = useState('');

  const handleAddEpisode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingEpisodesItem) return;
    const newEp = {
      id: 'ep_' + Date.now(),
      episodeNumber: epNumber,
      title: epTitle || `Episode ${epNumber}`,
      synopsis: 'Episode uploaded via Secure Admin Studio.',
      duration: epDuration,
      durationSeconds: 1440,
      thumbnailUrl: managingEpisodesItem.posterUrl,
      streamUrl: epUrl || managingEpisodesItem.streamUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      availableAudios: ['Telugu', 'English', 'Hindi', 'Japanese'] as any[],
      availableSubtitles: ['English', 'Telugu'] as any[],
      releaseDate: new Date().toISOString(),
    };

    const updatedSeasons = managingEpisodesItem.seasons ? [...managingEpisodesItem.seasons] : [{ seasonNumber: 1, title: 'Season 1', episodes: [] }];
    updatedSeasons[0].episodes.push(newEp);

    const updatedItem: ContentItem = {
      ...managingEpisodesItem,
      seasons: updatedSeasons,
      duration: `${updatedSeasons[0].episodes.length} Eps`,
    };

    onUpdateContent(updatedItem);
    setManagingEpisodesItem(null);
    setEpTitle('');
    setEpNumber((prev) => prev + 1);
    setEpUrl('');
    alert(`Successfully added Episode ${newEp.episodeNumber} to "${managingEpisodesItem.title}"!`);
  };

  // If admin is NOT verified via passcode yet, show security gate
  if (!adminPrivileges.verified) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center text-white animate-fade-in">
        <div className="w-16 h-16 rounded-3xl bg-rose-600/20 border-2 border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center mb-4 shadow-xl">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black mb-2 tracking-tight">Admin Passcode Required</h2>
        <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
          Access to Home, Anime, Movie, Series, and Reels upload & management requires entering your authorized security passcode.
        </p>
        <button
          onClick={onOpenPasscodeModal}
          className="w-full py-3 bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Unlock className="w-4 h-4" />
          <span>Enter Admin Security Passcode</span>
        </button>
      </div>
    );
  }

  // Pre-fill form for fast, easy upload
  const fillPreset = (type: 'anime' | 'movie' | 'series' | 'reel') => {
    if (type === 'anime') {
      setFormTitle('Kitsune Blade: Rebirth');
      setFormAltTitle('狐の刃 (Kitsune no Yaiba)');
      setFormType('anime_series');
      setFormPoster('https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80');
      setFormBanner('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80');
      setFormStreamUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4');
      setFormSynopsis('A legendary swordsman blessed by fox spirits defends the Kyoto borders from eclipse shadows.');
      setFormDuration('Season 1 (12 eps)');
      setFormAudios(['Telugu', 'Hindi', 'Japanese', 'English']);
    } else if (type === 'movie') {
      setFormTitle('Rudradeva: The Fiery Chariot');
      setFormAltTitle('రుద్రదేవ: రథ సంగ్రామం');
      setFormType('movie');
      setFormPoster('https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&auto=format&fit=crop&q=80');
      setFormBanner('https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80');
      setFormStreamUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
      setFormSynopsis('An unstoppable ancient Deccan commander leads a chariot defense against conquering forces.');
      setFormDuration('2h 35m');
      setFormAudios(['Telugu', 'Hindi', 'Tamil', 'English']);
    } else if (type === 'series') {
      setFormTitle('Cyber Hyderabad 2049');
      setFormAltTitle('సైబర్ హైదరాబాద్');
      setFormType('series');
      setFormPoster('https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80');
      setFormBanner('https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1600&auto=format&fit=crop&q=80');
      setFormStreamUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4');
      setFormSynopsis('High-tech financial crime squad uncovers synthetic extortion rings in HITEC City.');
      setFormDuration('Season 1 (8 eps)');
      setFormAudios(['Telugu', 'Hindi', 'English']);
    } else if (type === 'reel') {
      setReelCaption('Behind the scenes Telugu dub recording session for the climax duel! 🔥🎙️');
      setReelCreator('Telugu Anime Dubs');
      setReelVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
      setReelAudioTitle('Studio Vocal Booth Live Sound');
    }
  };

  const handleOpenUpload = (tab: 'home' | 'anime' | 'movie' | 'series' | 'reels') => {
    setEditingItem(null);
    if (tab === 'anime') {
      fillPreset('anime');
    } else if (tab === 'movie') {
      fillPreset('movie');
    } else if (tab === 'series') {
      fillPreset('series');
    } else if (tab === 'reels') {
      fillPreset('reel');
    } else {
      fillPreset('movie');
    }
    setShowUploadModal(true);
  };

  const handleOpenEdit = (item: ContentItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormAltTitle(item.alternateTitle || '');
    setFormType(item.type);
    setFormPoster(item.posterUrl);
    setFormBanner(item.bannerUrl);
    setFormStreamUrl(item.streamUrl || item.hlsUrl || '');
    setFormSynopsis(item.synopsis);
    setFormDuration(item.duration);
    setFormAudios(item.audioLanguages);
    setFormIsFeatured(Boolean(item.isFeatured));
    setShowUploadModal(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminTab === 'reels') {
      const newReel: ReelItem = {
        id: `reel_${Date.now()}`,
        creatorId: 'admin-creator',
        creatorName: reelCreator,
        creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        creatorHandle: `@${reelCreator.toLowerCase().replace(/\s+/g, '_')}`,
        caption: reelCaption,
        hashtags: ['#yepstreamer', '#anime', '#telugu', '#cinema'],
        videoUrl: reelVideoUrl,
        likesCount: 120,
        commentsCount: 4,
        sharesCount: 15,
        audioTitle: reelAudioTitle,
        createdAt: new Date().toISOString(),
      };
      onAddReel(newReel);
      setShowUploadModal(false);
      alert('Vertical Reel uploaded successfully!');
      return;
    }

    if (editingItem) {
      const updated: ContentItem = {
        ...editingItem,
        title: formTitle,
        alternateTitle: formAltTitle,
        type: formType,
        posterUrl: formPoster,
        bannerUrl: formBanner,
        streamUrl: formStreamUrl,
        hlsUrl: formStreamUrl.endsWith('.m3u8') ? formStreamUrl : 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        synopsis: formSynopsis,
        duration: formDuration,
        audioLanguages: formAudios,
        isFeatured: formIsFeatured,
      };
      onUpdateContent(updated);
      setShowUploadModal(false);
      alert(`Updated "${formTitle}" successfully!`);
    } else {
      const newItem: ContentItem = {
        id: `content_${Date.now()}`,
        title: formTitle,
        alternateTitle: formAltTitle,
        type: formType,
        posterUrl: formPoster || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
        bannerUrl: formBanner || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
        synopsis: formSynopsis || 'New entertainment title added through Admin Portal.',
        releaseYear: new Date().getFullYear(),
        ageRating: 'U/A 16+',
        duration: formDuration,
        genres: ['Action', 'Fantasy'],
        audioLanguages: formAudios,
        subtitleLanguages: ['English', 'Telugu'],
        ratingScore: 9.2,
        viewsCount: 1,
        status: 'published',
        isFeatured: formIsFeatured,
        createdAt: new Date().toISOString(),
        streamUrl: formStreamUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        hlsUrl: formStreamUrl.endsWith('.m3u8') ? formStreamUrl : 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      };
      onAddContent(newItem);
      setShowUploadModal(false);
      alert(`Uploaded "${formTitle}" to catalog successfully!`);
    }
  };

  // Filter items by active admin tab
  const getTabItems = () => {
    switch (adminTab) {
      case 'home':
        return catalog.filter((i) => i.isFeatured);
      case 'anime':
        return catalog.filter((i) => i.type.startsWith('anime'));
      case 'movie':
        return catalog.filter((i) => i.type === 'movie' || i.type === 'anime_movie');
      case 'series':
        return catalog.filter((i) => i.type === 'series' || i.type === 'anime_series');
      default:
        return catalog;
    }
  };

  const currentItems = getTabItems();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 animate-fade-in text-white pb-24">
      {/* Top Admin Security Status Banner */}
      <div
        className={`p-4 rounded-3xl border mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl ${
          adminPrivileges.canDelete
            ? 'bg-gradient-to-r from-emerald-950/70 via-slate-900 to-amber-950/40 border-emerald-500/50'
            : 'bg-gradient-to-r from-violet-950/70 via-slate-900 to-cyan-950/40 border-cyan-500/50'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shadow-md ${
              adminPrivileges.canDelete
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
            }`}
          >
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-white">
                {adminPrivileges.levelName}
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
                  adminPrivileges.canDelete
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {adminPrivileges.canDelete ? 'Deletions: Unlocked' : 'Deletions: Restricted'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              {adminPrivileges.canDelete
                ? 'Authorized with Super Admin Passcode (Full Upload, Edit & Delete Permissions)'
                : 'Authorized with Manager Passcode (Upload & Edit Active — Delete actions protected)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={onOpenPasscodeModal}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors border border-slate-700"
          >
            Switch Passcode
          </button>
          <button
            onClick={logoutAdmin}
            className="px-3 py-1.5 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 text-xs font-semibold text-rose-300 transition-colors border border-rose-800/40"
          >
            Lock Admin
          </button>
        </div>
      </div>

      {/* Admin Sub-Tabs Navigation (Requested by user: Home, Anime, Movie, Series, Reels) */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6 gap-3 flex-wrap">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'home', label: 'Home (Featured)', icon: Tv, count: catalog.filter((i) => i.isFeatured).length },
            { id: 'anime', label: 'Anime Hub', icon: Sparkles, count: catalog.filter((i) => i.type.startsWith('anime')).length },
            { id: 'movie', label: 'Movies & Cinema', icon: Film, count: catalog.filter((i) => i.type === 'movie' || i.type === 'anime_movie').length },
            { id: 'series', label: 'Web Series', icon: Clapperboard, count: catalog.filter((i) => i.type === 'series' || i.type === 'anime_series').length },
            { id: 'reels', label: 'Reels (Vertical)', icon: Compass, count: reels.length },
          ].map((tab) => {
            const isActive = adminTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setAdminTab(tab.id as any)}
                className={`px-4 py-2 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-950/50'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isActive ? 'bg-slate-950 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Easy & Professional Upload Action Button */}
        <button
          onClick={() => handleOpenUpload(adminTab)}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-transform active:scale-95 cursor-pointer ml-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Upload New {adminTab.toUpperCase()}</span>
        </button>
      </div>

      {/* Main Tab Content Display */}
      {adminTab === 'reels' ? (
        /* Reels Management Table */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-cyan-400" />
              <span>Vertical Short Reels ({reels.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {reels.map((reel) => (
              <div
                key={reel.id}
                className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3"
              >
                <div className="relative h-48 rounded-xl overflow-hidden bg-slate-900">
                  <video
                    src={reel.videoUrl}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    playsInline
                    onMouseOver={(e) => (e.target as HTMLVideoElement).play().catch(() => {})}
                    onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-cyan-400">
                    {reel.creatorName}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
                    {reel.caption}
                  </p>
                  <div className="text-[11px] text-slate-400 font-mono mt-1">
                    ❤️ {reel.likesCount.toLocaleString()} likes · 💬 {reel.commentsCount} comments
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                  {/* Delete option ONLY shown if admin has Password 2 (canDelete === true) */}
                  {adminPrivileges.canDelete && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete vertical reel by "${reel.creatorName}"?`)) {
                          onDeleteReel(reel.id);
                        }
                      }}
                      className="p-1.5 text-rose-400 hover:text-white hover:bg-rose-950/50 rounded-lg transition-colors"
                      title="Delete reel (Super Admin)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Content Titles Table (Home / Anime / Movie / Series) */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-white">
              {adminTab === 'home'
                ? 'Featured Showcase Titles on Homepage'
                : adminTab === 'anime'
                ? 'Anime Series & Movies'
                : adminTab === 'movie'
                ? 'Cinema Feature Movies'
                : 'Web Series & Episodes'}
              {' '}({currentItems.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Title / Alternate Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Audio Dubs</th>
                  <th className="p-3">Featured</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {currentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.posterUrl}
                          alt={item.title}
                          className="w-10 h-14 rounded-lg object-cover bg-slate-950 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-white text-sm">{item.title}</div>
                          {item.alternateTitle && (
                            <div className="text-[10px] text-cyan-400 font-mono">
                              {item.alternateTitle}
                            </div>
                          )}
                          <div className="text-[10px] text-slate-400">
                            {item.duration} · ★ {item.ratingScore}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3 font-mono text-[11px] uppercase">
                      {item.type.replace('_', ' ')}
                    </td>

                    <td className="p-3">
                      <span className="text-slate-300 font-mono text-[11px]">
                        {item.audioLanguages.join(', ')}
                      </span>
                    </td>

                    <td className="p-3">
                      <button
                        onClick={() => onToggleFeatured(item.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          item.isFeatured ? 'text-amber-400 bg-amber-950/40' : 'text-slate-500 hover:text-white'
                        }`}
                        title="Toggle Featured on Homepage"
                      >
                        <Star className={`w-4 h-4 ${item.isFeatured ? 'fill-current' : ''}`} />
                      </button>
                    </td>

                    <td className="p-3">
                      <button
                        onClick={() => onTogglePublish(item.id)}
                        className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-bold transition-colors ${
                          item.status === 'published'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {item.status}
                      </button>
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onPlayContent(item)}
                          title="Preview Playback"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                        >
                          <Play className="w-4 h-4" />
                        </button>

                        {/* Edit Button (Allowed in both Password 1 and Password 2) */}
                        <button
                          onClick={() => handleOpenEdit(item)}
                          title="Edit Title"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Episode Manager Button (+) for Series and Anime Series */}
                        {(item.type === 'series' || item.type === 'anime_series') && (
                          <button
                            onClick={() => {
                              setManagingEpisodesItem(item);
                              const existingCount = item.seasons?.[0]?.episodes?.length || 0;
                              setEpNumber(existingCount + 1);
                            }}
                            title="Add / Manage Episodes (+)"
                            className="p-1.5 rounded-lg text-cyan-400 hover:text-white hover:bg-cyan-950/40 transition-colors"
                          >
                            <Plus className="w-4 h-4 stroke-[3]" />
                          </button>
                        )}

                        {/* Delete Button (STRICTLY rendered only for Super Admin password 9492335119) */}
                        {adminPrivileges.canDelete && (
                          <button
                            onClick={() => onDeleteContent(item.id)}
                            title="Delete Title (Super Admin)"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Super Easy & Professional Upload / Edit Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white select-none">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-cyan-400" />
                  <span>
                    {editingItem
                      ? `Edit "${editingItem.title}"`
                      : adminTab === 'reels'
                      ? 'Upload New Vertical Reel'
                      : `Upload New ${adminTab.toUpperCase()} Title`}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Easy and professional media ingestion with auto-dub and multi-bitrate support
                </p>
              </div>

              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Render robust MediaUploadForm for new uploads, or edit form when editing */}
            {!editingItem ? (
              <MediaUploadForm
                onContentAdded={(item) => {
                  onAddContent(item);
                  setShowUploadModal(false);
                }}
                onReelAdded={(reel) => {
                  onAddReel(reel);
                  setShowUploadModal(false);
                }}
                onClose={() => setShowUploadModal(false)}
              />
            ) : (
              <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
              {adminTab === 'reels' ? (
                /* Reel Form Fields */
                <>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Creator / Channel Name</label>
                    <input
                      type="text"
                      value={reelCreator}
                      onChange={(e) => setReelCreator(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Reel Caption</label>
                    <textarea
                      rows={3}
                      value={reelCaption}
                      onChange={(e) => setReelCaption(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Vertical Video URL</label>
                    <input
                      type="url"
                      value={reelVideoUrl}
                      onChange={(e) => setReelVideoUrl(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Audio Track Title</label>
                    <input
                      type="text"
                      value={reelAudioTitle}
                      onChange={(e) => setReelAudioTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                    />
                  </div>
                </>
              ) : (
                /* Content Title Form Fields */
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Title *</label>
                      <input
                        type="text"
                        placeholder="e.g. Shadowblade: Episode 5"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">
                        Alternate Name (Telugu / Romaji)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. దక్కన్ యోధులు / Kage Yaiba"
                        value={formAltTitle}
                        onChange={(e) => setFormAltTitle(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Category Type</label>
                      <select
                        value={formType}
                        onChange={(e) => setFormType(e.target.value as ContentType)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                      >
                        <option value="anime_series">Anime Series</option>
                        <option value="anime_movie">Anime Feature Movie</option>
                        <option value="movie">Feature Film</option>
                        <option value="series">Web Series / TV Drama</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Duration / Episodes</label>
                      <input
                        type="text"
                        placeholder="e.g. 2h 25m or Season 1 (12 eps)"
                        value={formDuration}
                        onChange={(e) => setFormDuration(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Synopsis / Storyline</label>
                    <textarea
                      rows={3}
                      value={formSynopsis}
                      onChange={(e) => setFormSynopsis(e.target.value)}
                      placeholder="Brief synopsis of the title..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1.5">
                      Included Audio Dub Tracks
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(['Telugu', 'Hindi', 'Japanese', 'English', 'Tamil'] as AudioLanguage[]).map((lang) => {
                        const isSelected = formAudios.includes(lang);
                        return (
                          <button
                            type="button"
                            key={lang}
                            onClick={() =>
                              setFormAudios((prev) =>
                                isSelected ? prev.filter((l) => l !== lang) : [...prev, lang]
                              )
                            }
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                              isSelected
                                ? 'bg-cyan-500 text-slate-950 font-bold'
                                : 'bg-slate-950 text-slate-400 border border-slate-800'
                            }`}
                          >
                            {lang} {lang === 'Telugu' ? '(Primary)' : ''}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-slate-300 text-xs">Poster Artwork URL</label>
                        <label className="text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer font-semibold flex items-center gap-1 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-lg transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = URL.createObjectURL(file);
                                setFormPoster(url);
                              }
                            }}
                          />
                          📁 Gallery Poster
                        </label>
                      </div>
                      <input
                        type="url"
                        value={formPoster}
                        onChange={(e) => setFormPoster(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-slate-300 text-xs">Video Stream URL</label>
                        <label className="text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer font-semibold flex items-center gap-1 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-lg transition-colors">
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = URL.createObjectURL(file);
                                setFormStreamUrl(url);
                              }
                            }}
                          />
                          📁 Gallery Video
                        </label>
                      </div>
                      <input
                        type="url"
                        value={formStreamUrl}
                        onChange={(e) => setFormStreamUrl(e.target.value)}
                        placeholder="https://...mp4 or .m3u8"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  <div className="pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formIsFeatured}
                        onChange={(e) => setFormIsFeatured(e.target.checked)}
                        className="w-4 h-4 accent-cyan-500 rounded"
                      />
                      <span className="font-semibold text-slate-200">
                        Showcase on Homepage Hero Carousel (Featured)
                      </span>
                    </label>
                  </div>
                </>
              )}

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer"
                >
                  {editingItem ? 'Save Changes' : 'Publish Title'}
                </button>
              </div>
            </form>
            )}
          </div>
        </div>
      )}

      {/* Episode Management Modal via EpisodesList Component */}
      {managingEpisodesItem && (
        <EpisodesList
          item={managingEpisodesItem}
          onUpdateItem={(updated) => {
            onUpdateContent(updated);
            setManagingEpisodesItem(updated);
          }}
          onClose={() => setManagingEpisodesItem(null)}
        />
      )}
    </div>
  );
};
