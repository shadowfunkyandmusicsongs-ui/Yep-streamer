import React from 'react';
import {
  Tv,
  Sparkles,
  Film,
  Clapperboard,
  Compass,
  Search,
  Bookmark,
  User,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWatchlist } from '../../context/WatchlistContext';

interface MobileBottomNavProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenProfile: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onNavigate,
  onOpenProfile,
}) => {
  const { user } = useAuth();
  const { watchlist } = useWatchlist();

  const navItems = [
    { id: 'home', label: 'Home', icon: Tv },
    { id: 'anime', label: 'Anime', icon: Sparkles },
    { id: 'movies', label: 'Movies', icon: Film },
    { id: 'series', label: 'Series', icon: Clapperboard },
    { id: 'reels', label: 'Reels', icon: Compass },
    { id: 'discover', label: 'Discover', icon: Layers },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'watchlist', label: 'Watchlist', icon: Bookmark, badge: watchlist.length },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-white/10 select-none pb-safe"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center overflow-x-auto no-scrollbar px-2 py-1.5 gap-1">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center min-w-[56px] py-1 px-1 rounded-xl transition-all shrink-0 ${
                isActive
                  ? 'text-cyan-400 font-bold bg-cyan-950/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 rounded-full bg-cyan-500 text-slate-950 text-[9px] font-mono font-bold leading-tight">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Profile Button in Mobile Navigation */}
        <button
          onClick={onOpenProfile}
          className="flex flex-col items-center justify-center min-w-[56px] py-1 px-1 rounded-xl text-slate-400 hover:text-slate-200 shrink-0"
        >
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Profile"
              className="w-4 h-4 rounded-full object-cover border border-cyan-400"
            />
          ) : (
            <User className="w-4 h-4 stroke-[1.75]" />
          )}
          <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap font-medium text-slate-300">
            Profile
          </span>
        </button>
      </div>
    </nav>
  );
};
