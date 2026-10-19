import React from 'react';
import {
  X,
  User,
  Shield,
  Lock,
  Bookmark,
  Clock,
  Palette,
  Volume2,
  LogOut,
  ChevronRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useWatchlist } from '../../context/WatchlistContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdminPasscode: () => void;
  onNavigate: (tab: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenAdminPasscode,
  onNavigate,
}) => {
  const { user, role, logout, adminPrivileges } = useAuth();
  const { theme, setTheme } = useTheme();
  const { watchlist, watchProgress } = useWatchlist();

  if (!isOpen) return null;

  const watchedCount = Object.keys(watchProgress).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-white select-none">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Card Header */}
        <div className="flex items-center gap-4 border-b border-slate-800 pb-5 mb-5">
          <div className="relative">
            <img
              src={user?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}
              alt={user?.displayName || 'User'}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-400 shadow-lg"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px]">
              ✓
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-extrabold text-white truncate">
              {user?.displayName || 'Shadow Member'}
            </h3>
            <p className="text-xs text-slate-400 truncate font-mono">
              {user?.email || 'user@yepstreamer.com'}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {role.replace('_', ' ')}
              </span>
              {adminPrivileges.verified && (
                <span className="px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {adminPrivileges.canDelete ? 'Super Admin' : 'Manager'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            onClick={() => {
              onClose();
              onNavigate('watchlist');
            }}
            className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 text-left transition-colors"
          >
            <div className="flex items-center gap-2 text-cyan-400 text-xs mb-1">
              <Bookmark className="w-3.5 h-3.5" />
              <span>Watchlist</span>
            </div>
            <div className="text-lg font-black text-white">{watchlist.length} Titles</div>
          </button>

          <button
            onClick={() => {
              onClose();
              onNavigate('watchlist');
            }}
            className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 text-left transition-colors"
          >
            <div className="flex items-center gap-2 text-amber-400 text-xs mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Watched History</span>
            </div>
            <div className="text-lg font-black text-white">{watchedCount} Completed</div>
          </button>
        </div>

        {/* Profile Options List */}
        <div className="space-y-2 mb-6">
          {/* ADMIN PORTAL OPTION (Requested by user) */}
          <button
            onClick={() => {
              onClose();
              onOpenAdminPasscode();
            }}
            className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/60 via-slate-900 to-amber-950/40 hover:from-rose-900/80 hover:to-amber-900/60 border border-rose-500/40 hover:border-rose-400 text-left flex items-center justify-between transition-all shadow-lg group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-600/30 border border-rose-500/50 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <span>Admin Security Portal</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    PIN Required
                  </span>
                </div>
                <div className="text-[11px] text-slate-300">
                  Manage Home, Anime, Movie, Series & Reels upload/edit
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Settings & Firebase */}
          <button
            onClick={() => {
              onClose();
              onNavigate('settings');
            }}
            className="w-full p-3 rounded-2xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 text-left flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-3">
              <Palette className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold text-slate-200">
                Appearance Themes & Audio Dub Preferences
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          {/* Help & Support */}
          <button
            onClick={() => {
              onClose();
              onNavigate('help');
            }}
            className="w-full p-3 rounded-2xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 text-left flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-200">
                Help & DMCA Copyright Support
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Sign out */}
        <button
          onClick={() => {
            logout();
            onClose();
          }}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/50 hover:text-rose-300 border border-slate-700 hover:border-rose-800/50 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out Session</span>
        </button>
      </div>
    </div>
  );
};
