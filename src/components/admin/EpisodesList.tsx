import React, { useState, useRef } from 'react';
import {
  Film,
  Plus,
  Trash2,
  X,
  Upload,
  CheckCircle2,
  FolderOpen,
  Play,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ContentItem, Episode, Season } from '../../types';
import { storeVideoBlobToCategoryServer } from '../../services/videoStorage';
import { storage, isFirebaseConfigured } from '../../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface EpisodesListProps {
  item: ContentItem;
  onUpdateItem: (updated: ContentItem) => void;
  onClose: () => void;
}

export const EpisodesList: React.FC<EpisodesListProps> = ({
  item,
  onUpdateItem,
  onClose,
}) => {
  const seasons: Season[] = item.seasons && item.seasons.length > 0
    ? item.seasons
    : [{ seasonNumber: 1, title: 'Season 1', episodes: [] }];

  const [currentSeasons, setCurrentSeasons] = useState<Season[]>(seasons);
  const episodes = currentSeasons[0]?.episodes || [];

  const [epTitle, setEpTitle] = useState('');
  const [epNumber, setEpNumber] = useState(episodes.length + 1);
  const [epDuration, setEpDuration] = useState('24m');
  const [epUrl, setEpUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    if (!epTitle) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setEpTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
  };

  const handleAddEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!epTitle) return;

    setIsUploading(true);
    setUploadProgress(20);

    let finalUrl = epUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4';

    try {
      const newEpId = 'ep_' + Date.now();
      if (selectedFile) {
        setUploadProgress(50);
        const categoryKey = item.type.includes('anime') ? 'anime' : 'series';
        
        try {
          const storedBlobUrl = await storeVideoBlobToCategoryServer(categoryKey, {
            id: newEpId,
            name: selectedFile.name,
            type: selectedFile.type || 'video/mp4',
            originalSize: selectedFile.size,
            compressedSize: selectedFile.size * 0.05,
            durationSeconds: 1440,
            blob: selectedFile,
            thumbnailUrl: item.posterUrl,
          });
          finalUrl = storedBlobUrl;
        } catch {
          finalUrl = URL.createObjectURL(selectedFile);
        }

        if (isFirebaseConfigured && storage) {
          try {
            setUploadProgress(80);
            const sanitized = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            const sRef = ref(storage, `series_episodes/${item.id}_ep_${epNumber}_${Date.now()}_${sanitized}`);
            await uploadBytes(sRef, selectedFile);
            const cloudUrl = await getDownloadURL(sRef);
            if (cloudUrl) finalUrl = cloudUrl;
          } catch (err) {
            console.warn('Firebase episode cloud upload notice:', err);
          }
        }
      }

      setUploadProgress(100);

      const newEp: Episode = {
        id: newEpId,
        episodeNumber: epNumber,
        title: epTitle,
        synopsis: `Episode ${epNumber} of ${item.title}`,
        duration: epDuration,
        durationSeconds: 1440,
        thumbnailUrl: item.posterUrl,
        streamUrl: finalUrl,
        availableAudios: ['Telugu', 'Hindi', 'English', 'Japanese'],
        availableSubtitles: ['Telugu', 'English'],
        releaseDate: new Date().toISOString().split('T')[0],
      };

      const updatedEpisodes = [...episodes, newEp].sort((a, b) => a.episodeNumber - b.episodeNumber);
      const updatedSeasons: Season[] = [
        {
          ...currentSeasons[0],
          episodes: updatedEpisodes,
        },
        ...currentSeasons.slice(1),
      ];

      setCurrentSeasons(updatedSeasons);

      const updatedItem: ContentItem = {
        ...item,
        seasons: updatedSeasons,
      };

      onUpdateItem(updatedItem);

      // Reset form
      setEpTitle('');
      setEpNumber(updatedEpisodes.length + 1);
      setSelectedFile(null);
      setEpUrl('');
      setIsUploading(false);
      setUploadProgress(0);
    } catch (err) {
      console.error(err);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteEpisode = (id: string) => {
    const updatedEpisodes = episodes.filter((ep) => ep.id !== id);
    const updatedSeasons: Season[] = [
      {
        ...currentSeasons[0],
        episodes: updatedEpisodes,
      },
      ...currentSeasons.slice(1),
    ];

    setCurrentSeasons(updatedSeasons);
    const updatedItem: ContentItem = {
      ...item,
      seasons: updatedSeasons,
    };
    onUpdateItem(updatedItem);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                Episodes Manager: {item.title}
              </h3>
              <p className="text-xs text-slate-400">
                Manage series episodes, upload video files from gallery, or map streaming links
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Add Episode Form */}
          <form onSubmit={handleAddEpisode} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-inner">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Add New Episode
              </h4>
              <span className="text-[10px] font-mono bg-slate-900 text-slate-400 px-2.5 py-1 rounded-full border border-slate-800">
                Server Shard: {item.type.includes('anime') ? 'ANIME-SHARD-01' : 'SERIES-STORAGE-03'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Episode #</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={epNumber}
                  onChange={(e) => setEpNumber(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Episode Title</label>
                <input
                  type="text"
                  required
                  value={epTitle}
                  onChange={(e) => setEpTitle(e.target.value)}
                  placeholder="e.g. Episode 1: Awakening"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Duration</label>
                <input
                  type="text"
                  value={epDuration}
                  onChange={(e) => setEpDuration(e.target.value)}
                  placeholder="24m"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Or Stream URL</label>
                <input
                  type="url"
                  value={epUrl}
                  onChange={(e) => setEpUrl(e.target.value)}
                  placeholder="https://...mp4"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Gallery Upload Box */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-300 uppercase">Gallery Video File Upload (Optional)</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-800 hover:border-cyan-500/60 rounded-xl p-3 text-center cursor-pointer bg-slate-900/50 hover:bg-slate-900 transition-colors flex items-center justify-center gap-3"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <FolderOpen className="w-5 h-5 text-cyan-400" />
                <span className="text-xs font-semibold text-slate-300">
                  {selectedFile ? selectedFile.name : 'Click to select video file from gallery (10s–30s turbo)'}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Uploading & Compressing ({uploadProgress}%)...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Save Episode to Series</span>
                </>
              )}
            </button>
          </form>

          {/* Existing Episodes List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Existing Episodes ({episodes.length})
            </h4>

            {episodes.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs bg-slate-950/30 rounded-2xl border border-slate-800/50">
                No episodes added yet. Use the form above to add episodes.
              </div>
            ) : (
              <div className="space-y-2">
                {episodes.map((ep) => (
                  <div
                    key={ep.id}
                    className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono text-xs font-bold">
                        E{ep.episodeNumber}
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-white">{ep.title}</h5>
                        <p className="text-[11px] text-slate-400 font-mono">
                          Duration: {ep.duration} • Stream: {ep.streamUrl.substring(0, 35)}...
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={ep.streamUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Play Episode"
                      >
                        <Play className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDeleteEpisode(ep.id)}
                        className="p-2 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/60 transition-colors"
                        title="Delete Episode"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
