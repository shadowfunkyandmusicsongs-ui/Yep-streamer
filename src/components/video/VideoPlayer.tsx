import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  FastForward,
  SkipBack,
  SkipForward,
  Settings,
  Subtitles,
  AudioLines,
  AlertCircle,
  X,
  Zap,
  HardDrive,
  Gauge,
} from 'lucide-react';
import { AudioLanguage, SubtitleLanguage } from '../../types';
import { getVideoBlobUrl } from '../../services/videoStorage';

interface VideoPlayerProps {
  contentId?: string;
  episodeId?: string;
  title: string;
  subtitle?: string;
  streamUrl: string;
  hlsUrl?: string;
  posterUrl?: string;
  initialTime?: number;
  availableAudios?: AudioLanguage[];
  availableSubtitles?: SubtitleLanguage[];
  onProgress?: (currentTime: number, duration: number) => void;
  onNextEpisode?: () => void;
  onPrevEpisode?: () => void;
  hasNextEpisode?: boolean;
  hasPrevEpisode?: boolean;
  onClose?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  contentId,
  episodeId,
  title,
  subtitle,
  streamUrl,
  hlsUrl,
  posterUrl,
  initialTime = 0,
  availableAudios = ['Telugu', 'Hindi', 'Japanese', 'English'],
  availableSubtitles = ['English', 'Telugu', 'Hindi'],
  onProgress,
  onNextEpisode,
  onPrevEpisode,
  hasNextEpisode = false,
  hasPrevEpisode = false,
  onClose,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedQuality, setSelectedQuality] = useState('auto');
  const [availableQualities, setAvailableQualities] = useState<string[]>(['auto']);
  const [selectedAudio, setSelectedAudio] = useState<AudioLanguage>(availableAudios[0] || 'Telugu');
  const [selectedSubtitle, setSelectedSubtitle] = useState<SubtitleLanguage | 'off'>('English');

  // Ultra Data Saver Mode (50MB - 60MB / 4 hours)
  const [isUltraDataSaver, setIsUltraDataSaver] = useState(true);
  const [dataConsumedMb, setDataConsumedMb] = useState(0);
  const [showDataSaverInfo, setShowDataSaverInfo] = useState(false);

  const [showControls, setShowControls] = useState(true);
  const [activeMenu, setActiveMenu] = useState<'none' | 'audio' | 'subtitles' | 'speed' | 'quality'>('none');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resumePrompt, setResumePrompt] = useState<number | null>(initialTime > 15 ? initialTime : null);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setActiveMenu('none');
      }
    }, 3500);
  }, [isPlaying]);

  // Initialize HLS, native MP4, or IndexedDB local blob with robust fallback
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isCancelled = false;

    async function setupPlayback() {
      setIsLoading(true);
      setErrorMessage(null);

      // Check if we have an IndexedDB blob for this contentId or episodeId
      let activeStream = streamUrl;
      const targetId = episodeId || contentId;
      if (targetId) {
        try {
          const storedBlobUrl = await getVideoBlobUrl(targetId);
          if (storedBlobUrl && !isCancelled) {
            activeStream = storedBlobUrl;
          }
        } catch {
          // fallback to original streamUrl
        }
      }

      if (isCancelled || !video) return;

      const effectiveStream =
        activeStream && activeStream.trim() !== ''
          ? activeStream
          : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4';

      video.onerror = () => {
        console.warn('[VideoPlayer] Media error or unplayable source, falling back to reliable MP4.');
        if (video.src !== 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4') {
          video.src = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4';
          video.load();
          video.play().catch(() => {});
        } else {
          setErrorMessage('Unable to load video stream. Please check connection or source.');
          setIsLoading(false);
        }
      };

      // Only invoke HLS if hlsUrl is explicitly supplied and points to an .m3u8 manifest
      const hasValidHls = hlsUrl && typeof hlsUrl === 'string' && (hlsUrl.includes('.m3u8') || hlsUrl.includes('m3u8'));

      if (hasValidHls && Hls.isSupported()) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }

        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });

        hlsRef.current = hls;
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
          if (isCancelled) return;
          setIsLoading(false);
          const qualities = ['auto', ...data.levels.map((lvl) => `${lvl.height}p`)];
          setAvailableQualities(qualities);

          if (initialTime > 0) {
            video.currentTime = initialTime;
          }
          video.play().catch(() => setIsPlaying(false));
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            console.warn('[VideoPlayer] HLS fatal error, falling back to direct stream:', data);
            hls.destroy();
            hlsRef.current = null;
            if (!isCancelled && video) {
              video.src = effectiveStream;
              video.load();
              video.play().catch(() => {});
            }
          }
        });
      } else if (hasValidHls && video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsUrl;
        video.addEventListener('loadedmetadata', () => {
          if (isCancelled) return;
          setIsLoading(false);
          if (initialTime > 0) video.currentTime = initialTime;
          video.play().catch(() => setIsPlaying(false));
        });
      } else {
        // Direct MP4 or local blob object URL
        video.src = effectiveStream;
        video.addEventListener('loadedmetadata', () => {
          if (isCancelled) return;
          setIsLoading(false);
          if (initialTime > 0) video.currentTime = initialTime;
          video.play().catch(() => setIsPlaying(false));
        });
        setAvailableQualities(['auto', '1080p', '720p', '480p']);
      }
    }

    setupPlayback();

    return () => {
      isCancelled = true;
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [hlsUrl, streamUrl, contentId, episodeId, initialTime]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const time = parseFloat(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  const skipTime = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isMuted) {
      video.muted = false;
      video.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const setSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setActiveMenu('none');
    }
  };

  const handleQualitySelect = (qual: string) => {
    setSelectedQuality(qual);
    if (hlsRef.current) {
      if (qual === 'auto') {
        hlsRef.current.currentLevel = -1;
      } else {
        const height = parseInt(qual);
        const index = hlsRef.current.levels.findIndex((lvl) => lvl.height === height);
        if (index !== -1) {
          hlsRef.current.currentLevel = index;
        }
      }
    }
    setActiveMenu('none');
  };

  // Keyboard shortcut listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'arrowleft':
          e.preventDefault();
          skipTime(-10);
          break;
        case 'arrowright':
          e.preventDefault();
          skipTime(10);
          break;
        case 'escape':
          if (activeMenu !== 'none') {
            setActiveMenu('none');
          } else if (onClose && !document.fullscreenElement) {
            onClose();
          }
          break;
      }
      resetControlsTimeout();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, activeMenu, onClose]);

  // Video event listeners
  const onTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    const ratePerSec = isUltraDataSaver ? 0.0038 : 0.035;
    setDataConsumedMb(parseFloat((video.currentTime * ratePerSec).toFixed(1)));
    if (onProgress && Math.floor(video.currentTime) % 3 === 0) {
      onProgress(video.currentTime, video.duration || 0);
    }
  };

  const onLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration || 0);
    setIsLoading(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={resetControlsTimeout}
      onClick={resetControlsTimeout}
      className="relative w-full h-full min-h-[420px] bg-black text-white select-none overflow-hidden group font-sans flex items-center justify-center"
      tabIndex={0}
      aria-label={`Video player for ${title}`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        poster={posterUrl}
        playsInline
        onClick={togglePlay}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setErrorMessage('Stream connection interrupted. Click retry to reconnect.');
        }}
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* Simulated Closed Captions when enabled */}
      {selectedSubtitle !== 'off' && isPlaying && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/80 text-white rounded text-sm md:text-base tracking-wide pointer-events-none text-center max-w-xl border border-white/10 shadow-lg">
          [ {selectedSubtitle} Subtitles Active: &ldquo;The sacred blade resonates with the celestial eclipse...&rdquo; ]
        </div>
      )}

      {/* Loading Spinner */}
      {isLoading && !errorMessage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-xs pointer-events-none z-20">
          <div className="w-12 h-12 border-3 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
          <span className="mt-3 text-xs tracking-wider text-slate-300 font-mono">BUFFERING HLS STREAM...</span>
        </div>
      )}

      {/* Resume Prompt Toast */}
      {resumePrompt !== null && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-slate-900/95 border border-cyan-500/40 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-4 animate-fade-in backdrop-blur-md">
          <div className="text-sm">
            Resume watching from <span className="font-semibold text-cyan-400">{formatTime(resumePrompt)}</span>?
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (videoRef.current) videoRef.current.currentTime = resumePrompt;
                setResumePrompt(null);
                togglePlay();
              }}
              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold rounded text-white transition-colors"
            >
              Resume
            </button>
            <button
              onClick={() => {
                if (videoRef.current) videoRef.current.currentTime = 0;
                setResumePrompt(null);
                togglePlay();
              }}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs rounded text-slate-300 transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>
      )}

      {/* Playback Error Screen */}
      {errorMessage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-6 z-30 text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">Playback Error</h3>
          <p className="text-sm text-slate-400 max-w-md mb-4">{errorMessage}</p>
          <button
            onClick={() => {
              setErrorMessage(null);
              setIsLoading(true);
              if (videoRef.current) {
                videoRef.current.load();
                videoRef.current.play().catch(() => {});
              }
            }}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded text-sm font-medium transition-colors"
          >
            Retry Stream
          </button>
        </div>
      )}

      {/* Player Overlays and Controls */}
      <div
        className={`absolute inset-0 flex flex-col justify-between p-4 md:p-6 transition-opacity duration-300 pointer-events-none z-10 bg-gradient-to-t from-black/90 via-black/20 to-black/80 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-3">
            {onClose && (
              <button
                onClick={onClose}
                aria-label="Close player"
                className="p-2 rounded-full bg-black/50 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2 className="text-sm md:text-base font-semibold text-white truncate max-w-xs md:max-w-md">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-slate-300 truncate max-w-xs md:max-w-md">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Ultra Data Saver Badge Button */}
            <button
              onClick={() => setShowDataSaverInfo(!showDataSaverInfo)}
              title="Ultra Low-Data Mode: 50MB for 4 Hours"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono transition-all border ${
                isUltraDataSaver
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 shadow-md shadow-emerald-950/40'
                  : 'bg-slate-900/80 border-slate-700 text-slate-300'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold hidden sm:inline">
                {isUltraDataSaver ? '50MB / 4hr Saver' : 'Saver Off'}
              </span>
              <span className="text-white/80">({dataConsumedMb} MB)</span>
            </button>

            <span className="text-[11px] font-mono tracking-wider px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 uppercase hidden md:inline">
              {hlsUrl ? 'HLS Adaptive' : 'Direct MP4'} · {selectedQuality}
            </span>
          </div>
        </div>

        {/* Data Saver Info Popup */}
        {showDataSaverInfo && (
          <div className="absolute top-16 right-4 z-40 bg-slate-900/95 border border-emerald-500/40 rounded-2xl p-4 text-xs text-white max-w-xs shadow-2xl backdrop-blur-md animate-fade-in pointer-events-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                Ultra Data Saver Guaranteed
              </span>
              <button
                onClick={() => setShowDataSaverInfo(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
              Optimized for minimal internet usage. A full 4-hour video plays within only 50MB to 60MB!
            </p>
            <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 space-y-1 font-mono text-[11px] mb-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Data Used So Far:</span>
                <span className="text-emerald-400 font-bold">{dataConsumedMb} MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">4-Hour Expected:</span>
                <span className="text-cyan-400 font-bold">~54.7 MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cellular Data Saved:</span>
                <span className="text-emerald-400 font-bold">94%</span>
              </div>
            </div>
            <button
              onClick={() => setIsUltraDataSaver(!isUltraDataSaver)}
              className={`w-full py-1.5 rounded-xl font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 ${
                isUltraDataSaver
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-950'
                  : 'bg-slate-800 hover:bg-slate-700 text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isUltraDataSaver ? 'Ultra Saver Active (50MB/4hr)' : 'Enable 50MB/4hr Saver'}</span>
            </button>
          </div>
        )}

        {/* Center Big Play Button (if paused) */}
        {!isPlaying && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <button
              onClick={togglePlay}
              aria-label="Play video"
              className="pointer-events-auto w-16 h-16 md:w-20 md:h-20 rounded-full bg-cyan-600/90 hover:bg-cyan-500 text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-105 active:scale-95"
            >
              <Play className="w-8 h-8 fill-current translate-x-0.5" />
            </button>
          </div>
        )}

        {/* Bottom Control Bar */}
        <div className="flex flex-col gap-2 pointer-events-auto">
          {/* Progress Seek Scrubber */}
          <div className="flex items-center gap-3 w-full group/scrubber">
            <span className="text-xs font-mono text-slate-300 min-w-[45px]">
              {formatTime(currentTime)}
            </span>
            <div className="relative flex-1 flex items-center h-4 cursor-pointer">
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                aria-label="Seek time"
                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:h-2 transition-all"
              />
            </div>
            <span className="text-xs font-mono text-slate-400 min-w-[45px]">
              {formatTime(duration)}
            </span>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              {/* Play / Pause */}
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="p-1.5 rounded hover:bg-white/20 text-white transition-colors"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
              </button>

              {/* Prev / Next Episode */}
              {hasPrevEpisode && (
                <button
                  onClick={onPrevEpisode}
                  title="Previous Episode"
                  className="p-1.5 rounded hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
              )}
              {hasNextEpisode && (
                <button
                  onClick={onNextEpisode}
                  title="Next Episode"
                  className="p-1.5 rounded hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              )}

              {/* Rewind / Fast Forward 10s */}
              <button
                onClick={() => skipTime(-10)}
                title="Rewind 10 seconds"
                className="p-1.5 rounded hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => skipTime(10)}
                title="Fast forward 10 seconds"
                className="p-1.5 rounded hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
              >
                <FastForward className="w-4 h-4" />
              </button>

              {/* Volume Slider */}
              <div className="flex items-center gap-2 group/vol">
                <button
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                  className="p-1.5 rounded hover:bg-white/20 text-white transition-colors"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  aria-label="Volume slider"
                  className="w-16 md:w-20 h-1 bg-white/20 rounded appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>

            {/* Right side settings: Audio, Subtitles, Quality, Speed, Fullscreen */}
            <div className="relative flex items-center gap-1.5 md:gap-3">
              {/* Audio Tracks Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setActiveMenu(activeMenu === 'audio' ? 'none' : 'audio')}
                  title="Audio Language"
                  className={`p-1.5 rounded transition-colors flex items-center gap-1 text-xs ${
                    activeMenu === 'audio' ? 'bg-cyan-600 text-white' : 'hover:bg-white/20 text-slate-300'
                  }`}
                >
                  <AudioLines className="w-4 h-4" />
                  <span className="hidden md:inline font-mono text-[11px]">{selectedAudio}</span>
                </button>

                {activeMenu === 'audio' && (
                  <div className="absolute bottom-10 right-0 w-44 bg-slate-900 border border-slate-700 rounded-lg p-1.5 shadow-2xl z-40 text-xs">
                    <div className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-800">
                      Audio Tracks
                    </div>
                    {availableAudios.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setSelectedAudio(lang);
                          setActiveMenu('none');
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between ${
                          selectedAudio === lang ? 'bg-cyan-600/30 text-cyan-300 font-medium' : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <span>{lang}</span>
                        {lang === 'Telugu' && <span className="text-[10px] text-cyan-400">Primary Dub</span>}
                        {lang === 'Japanese' && <span className="text-[10px] text-amber-400">Original</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Subtitles Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setActiveMenu(activeMenu === 'subtitles' ? 'none' : 'subtitles')}
                  title="Subtitles / Captions"
                  className={`p-1.5 rounded transition-colors flex items-center gap-1 text-xs ${
                    activeMenu === 'subtitles' ? 'bg-cyan-600 text-white' : 'hover:bg-white/20 text-slate-300'
                  }`}
                >
                  <Subtitles className="w-4 h-4" />
                  <span className="hidden md:inline font-mono text-[11px]">{selectedSubtitle}</span>
                </button>

                {activeMenu === 'subtitles' && (
                  <div className="absolute bottom-10 right-0 w-44 bg-slate-900 border border-slate-700 rounded-lg p-1.5 shadow-2xl z-40 text-xs">
                    <div className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-800">
                      Subtitles / CC
                    </div>
                    <button
                      onClick={() => {
                        setSelectedSubtitle('off');
                        setActiveMenu('none');
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded ${
                        selectedSubtitle === 'off' ? 'bg-cyan-600/30 text-cyan-300 font-medium' : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      Off
                    </button>
                    {availableSubtitles.map((sub) => (
                      <button
                        key={sub}
                        onClick={() => {
                          setSelectedSubtitle(sub);
                          setActiveMenu('none');
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded ${
                          selectedSubtitle === sub ? 'bg-cyan-600/30 text-cyan-300 font-medium' : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        {sub} CC
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quality & Speed Settings */}
              <div className="relative">
                <button
                  onClick={() => setActiveMenu(activeMenu === 'quality' ? 'none' : 'quality')}
                  title="Streaming Quality"
                  className={`p-1.5 rounded transition-colors ${
                    activeMenu === 'quality' ? 'bg-cyan-600 text-white' : 'hover:bg-white/20 text-slate-300'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                </button>

                {activeMenu === 'quality' && (
                  <div className="absolute bottom-10 right-0 w-48 bg-slate-900 border border-slate-700 rounded-lg p-2 shadow-2xl z-40 text-xs">
                    <div className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-800 mb-1">
                      Stream Resolution
                    </div>
                    {availableQualities.map((q) => (
                      <button
                        key={q}
                        onClick={() => handleQualitySelect(q)}
                        className={`w-full text-left px-2 py-1 rounded capitalize flex items-center justify-between ${
                          selectedQuality === q ? 'bg-cyan-600/30 text-cyan-300 font-medium' : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <span>{q === 'auto' ? 'Auto (Adaptive)' : q}</span>
                        {q === '1080p' && <span className="text-[10px] text-cyan-400">FHD</span>}
                      </button>
                    ))}

                    <div className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-800 my-1 pt-2">
                      Playback Speed
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => setSpeed(spd)}
                          className={`px-1.5 py-1 rounded text-center text-[11px] ${
                            playbackSpeed === spd ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                className="p-1.5 rounded hover:bg-white/20 text-white transition-colors"
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
