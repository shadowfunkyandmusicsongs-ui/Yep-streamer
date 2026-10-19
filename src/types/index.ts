export type ContentType = 'anime_movie' | 'anime_series' | 'movie' | 'series';

export type AudioLanguage = 'Telugu' | 'Hindi' | 'English' | 'Japanese' | 'Tamil' | 'Korean';
export type SubtitleLanguage = 'Telugu' | 'Hindi' | 'English' | 'Japanese';

export interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  synopsis: string;
  duration: string; // e.g., "24m", "48m"
  durationSeconds: number;
  thumbnailUrl: string;
  streamUrl: string; // HLS .m3u8 or demo mp4
  hlsUrl?: string;
  availableAudios: AudioLanguage[];
  availableSubtitles: SubtitleLanguage[];
  releaseDate: string;
}

export interface Season {
  seasonNumber: number;
  title: string;
  episodes: Episode[];
}

export interface ContentItem {
  id: string;
  title: string;
  alternateTitle?: string; // Japanese romaji / Telugu title
  type: ContentType;
  posterUrl: string;
  bannerUrl: string;
  synopsis: string;
  releaseYear: number;
  ageRating: 'U' | 'U/A 13+' | 'U/A 16+' | 'A' | 'TV-14' | 'TV-MA' | 'PG-13';
  duration: string; // e.g. "2h 14m" or "24 eps"
  genres: string[];
  audioLanguages: AudioLanguage[];
  subtitleLanguages: SubtitleLanguage[];
  isFeatured?: boolean;
  trendingRank?: number;
  isPopular?: boolean;
  isRecentlyAdded?: boolean;
  ratingScore: number; // 1.0 - 10.0
  viewsCount: number;
  seasons?: Season[];
  streamUrl?: string; // For movies or direct playback
  hlsUrl?: string;
  isDemoVideo?: boolean;
  creatorId?: string;
  creatorName?: string;
  status: 'draft' | 'processing' | 'published' | 'archived';
  createdAt: string;
  isUltraCompressed?: boolean;
  compressedSizeMb?: number;
  originalSizeMb?: number;
}

export interface ReelItem {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  creatorHandle: string;
  caption: string;
  hashtags: string[];
  videoUrl: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  audioTitle: string;
  isLiked?: boolean;
  isSaved?: boolean;
  createdAt: string;
  isUltraCompressed?: boolean;
  compressedSizeMb?: number;
}

export interface CommentItem {
  id: string;
  reelId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
}

export type UserRole = 'viewer' | 'creator' | 'content_manager' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  preferredLanguage: AppLanguage;
  theme: ThemeMode;
  defaultAudio: AudioLanguage;
  defaultSubtitles: SubtitleLanguage | 'Off';
  createdAt: string;
}

export type UploadJobStatus =
  | 'uploaded'
  | 'queued'
  | 'probing'
  | 'transcoding'
  | 'packaging'
  | 'validating'
  | 'ready'
  | 'failed'
  | 'cancelled';

export interface FileMediaInfo {
  filename: string;
  filesize: number; // in bytes
  formattedSize: string;
  mimeType: string;
  width?: number;
  height?: number;
  durationSeconds?: number;
  codec?: string;
  audioChannels?: number;
}

export interface UploadJob {
  id: string;
  assetId: string;
  creatorId: string;
  creatorName: string;
  title: string;
  description: string;
  category: ContentType;
  audioLanguages: AudioLanguage[];
  subtitleLanguages: SubtitleLanguage[];
  fileInfo: FileMediaInfo;
  status: UploadJobStatus;
  progress: number; // 0 - 100
  stepMessage: string;
  renditions: ('1080p' | '720p' | '480p')[];
  masterPlaylistPath?: string;
  outputUrls?: {
    master: string;
    p1080?: string;
    p720?: string;
    p480?: string;
  };
  error?: string;
  createdAt: string;
  updatedAt: string;
  publishedContentId?: string;
}

export interface WatchProgress {
  contentId: string;
  episodeId?: string;
  title: string;
  posterUrl: string;
  positionSeconds: number;
  durationSeconds: number;
  percentage: number;
  lastWatchedAt: string;
  type: ContentType;
  seasonNumber?: number;
  episodeNumber?: number;
}

export interface ModerationReport {
  id: string;
  contentId: string;
  contentTitle: string;
  contentType: string;
  reporterUserId: string;
  reporterEmail?: string;
  reason: 'copyright' | 'inappropriate' | 'spam' | 'misleading' | 'other';
  details: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  userRole: UserRole;
  action: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

export type ThemeMode =
  | 'cinematic-dark'
  | 'midnight-cinema'
  | 'neon-anime'
  | 'minimal-studio'
  | 'light-mode';

export type AppLanguage = 'en' | 'te' | 'hi' | 'ja';
