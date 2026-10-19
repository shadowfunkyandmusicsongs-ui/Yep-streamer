import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeMode, AppLanguage } from '../types';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  reducedMotion: boolean;
  setReducedMotion: (reduced: boolean) => void;
  t: (key: string) => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Core UI translations for English, Telugu, Hindi, and Japanese
const TRANSLATIONS: Record<AppLanguage, Record<string, string>> = {
  en: {
    'nav.home': 'Home',
    'nav.anime': 'Anime',
    'nav.movies': 'Movies',
    'nav.series': 'Series',
    'nav.reels': 'Reels',
    'nav.discover': 'Discover',
    'nav.search': 'Search',
    'nav.watchlist': 'Watchlist',
    'nav.history': 'Watch History',
    'nav.studio': 'Creator Studio',
    'nav.admin': 'Admin Dashboard',
    'nav.settings': 'Settings',
    'nav.help': 'Help & Support',
    'btn.watch_now': 'Watch Now',
    'btn.more_info': 'More Info',
    'btn.resume': 'Resume',
    'btn.add_watchlist': 'Watchlist',
    'btn.added_watchlist': 'In Watchlist',
    'shelf.trending_anime': 'Trending Anime',
    'shelf.popular_movies': 'Popular Movies',
    'shelf.continue_watching': 'Continue Watching',
    'shelf.recommended': 'Recommended for You',
    'shelf.telugu_dubbed': 'Telugu Dubbed Exclusives',
    'shelf.hindi_dubbed': 'Hindi Dubbed Hits',
    'shelf.japanese_audio': 'Japanese Original Audio',
    'shelf.popular_reels': 'Popular Vertical Reels',
  },
  te: {
    'nav.home': 'హోమ్',
    'nav.anime': 'యానిమే',
    'nav.movies': 'సినిమాలు',
    'nav.series': 'వెబ్ సిరీస్',
    'nav.reels': 'రీల్స్',
    'nav.discover': 'అన్వేషించండి',
    'nav.search': 'వెతకండి',
    'nav.watchlist': 'వాచ్‌లిస్ట్',
    'nav.history': 'చూసిన చరిత్ర',
    'nav.studio': 'క్రియేటర్ స్టూడియో',
    'nav.admin': 'అడ్మిన్ డ్యాష్‌బోర్డ్',
    'nav.settings': 'సెట్టింగులు',
    'nav.help': 'సహాయం & మద్దతు',
    'btn.watch_now': 'ఇప్పుడే చూడండి',
    'btn.more_info': 'మరిన్ని వివరాలు',
    'btn.resume': 'కొనసాగించండి',
    'btn.add_watchlist': 'వాచ్‌లిస్ట్',
    'btn.added_watchlist': 'జాబితాలో ఉంది',
    'shelf.trending_anime': 'ట్రెండింగ్ యానిమే',
    'shelf.popular_movies': 'ప్రముఖ సినిమాలు',
    'shelf.continue_watching': 'కొనసాగించండి',
    'shelf.recommended': 'మీ కోసం సిఫార్సు చేయబడినవి',
    'shelf.telugu_dubbed': 'తెలుగు డబ్బింగ్ ప్రత్యేకతలు',
    'shelf.hindi_dubbed': 'హిందీ డబ్బింగ్ సినిమాలు',
    'shelf.japanese_audio': 'జపనీస్ ఒరిజినల్ ఆడియో',
    'shelf.popular_reels': 'ప్రముఖ రీల్స్',
  },
  hi: {
    'nav.home': 'होम',
    'nav.anime': 'एनीमे',
    'nav.movies': 'फिल्में',
    'nav.series': 'वेब सीरीज़',
    'nav.reels': 'रील्स',
    'nav.discover': 'खोजें',
    'nav.search': 'सर्च',
    'nav.watchlist': 'वॉचलिस्ट',
    'nav.history': 'देखी गई हिस्ट्री',
    'nav.studio': 'क्रिएटर स्टूडियो',
    'nav.admin': 'एडमिन डैशबोर्ड',
    'nav.settings': 'सेटिंग्स',
    'nav.help': 'सहायता और समर्थन',
    'btn.watch_now': 'अभी देखें',
    'btn.more_info': 'और जानकारी',
    'btn.resume': 'जारी रखें',
    'btn.add_watchlist': 'वॉचलिस्ट',
    'btn.added_watchlist': 'सूची में जोड़ा गया',
    'shelf.trending_anime': 'ट्रेंडिंग एनीमे',
    'shelf.popular_movies': 'लोकप्रिय फिल्में',
    'shelf.continue_watching': 'देखना जारी रखें',
    'shelf.recommended': 'आपके लिए सुझाव',
    'shelf.telugu_dubbed': 'तेलुगु डब विशेष',
    'shelf.hindi_dubbed': 'हिंदी डब हिट्स',
    'shelf.japanese_audio': 'जापानी मूल ऑडियो',
    'shelf.popular_reels': 'लोकप्रिय रील्स',
  },
  ja: {
    'nav.home': 'ホーム',
    'nav.anime': 'アニメ',
    'nav.movies': '映画',
    'nav.series': 'シリーズ',
    'nav.reels': 'リール',
    'nav.discover': '見つける',
    'nav.search': '検索',
    'nav.watchlist': 'マイリスト',
    'nav.history': '視聴履歴',
    'nav.studio': 'クリエイタースタジオ',
    'nav.admin': '管理者ダッシュボード',
    'nav.settings': '設定',
    'nav.help': 'ヘルプ＆サポート',
    'btn.watch_now': '今すぐ観る',
    'btn.more_info': '詳細情報',
    'btn.resume': '続きから再生',
    'btn.add_watchlist': 'マイリスト追加',
    'btn.added_watchlist': '登録済み',
    'shelf.trending_anime': 'トレンドアニメ',
    'shelf.popular_movies': '人気の映画',
    'shelf.continue_watching': '続きを観る',
    'shelf.recommended': 'おすすめ作品',
    'shelf.telugu_dubbed': 'テルグ語吹替',
    'shelf.hindi_dubbed': 'ヒンディー語吹替',
    'shelf.japanese_audio': '日本語オリジナル音声',
    'shelf.popular_reels': '人気のリール動画',
  },
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('yep_theme') as ThemeMode) || 'cinematic-dark';
  });

  const [language, setLanguageState] = useState<AppLanguage>(() => {
    return (localStorage.getItem('yep_language') as AppLanguage) || 'en';
  });

  const [reducedMotion, setReducedMotionState] = useState<boolean>(() => {
    return localStorage.getItem('yep_reduced_motion') === 'true';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(
      'cinematic-dark',
      'midnight-cinema',
      'neon-anime',
      'minimal-studio',
      'light-mode'
    );
    root.classList.add(theme);

    if (theme === 'light-mode') {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }

    localStorage.setItem('yep_theme', theme);
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('yep_language', lang);
  };

  const setReducedMotion = (reduced: boolean) => {
    setReducedMotionState(reduced);
    localStorage.setItem('yep_reduced_motion', String(reduced));
  };

  const t = (key: string): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        language,
        setLanguage,
        reducedMotion,
        setReducedMotion,
        t,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
