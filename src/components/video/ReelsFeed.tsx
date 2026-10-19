import React, { useState, useRef, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Volume2,
  VolumeX,
  Music,
  Send,
  Flag,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ReelItem, CommentItem } from '../../types';
import { INITIAL_REELS, INITIAL_COMMENTS } from '../../data/mockReels';
import { useAuth } from '../../context/AuthContext';

export const ReelsFeed: React.FC = () => {
  const { user } = useAuth();
  const [reels, setReels] = useState<ReelItem[]>(INITIAL_REELS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [activeCommentReelId, setActiveCommentReelId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, CommentItem[]>>(INITIAL_COMMENTS);
  const [commentInput, setCommentInput] = useState('');
  const [copiedToast, setCopiedToast] = useState(false);
  const [reportedToast, setReportedToast] = useState(false);
  const [reportReelId, setReportReelId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('copyright');

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Autoplay currently active reel, pause others
  useEffect(() => {
    videoRefs.current.forEach((video, idx) => {
      if (!video) return;
      if (idx === currentIndex) {
        video.currentTime = 0;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const toggleLike = (reelId: string) => {
    setReels((prev) =>
      prev.map((r) => {
        if (r.id === reelId) {
          const wasLiked = Boolean(r.isLiked);
          return {
            ...r,
            isLiked: !wasLiked,
            likesCount: wasLiked ? r.likesCount - 1 : r.likesCount + 1,
          };
        }
        return r;
      })
    );
  };

  const toggleSave = (reelId: string) => {
    setReels((prev) =>
      prev.map((r) => (r.id === reelId ? { ...r, isSaved: !r.isSaved } : r))
    );
  };

  const handleShare = (reel: ReelItem) => {
    if (navigator.share) {
      navigator.share({
        title: `YEP Reel by ${reel.creatorName}`,
        text: reel.caption,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !activeCommentReelId) return;

    const newComment: CommentItem = {
      id: `comm_${Date.now()}`,
      reelId: activeCommentReelId,
      userId: user?.uid || 'guest-user',
      userName: user?.displayName || 'Anime Fan',
      userAvatar: user?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      text: commentInput.trim(),
      timestamp: 'Just now',
    };

    setCommentsMap((prev) => ({
      ...prev,
      [activeCommentReelId]: [newComment, ...(prev[activeCommentReelId] || [])],
    }));

    setReels((prev) =>
      prev.map((r) =>
        r.id === activeCommentReelId ? { ...r, commentsCount: r.commentsCount + 1 } : r
      )
    );

    setCommentInput('');
  };

  const submitReport = () => {
    setReportedToast(true);
    setReportReelId(null);
    setTimeout(() => setReportedToast(false), 3000);
  };

  const activeReel = reels[currentIndex];

  return (
    <div className="relative w-full h-[calc(100vh-64px)] max-w-md mx-auto flex flex-col items-center justify-center py-2 px-2">
      {/* Toast notifications */}
      {copiedToast && (
        <div className="absolute top-4 z-50 bg-cyan-600 text-white text-xs px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" /> Link copied to clipboard!
        </div>
      )}
      {reportedToast && (
        <div className="absolute top-4 z-50 bg-rose-600 text-white text-xs px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          <Flag className="w-4 h-4" /> Report submitted for moderation review.
        </div>
      )}

      {/* Main Reel Card */}
      <div
        ref={containerRef}
        className="relative w-full h-full max-h-[760px] bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center"
      >
        {activeReel && (
          <>
            <video
              ref={(el) => {
                videoRefs.current[currentIndex] = el;
              }}
              src={activeReel.videoUrl}
              loop
              playsInline
              muted={isMuted}
              className="w-full h-full object-cover"
              onClick={() => {
                const vid = videoRefs.current[currentIndex];
                if (vid) {
                  vid.paused ? vid.play() : vid.pause();
                }
              }}
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />

            {/* Top Bar: Sound toggle and vertical navigation indicators */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-1">
                {reels.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === currentIndex ? 'w-6 bg-cyan-400' : 'w-2 bg-white/40'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-xs transition-colors"
                  aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setReportReelId(activeReel.id)}
                  title="Report content"
                  className="p-2 rounded-full bg-black/50 text-slate-300 hover:text-rose-400 hover:bg-black/70 backdrop-blur-xs transition-colors"
                >
                  <Flag className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Action Bar */}
            <div className="absolute right-3 bottom-16 flex flex-col items-center gap-4 z-20">
              {/* Creator Avatar with follow badge */}
              <div className="relative mb-2">
                <img
                  src={activeReel.creatorAvatar}
                  alt={activeReel.creatorName}
                  className="w-11 h-11 rounded-full border-2 border-cyan-400 object-cover"
                />
              </div>

              {/* Like Button */}
              <button
                onClick={() => toggleLike(activeReel.id)}
                className="flex flex-col items-center group"
                aria-label="Like reel"
              >
                <div
                  className={`p-3 rounded-full bg-black/40 backdrop-blur-xs transition-transform active:scale-125 ${
                    activeReel.isLiked ? 'text-rose-500 fill-rose-500' : 'text-white hover:text-rose-400'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${activeReel.isLiked ? 'fill-current' : ''}`} />
                </div>
                <span className="text-[11px] font-mono font-medium text-white mt-1 shadow-xs">
                  {activeReel.likesCount.toLocaleString()}
                </span>
              </button>

              {/* Comments Button */}
              <button
                onClick={() => setActiveCommentReelId(activeReel.id)}
                className="flex flex-col items-center"
                aria-label="View comments"
              >
                <div className="p-3 rounded-full bg-black/40 backdrop-blur-xs text-white hover:text-cyan-400 transition-colors">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono font-medium text-white mt-1 shadow-xs">
                  {activeReel.commentsCount.toLocaleString()}
                </span>
              </button>

              {/* Save / Bookmark Button */}
              <button
                onClick={() => toggleSave(activeReel.id)}
                className="flex flex-col items-center"
                aria-label="Save reel to library"
              >
                <div
                  className={`p-3 rounded-full bg-black/40 backdrop-blur-xs transition-colors ${
                    activeReel.isSaved ? 'text-amber-400' : 'text-white hover:text-amber-300'
                  }`}
                >
                  <Bookmark className={`w-6 h-6 ${activeReel.isSaved ? 'fill-current' : ''}`} />
                </div>
                <span className="text-[11px] font-mono font-medium text-white mt-1 shadow-xs">
                  Save
                </span>
              </button>

              {/* Share Button */}
              <button
                onClick={() => handleShare(activeReel)}
                className="flex flex-col items-center"
                aria-label="Share reel"
              >
                <div className="p-3 rounded-full bg-black/40 backdrop-blur-xs text-white hover:text-cyan-400 transition-colors">
                  <Share2 className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono font-medium text-white mt-1 shadow-xs">
                  Share
                </span>
              </button>
            </div>

            {/* Bottom Caption & Audio Info */}
            <div className="absolute left-4 right-16 bottom-4 text-white z-10 pointer-events-auto">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm drop-shadow-md">{activeReel.creatorName}</span>
                <span className="text-xs text-slate-300 font-mono drop-shadow-md">{activeReel.creatorHandle}</span>
              </div>

              <p className="text-xs text-slate-100 line-clamp-2 mb-2 drop-shadow-md leading-relaxed">
                {activeReel.caption}
              </p>

              <div className="flex flex-wrap gap-1 mb-2">
                {activeReel.hashtags.map((tag) => (
                  <span key={tag} className="text-[11px] text-cyan-300 font-medium">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-200 bg-black/40 px-2.5 py-1 rounded-full w-fit backdrop-blur-xs">
                <Music className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
                <span className="truncate max-w-[200px]">{activeReel.audioTitle}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Up/Down Navigation Floating Controls */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-30">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="p-2 rounded-full bg-slate-900/80 border border-white/10 text-white disabled:opacity-30 hover:bg-cyan-600 transition-colors shadow-lg"
          aria-label="Previous reel"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        <button
          onClick={handleNext}
          disabled={currentIndex === reels.length - 1}
          className="p-2 rounded-full bg-slate-900/80 border border-white/10 text-white disabled:opacity-30 hover:bg-cyan-600 transition-colors shadow-lg"
          aria-label="Next reel"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* Comments Drawer Modal */}
      {activeCommentReelId && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-xs z-40 flex flex-col justify-end rounded-2xl overflow-hidden animate-fade-in">
          <div className="bg-slate-900 border-t border-slate-700 rounded-t-2xl max-h-[70%] flex flex-col text-white">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <h3 className="text-sm font-semibold">
                Comments ({commentsMap[activeCommentReelId]?.length || 0})
              </h3>
              <button
                onClick={() => setActiveCommentReelId(null)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[220px]">
              {(commentsMap[activeCommentReelId] || []).map((comm) => (
                <div key={comm.id} className="flex gap-3">
                  <img
                    src={comm.userAvatar}
                    alt={comm.userName}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200">{comm.userName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{comm.timestamp}</span>
                    </div>
                    <p className="text-slate-300 mt-0.5 leading-relaxed">{comm.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="p-3 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={!commentInput.trim()}
                className="p-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 rounded-lg text-white transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Moderation Report Modal */}
      {reportReelId && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 rounded-2xl animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 w-full max-w-xs text-white">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Flag className="w-4 h-4 text-rose-400" /> Report Reel
            </h4>
            <div className="space-y-2 mb-4 text-xs">
              {[
                { id: 'copyright', label: 'Copyright / DMCA Violation' },
                { id: 'inappropriate', label: 'Inappropriate or Explicit Content' },
                { id: 'misleading', label: 'Misleading metadata or spam' },
              ].map((opt) => (
                <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="report"
                    value={opt.id}
                    checked={reportReason === opt.id}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="accent-cyan-500"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setReportReelId(null)}
                className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs"
              >
                Cancel
              </button>
              <button
                onClick={submitReport}
                className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 rounded text-xs font-semibold"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
