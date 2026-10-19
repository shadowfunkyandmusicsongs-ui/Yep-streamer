import React from 'react';
import { Tv, ShieldCheck, Heart, Sparkles, Terminal } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-slate-950 border-t border-white/10 mt-16 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center">
                <span className="font-black text-black text-xs">YEP</span>
              </div>
              <span className="text-sm font-bold tracking-wider text-white">YEP STREAMER</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Original entertainment destination delivering high-definition Anime series, cinematic movies, Telugu & Hindi audio dubs, vertical reels, and Gemini AI entertainment discovery.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-cyan-400 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Adaptive HLS · Enterprise RBAC</span>
            </div>
          </div>

          {/* Catalog Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Explore Content
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('anime')} className="hover:text-cyan-400 transition-colors">
                  Trending Anime Series
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('movies')} className="hover:text-cyan-400 transition-colors">
                  Feature Movies & Epics
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('series')} className="hover:text-cyan-400 transition-colors">
                  Web Series & Seasons
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('reels')} className="hover:text-cyan-400 transition-colors">
                  Vertical Creator Reels
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('discover')} className="hover:text-cyan-400 transition-colors">
                  Telugu & Hindi Dubs Hub
                </button>
              </li>
            </ul>
          </div>

          {/* Platform & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Platform & Features
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('admin-dashboard')} className="hover:text-cyan-400 transition-colors">
                  Admin Security Portal
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('watchlist')} className="hover:text-cyan-400 transition-colors">
                  Watchlist & History
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('settings')} className="hover:text-cyan-400 transition-colors">
                  Theme & Firebase Settings
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('help')} className="hover:text-cyan-400 transition-colors">
                  Help Center & FAQs
                </button>
              </li>
            </ul>
          </div>

          {/* Architecture & Compliance */}
          <div className="space-y-2 text-[11px] leading-relaxed">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-2">
              Streaming Architecture
            </h4>
            <p>
              Media pipeline supports HLS master playlists, automated 1080p/720p/480p packaging, and server-side token identity verification.
            </p>
            <p className="text-slate-500">
              Demo showcase assets courtesy of Blender Open Projects (CC-BY 3.0). Real creator uploads are isolated in private object storage.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} YEP Streamer Platform. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('help')} className="hover:text-slate-300">
              DMCA & Copyright Policy
            </button>
            <span>·</span>
            <button onClick={() => onNavigate('settings')} className="hover:text-slate-300">
              Privacy & Data Export
            </button>
            <span>·</span>
            <span className="text-cyan-400/80 font-mono">v2.4 Production Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
