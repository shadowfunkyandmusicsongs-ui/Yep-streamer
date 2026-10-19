import React, { useState } from 'react';
import {
  Search,
  Bookmark,
  Tv,
  Film,
  Sparkles,
  Clapperboard,
  ShieldAlert,
  Palette,
  Globe,
  LogIn,
  LogOut,
  Menu,
  X,
  Compass,
  Check,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { UserRole, ThemeMode, AppLanguage } from '../../types';

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}
export const Header: React.FC<HeaderProps> = ({ currentTab, onNavigate }) => {
  const {
    user,
    role,
    setUserRole,
    login,
    logout,
    setShowSetupModal,
    adminPrivileges,
    setShowAdminPasscodeModal,
    setShowProfileModal,
  } = useAuth();
  const { theme, setTheme, language, setLanguage, t } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const navItems = [
    { id: 'home', label: t('nav.home'), icon: Tv },
    { id: 'anime', label: t('nav.anime'), icon: Sparkles },
    { id: 'movies', label: t('nav.movies'), icon: Film },
    { id: 'series', label: t('nav.series'), icon: Clapperboard },
    { id: 'reels', label: t('nav.reels'), icon: Compass },
    { id: 'discover', label: t('nav.discover'), icon: Compass },
  ];

  const themesList: { id: ThemeMode; label: string; dot: string }[] = [
    { id: 'cinematic-dark', label: 'Cinematic Dark', dot: 'bg-cyan-500' },
    { id: 'midnight-cinema', label: 'Midnight Cinema', dot: 'bg-rose-500' },
    { id: 'neon-anime', label: 'Neon Anime', dot: 'bg-fuchsia-500' },
    { id: 'minimal-studio', label: 'Minimal Studio', dot: 'bg-slate-400' },
    { id: 'light-mode', label: 'Light Mode', dot: 'bg-sky-600' },
  ];

  const languagesList: { id: AppLanguage; label: string; local: string }[] = [
    { id: 'en', label: 'English', local: 'EN' },
    { id: 'te', label: 'తెలుగు', local: 'TE' },
    { id: 'hi', label: 'हिन्दी', local: 'HI' },
    { id: 'ja', label: '日本語', local: 'JA' },
  ];

  const rolesList: { id: UserRole; label: string; desc: string }[] = [
    { id: 'viewer', label: 'Viewer', desc: 'Watch & Explore' },
    { id: 'creator', label: 'Creator', desc: 'Member' },
    { id: 'content_manager', label: 'Content Manager', desc: 'Catalog & Moderation' },
    { id: 'admin', label: 'Administrator', desc: 'Full System Control' },
  ];

  const canAccessAdmin = role === 'content_manager' || role === 'admin';

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-white/10 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 group text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <span className="font-black text-black text-sm tracking-tighter">YEP</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-wider bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                YEP STREAMER
              </span>
              <span className="text-[9px] font-mono text-cyan-400 tracking-widest uppercase">
                Anime · Cinema · Reels
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    active
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Actions Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Universal Search Button */}
          <button
            onClick={() => onNavigate('search')}
            aria-label="Search catalog with Gemini AI"
            className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              currentTab === 'search'
                ? 'bg-cyan-500 text-slate-950 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Search className="w-4 h-4" />
            <span className="hidden md:inline text-xs font-medium">Search & AI</span>
          </button>

          {/* Watchlist */}
          <button
            onClick={() => onNavigate('watchlist')}
            aria-label="My Watchlist"
            className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              currentTab === 'watchlist'
                ? 'bg-cyan-500 text-slate-950 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span className="hidden md:inline text-xs font-medium">{t('nav.watchlist')}</span>
          </button>



          {/* Admin Dashboard Shortcut */}
          <button
            onClick={() => {
              if (adminPrivileges.verified) {
                onNavigate('admin-dashboard');
              } else {
                setShowAdminPasscodeModal(true);
              }
            }}
            aria-label="Admin Security Portal"
            className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              currentTab === 'admin-dashboard'
                ? 'bg-rose-600 text-white font-semibold'
                : 'text-rose-400 hover:text-rose-300 hover:bg-rose-950/40'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span className="hidden md:inline text-xs font-semibold">
              {adminPrivileges.verified ? 'Admin Workspace' : 'Admin PIN'}
            </span>
          </button>

          {/* Role Switcher (Crucial for testing Viewer vs Creator vs Admin workflows) */}
          <div className="relative">
            <button
              onClick={() => {
                setRoleDropdownOpen(!roleDropdownOpen);
                setThemeDropdownOpen(false);
                setLangDropdownOpen(false);
              }}
              title="Switch user role for testing"
              className="px-2 py-1 rounded bg-slate-900 border border-slate-700 hover:border-cyan-500 text-[11px] font-mono text-cyan-400 flex items-center gap-1 uppercase"
            >
              <span>{role.replace('_', ' ')}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl p-1.5 shadow-2xl z-50 text-xs">
                <div className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-800">
                  Switch Role (RBAC)
                </div>
                {rolesList.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setUserRole(r.id);
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between ${
                      role === r.id ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{r.label}</div>
                      <div className="text-[10px] text-slate-400">{r.desc}</div>
                    </div>
                    {role === r.id && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setThemeDropdownOpen(!themeDropdownOpen);
                setLangDropdownOpen(false);
                setRoleDropdownOpen(false);
              }}
              title="Change Appearance Theme"
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Palette className="w-4 h-4" />
            </button>

            {themeDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-slate-900 border border-slate-700 rounded-xl p-1.5 shadow-2xl z-50 text-xs">
                <div className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-800">
                  Select Theme
                </div>
                {themesList.map((tItem) => (
                  <button
                    key={tItem.id}
                    onClick={() => {
                      setTheme(tItem.id);
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between ${
                      theme === tItem.id ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${tItem.dot}`} />
                      <span>{tItem.label}</span>
                    </div>
                    {theme === tItem.id && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Language Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setLangDropdownOpen(!langDropdownOpen);
                setThemeDropdownOpen(false);
                setRoleDropdownOpen(false);
              }}
              title="Change UI Language"
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1 text-xs font-mono"
            >
              <Globe className="w-4 h-4" />
              <span>{language.toUpperCase()}</span>
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-slate-900 border border-slate-700 rounded-xl p-1.5 shadow-2xl z-50 text-xs">
                <div className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-800">
                  UI Language
                </div>
                {languagesList.map((lItem) => (
                  <button
                    key={lItem.id}
                    onClick={() => {
                      setLanguage(lItem.id);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between ${
                      language === lItem.id ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <span>{lItem.label}</span>
                    {language === lItem.id && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile / Login */}
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowProfileModal(true)}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-cyan-400 transition-all cursor-pointer"
                title={`${user.displayName} (Open Profile Options)`}
              >
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full object-cover border border-cyan-400"
                />
              </button>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors hidden sm:block"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={login}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-950/40 transition-transform active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Google Sign-In</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-300 hover:text-white lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950 px-4 py-4 space-y-2 animate-fade-in">
          {navItems.map((item) => {
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                  active ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => {
                onNavigate('settings');
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 rounded bg-slate-900 text-slate-300 hover:text-white text-center"
            >
              Settings & Firebase
            </button>
            <button
              onClick={() => {
                onNavigate('help');
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 rounded bg-slate-900 text-slate-300 hover:text-white text-center"
            >
              Help & Support
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
