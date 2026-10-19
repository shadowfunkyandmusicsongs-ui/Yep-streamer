import React, { useState } from 'react';
import {
  Palette,
  Volume2,
  Subtitles,
  Shield,
  Download,
  Trash2,
  Check,
  Sparkles,
  Info,
  Server,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { ThemeMode, AudioLanguage, SubtitleLanguage } from '../types';

interface SettingsPageProps {
  onOpenFirebaseSetup: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onOpenFirebaseSetup }) => {
  const { theme, setTheme, language, setLanguage, reducedMotion, setReducedMotion } = useTheme();
  const { user, isFirebaseLive } = useAuth();

  const [defaultAudio, setDefaultAudio] = useState<AudioLanguage>('Telugu');
  const [defaultSubtitle, setDefaultSubtitle] = useState<SubtitleLanguage | 'off'>('English');
  const [savedNotification, setSavedNotification] = useState(false);

  const themeOptions: { id: ThemeMode; name: string; desc: string; previewColors: string[] }[] = [
    {
      id: 'cinematic-dark',
      name: 'Cinematic Dark (Default)',
      desc: 'Deep slate backdrop with vibrant cyan accents, modeled for high contrast streaming.',
      previewColors: ['#030712', '#06b6d4', '#1e293b'],
    },
    {
      id: 'midnight-cinema',
      name: 'Midnight Cinema',
      desc: 'Obsidian black with velvet crimson accents, tailored for movie nights.',
      previewColors: ['#050508', '#e11d48', '#1f131a'],
    },
    {
      id: 'neon-anime',
      name: 'Neon Anime',
      desc: 'Cyberpunk inspired midnight canvas with electric magenta and neon teal accents.',
      previewColors: ['#090914', '#ec4899', '#14b8a6'],
    },
    {
      id: 'minimal-studio',
      name: 'Minimal Studio',
      desc: 'Restrained graphite grey palette with titanium monochrome highlights.',
      previewColors: ['#111215', '#94a3b8', '#1e2025'],
    },
    {
      id: 'light-mode',
      name: 'Light Mode',
      desc: 'High clarity day-view palette for bright ambient lighting conditions.',
      previewColors: ['#f8fafc', '#0284c7', '#e2e8f0'],
    },
  ];

  const handleExportData = () => {
    const data = {
      profile: user,
      theme,
      language,
      defaultAudio,
      defaultSubtitle,
      watchlist: localStorage.getItem('yep_watchlist'),
      watchProgress: localStorage.getItem('yep_watch_progress'),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yep_streamer_userdata_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearCache = () => {
    if (confirm('Clear local watch history and preferences?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 animate-fade-in text-white">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Customize your streaming appearance, audio dub defaults, accessibility, and cloud integrations.
        </p>
      </div>

      <div className="space-y-8">
        {/* Appearance Themes Section */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold">Streaming Themes (5 Variants)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {themeOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id)}
                className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between ${
                  theme === opt.id
                    ? 'bg-slate-950 border-cyan-400 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-400'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-xs text-white flex items-center gap-2">
                    {opt.name}
                    {theme === opt.id && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </span>
                  <div className="flex items-center gap-1">
                    {opt.previewColors.map((color, idx) => (
                      <span
                        key={idx}
                        className="w-3 h-3 rounded-full border border-white/20"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{opt.desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Audio Dub & Subtitles Preferences */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Volume2 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold">Audio & Subtitle Preferences</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-2">
                Default Audio Dub Language
              </label>
              <select
                value={defaultAudio}
                onChange={(e) => setDefaultAudio(e.target.value as AudioLanguage)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-cyan-500"
              >
                <option value="Telugu">Telugu Dub (Recommended)</option>
                <option value="Hindi">Hindi Dub</option>
                <option value="Japanese">Japanese (Original)</option>
                <option value="English">English Audio</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Player will automatically favor this language track when available.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-2">
                Default Subtitles / CC
              </label>
              <select
                value={defaultSubtitle}
                onChange={(e) => setDefaultSubtitle(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-cyan-500"
              >
                <option value="English">English Subtitles</option>
                <option value="Telugu">Telugu Subtitles</option>
                <option value="Hindi">Hindi Subtitles</option>
                <option value="off">Turn Off by Default</option>
              </select>
            </div>
          </div>
        </section>

        {/* Accessibility & Motion */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-base font-bold mb-3">Accessibility & Motion</h2>
          <label className="flex items-center gap-3 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
              className="accent-cyan-500 w-4 h-4"
            />
            <span>
              <strong>Reduce Motion</strong>: Minimizes background video scale transforms and carousel transitions.
            </span>
          </label>
        </section>

        {/* Firebase & Cloud Integrations Guide */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold">Firebase & Backend Integration</h2>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                isFirebaseLive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
              }`}
            >
              {isFirebaseLive ? 'Live Firebase' : 'Controlled Sandbox'}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            YEP Streamer is wired for Firebase Authentication (Google sign-in), Cloud Firestore (catalog, watchlists, audit logs), and Cloud Storage (HLS manifests & chunks).
          </p>

          <button
            onClick={onOpenFirebaseSetup}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Open Firebase Console Setup Guide</span>
          </button>
        </section>

        {/* Data Management & Privacy */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-base font-bold mb-3">Data Management & Privacy</h2>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <button
              onClick={handleExportData}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl flex items-center gap-2 border border-slate-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export My Watch Data (JSON)</span>
            </button>

            <button
              onClick={handleClearCache}
              className="px-4 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-xl flex items-center gap-2 border border-rose-800/40 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Reset Local Cache</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
