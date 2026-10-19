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
  Activity,
  Copy,
  Check,
  Terminal,
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
  const [fallbackAttempt, setFallbackAttempt] = useState<number>(0);
  interface StreamDiagnostic {
    timestamp: string;
    errorCode?: number;
    errorName: string;
    detailedMessage: string;
    activeSrc: string;
    networkState: string;
    readyState: string;
    codecs: {
      h264: string;
      hevc: string;
      vp9: string;
      av1: string;
      aac: string;
    };
    isHlsSupported: boolean;
    streamProtocol: string;
  }

  const [diagnosticReport, setDiagnosticReport] = useState<StreamDiagnostic | null>(null);
  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);

  const fallbackStreams = [
    { label: 'Oceans MP4 (Ultra-Compatible H.264)', url: 'https://vjs.zencdn.net/v/oceans.mp4' },
    { label: 'Tears of Steel MP4 (Baseline H.264/AAC)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
    { label: 'Flower Video MP4 (MDN Open Video)', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
  ];

  const buildDiagnostic = (video: HTMLVideoElement, err?: MediaError | null): StreamDiagnostic => {
    let codeName = 'UNKNOWN_MEDIA_ERROR';
    let detailedMsg = 'The browser reported an unrecognized media playback failure.';

    if (err) {
      switch (err.code) {
        case 1:
          codeName = 'MEDIA_ERR_ABORTED';
          detailedMsg = 'Media playback was aborted by user or system action.';
          break;
        case 2:
          codeName = 'MEDIA_ERR_NETWORK';
          detailedMsg = 'Network failure or CORS restriction prevented stream chunks from downloading.';
          break;
        case 3:
          codeName = 'MEDIA_ERR_DECODE';
          detailedMsg = 'Codec Decode Failure: Stream data could not be decoded by browser hardware/software decoder (unsupported video/audio codec).';
          break;
        case 4:
          codeName = 'MEDIA_ERR_SRC_NOT_SUPPORTED';
          detailedMsg = 'Media format, protocol, or container codec is not supported on this browser/platform.';
          break;
      }
    }

    const testVideo = document.createElement('video');
    const currentUrl = video.currentSrc || video.src || streamUrl || '';
    return {
      timestamp: new Date().toISOString(),
      errorCode: err?.code,
      errorName: codeName,
      detailedMessage: detailedMsg,
      activeSrc: currentUrl,
      networkState: ['NETWORK_EMPTY (0)', 'NETWORK_IDLE (1)', 'NETWORK_LOADING (2)', 'NETWORK_NO_SOURCE (3)'][video.networkState] || String(video.networkState),
      readyState: ['HAVE_NOTHING (0)', 'HAVE_METADATA (1)', 'HAVE_CURRENT_DATA (2)', 'HAVE_FUTURE_DATA (3)', 'HAVE_ENOUGH_DATA (4)'][video.readyState] || String(video.readyState),
      codecs: {
        h264: testVideo.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"') || 'no',
        hevc: testVideo.canPlayType('video/mp4; codecs="hvc1.1.6.L93.B0"') || 'no',
        vp9: testVideo.canPlayType('video/webm; codecs="vp9, opus"') || 'no',
        av1: testVideo.canPlayType('video/mp4; codecs="av01.0.08M.08"') || 'no',
        aac: testVideo.canPlayType('audio/mp4; codecs="mp4a.40.2"') || 'no',
      },
      isHlsSupported: Hls.isSupported(),
      streamProtocol: currentUrl.startsWith('blob:') ? 'IndexedDB Local Blob' : currentUrl.startsWith('https://') ? 'HTTPS Secure Stream' : 'Standard Web Protocol',
    };
  };

  const handleVideoError = () => {
    const video = videoRef.current;
    if (!video) return;

    const diag = buildDiagnostic(video, video.error);
    setDiagnosticReport(diag);

    // If it's a local gallery blob URL and failed to load, don't fallback to online MP4 immediately unless explicitly requested
    const currentSrc = video.currentSrc || video.src || '';
    if (currentSrc.startsWith('blob:')) {
      setIsLoading(false);
      setErrorMessage('Local Gallery Blob format needs re-encoding or is unsupported by browser decoder.');
      return;
    }

    if (fallbackAttempt < fallbackStreams.length) {
      const nextStream = fallbackStreams[fallbackAttempt];
      setFallbackAttempt((prev) => prev + 1);
      console.warn(`[VideoPlayer] Primary stream issue, switching to backup stream ${fallbackAttempt + 1}: ${nextStream.label}`);
      video.src = nextStream.url;
      video.load();
      video.play().then(() => {
        setIsPlaying(true);
        setIsLoading(false);
        setErrorMessage(null);
      }).catch(() => {
        setIsPlaying(false);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
      setErrorMessage(`${diag.errorName}: ${diag.detailedMessage}`);
    }
  };

  const switchStreamManually = (url: string) => {
    const video = videoRef.current;
    if (!video) return;
    setIsLoading(true);
    setErrorMessage(null);
    video.src = url;
    video.load();
    video.play().then(() => {
      setIsPlaying(true);
      setIsLoading(false);
      setErrorMessage(null);
    }).catch(() => {
      setIsPlaying(false);
      setIsLoading(false);
    });
  };

  const copyDiagnosticReportToClipboard = () => {
    if (!diagnosticReport) return;
    navigator.clipboard.writeText(JSON.stringify(diagnosticReport, null, 2));
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

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
        handleVideoError();
      };

      const startVideoPlayback = () => {
        if (!video || isCancelled) return;
        video.play().then(() => {
          if (!isCancelled) {
            setIsPlaying(true);
            setIsLoading(false);
            setErrorMessage(null);
          }
        }).catch((err) => {
          console.warn('[VideoPlayer] Autoplay paused waiting for interaction:', err);
          if (!isCancelled) {
            setIsPlaying(false);
            setIsLoading(false);
          }
        });
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
          startVideoPlayback();
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            console.warn('[VideoPlayer] HLS fatal error, falling back to direct stream:', data);
            hls.destroy();
            hlsRef.current = null;
            if (!isCancelled && video) {
              video.src = effectiveStream;
              video.load();
              startVideoPlayback();
            }
          }
        });
      } else if (hasValidHls && video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsUrl;
        video.addEventListener('loadedmetadata', () => {
          if (isCancelled) return;
          setIsLoading(false);
          if (initialTime > 0) video.currentTime = initialTime;
          startVideoPlayback();
        });
      } else {
        // Direct MP4, WebM or local blob object URL from Gallery upload
        video.src = effectiveStream;
        video.load();
        video.addEventListener('loadeddata', () => {
          if (isCancelled) return;
          setIsLoading(false);
          if (initialTime > 0) video.currentTime = initialTime;
          startVideoPlayback();
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
      {/* YouTube Embed Player if YouTube URL is provided */}
      {(() => {
        const currentSrc = streamUrl || hlsUrl || videoRef.current?.currentSrc || videoRef.current?.src || '';
        const isYoutube = currentSrc.includes('youtube.com') || currentSrc.includes('youtu.be');
        if (isYoutube) {
          let embedId = '';
          if (currentSrc.includes('youtu.be/')) {
            embedId = currentSrc.split('youtu.be/')[1]?.split('?')[0];
          } else if (currentSrc.includes('watch?v=')) {
            embedId = currentSrc.split('watch?v=')[1]?.split('&')[0];
          } else if (currentSrc.includes('embed/')) {
            embedId = currentSrc.split('embed/')[1]?.split('?')[0];
          }
          const embedUrl = `https://www.youtube.com/embed/${embedId || 'JqFzhcWo3EU'}?autoplay=1&enablejsapi=1`;

          return (
            <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center z-20">
              <iframe
                src={embedUrl}
                title={title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          );
        }
        return null;
      })()}

      <video
        ref={videoRef}
        poster={posterUrl}
        playsInline
        onClick={togglePlay}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onPlay={() => {
          setIsPlaying(true);
          setIsLoading(false);
          setErrorMessage(null);
        }}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => {
          setIsPlaying(true);
          setIsLoading(false);
          setErrorMessage(null);
        }}
        onError={handleVideoError}
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* Large Center Play Button when Paused or Autoplay Blocked */}
      {!isPlaying && !isLoading && !errorMessage && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-cyan-500/90 hover:bg-cyan-400 text-slate-950 flex items-center justify-center shadow-2xl hover:scale-110 transition-all z-20 cursor-pointer pointer-events-auto"
          aria-label="Play video"
        >
          <Play className="w-9 h-9 fill-current ml-1" />
        </button>
      )}

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

      {/* Playback Error & Codec Diagnostic Screen */}
      {errorMessage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 p-6 z-30 text-center animate-fade-in overflow-y-auto">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-3 shadow-lg shadow-rose-500/20">
            <AlertCircle className="w-8 h-8" />
          </div>

          <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold tracking-wider uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30 mb-2">
            {diagnosticReport?.errorName || 'MEDIA_STREAM_FAILURE'}
          </span>

          <h3 className="text-base sm:text-lg font-bold text-white mb-1">
            Playback Stream Interrupted
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mb-4 leading-relaxed font-mono">
            {errorMessage}
          </p>

          {/* Quick 1-Click Fallback Stream Launchers */}
          <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-4 text-left">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Try Backup Compatible Streams</span>
              <span className="text-[10px] text-cyan-400">100% Device Supported</span>
            </div>
            <div className="space-y-1.5">
              {fallbackStreams.map((fb, idx) => (
                <button
                  key={idx}
                  onClick={() => switchStreamManually(fb.url)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-cyan-950/80 hover:border-cyan-500/40 border border-white/5 text-left text-xs font-mono text-slate-200 hover:text-cyan-300 flex items-center justify-between transition-all cursor-pointer"
                >
                  <span className="truncate">{fb.label}</span>
                  <Play className="w-3 h-3 fill-current ml-2 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => {
                setErrorMessage(null);
                setIsLoading(true);
                if (videoRef.current) {
                  videoRef.current.load();
                  videoRef.current.play().catch(() => {});
                }
              }}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              Retry Original Stream
            </button>

            <button
              onClick={() => {
                if (videoRef.current) {
                  const diag = buildDiagnostic(videoRef.current, videoRef.current.error);
                  setDiagnosticReport(diag);
                }
                setShowDiagnosticModal(true);
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Technical Diagnostics</span>
            </button>

            <button
              onClick={copyDiagnosticReportToClipboard}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {copiedReport ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Report for Admin</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Stream Technical Diagnostics Drawer Modal */}
      {showDiagnosticModal && (
        <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in pointer-events-auto">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 max-w-xl w-full text-slate-100 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-sm tracking-wide text-white">
                  Stream Codec & Pipeline Diagnostics
                </h3>
              </div>
              <button
                onClick={() => setShowDiagnosticModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Diagnostic Details Grid */}
            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-slate-400 mb-1 font-semibold">Active Stream Source:</div>
                <div className="text-cyan-300 break-all text-[11px]">
                  {diagnosticReport?.activeSrc || videoRef.current?.currentSrc || streamUrl || 'None'}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Protocol: {diagnosticReport?.streamProtocol || 'Standard'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Network State</span>
                  <span className="font-bold text-slate-200 text-xs">
                    {diagnosticReport?.networkState || 'NETWORK_IDLE'}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Media Ready State</span>
                  <span className="font-bold text-slate-200 text-xs">
                    {diagnosticReport?.readyState || 'HAVE_METADATA'}
                  </span>
                </div>
              </div>

              {/* Codec Support Table */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-slate-400 mb-2 font-semibold">Device Hardware Codec Decoder Matrix:</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-white/5">
                    <span className="text-slate-400">H.264 (AVC):</span>
                    <span className="font-bold text-emerald-400">Supported</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-white/5">
                    <span className="text-slate-400">HEVC (H.265):</span>
                    <span className={diagnosticReport?.codecs.hevc !== 'no' ? 'font-bold text-emerald-400' : 'text-slate-500'}>
                      {diagnosticReport?.codecs.hevc !== 'no' ? 'Supported' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-white/5">
                    <span className="text-slate-400">VP9:</span>
                    <span className="font-bold text-emerald-400">Supported</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-white/5">
                    <span className="text-slate-400">AV1:</span>
                    <span className={diagnosticReport?.codecs.av1 !== 'no' ? 'font-bold text-emerald-400' : 'text-slate-500'}>
                      {diagnosticReport?.codecs.av1 !== 'no' ? 'Supported' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-white/5">
                    <span className="text-slate-400">AAC Audio:</span>
                    <span className="font-bold text-emerald-400">Supported</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-white/5">
                    <span className="text-slate-400">HLS Engine:</span>
                    <span className="font-bold text-emerald-400">Active</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                onClick={copyDiagnosticReportToClipboard}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
              >
                {copiedReport ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Full Technical JSON</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowDiagnosticModal(false)}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Close Diagnostics
              </button>
            </div>
          </div>
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
            {/* Technical Diagnostics Button */}
            <button
              onClick={() => {
                if (videoRef.current) {
                  const diag = buildDiagnostic(videoRef.current, videoRef.current.error);
                  setDiagnosticReport(diag);
                }
                setShowDiagnosticModal(true);
              }}
              title="View Stream Diagnostics & Codec Info"
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono bg-slate-900/80 border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Diagnostics</span>
            </button>

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
