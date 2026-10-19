import React, { useState } from 'react';
import { X, CheckCircle2, Copy, ExternalLink, ShieldCheck, Key, Database, HardDrive, Cpu, Radio } from 'lucide-react';
import { firebaseConfig, saveCustomFirebaseConfig, isFirebaseConfigured } from '../../services/firebase';

interface FirebaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseSetupModal: React.FC<FirebaseSetupModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState(firebaseConfig.apiKey || '');
  const [authDomain, setAuthDomain] = useState(firebaseConfig.authDomain || '');
  const [projectId, setProjectId] = useState(firebaseConfig.projectId || '');
  const [storageBucket, setStorageBucket] = useState(firebaseConfig.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(firebaseConfig.messagingSenderId || '');
  const [appId, setAppId] = useState(firebaseConfig.appId || '');
  const [cdnBaseUrl, setCdnBaseUrl] = useState(firebaseConfig.cdnBaseUrl || '');
  const [ffmpegWorkerEndpoint, setFfmpegWorkerEndpoint] = useState(firebaseConfig.ffmpegWorkerEndpoint || '');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveCustomFirebaseConfig({
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim(),
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim(),
      cdnBaseUrl: cdnBaseUrl.trim(),
      ffmpegWorkerEndpoint: ffmpegWorkerEndpoint.trim(),
    });
  };

  const handleResetToSandbox = () => {
    localStorage.removeItem('yep_streamer_firebase_custom_config');
    window.location.reload();
  };

  const envTemplate = `# YEP Streamer Environment Configuration
# Firebase Client SDK Credentials (from Firebase Console > Project Settings > Web App)
VITE_FIREBASE_API_KEY="${apiKey || 'AIzaSyExampleKey'}"
VITE_FIREBASE_AUTH_DOMAIN="${authDomain || 'yep-streamer.firebaseapp.com'}"
VITE_FIREBASE_PROJECT_ID="${projectId || 'yep-streamer'}"
VITE_FIREBASE_STORAGE_BUCKET="${storageBucket || 'yep-streamer.firebasestorage.app'}"
VITE_FIREBASE_MESSAGING_SENDER_ID="${messagingSenderId || '123456789012'}"
VITE_FIREBASE_APP_ID="${appId || '1:123456789012:web:abcdef123456'}"

# Video Delivery CDN & Remote FFmpeg Transcoding Worker (Optional)
CDN_BASE_URL="${cdnBaseUrl || 'https://cdn.yepstreamer.com'}"
FFMPEG_WORKER_ENDPOINT="${ffmpegWorkerEndpoint || 'https://ffmpeg-worker-xyz.a.run.app'}"`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-white select-none">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Firebase & Infrastructure Keys</h2>
              <p className="text-xs text-slate-400">Configure your 8 external environment variables</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Indicator */}
        <div
          className={`p-3 rounded-xl mb-6 flex items-center justify-between text-xs font-mono border ${
            isFirebaseConfigured
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
          }`}
        >
          <span>
            Status: {isFirebaseConfigured ? 'CONNECTED TO: ' + projectId : 'CONTROLLED DEVELOPMENT SANDBOX'}
          </span>
          <a
            href="https://console.firebase.google.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-cyan-400 hover:underline"
          >
            <span>Firebase Console</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* 8 Variable Inputs Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/50 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" />
              <span>1. Firebase Authentication & Firestore (6 Keys)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[11px]">
                  VITE_FIREBASE_API_KEY
                </label>
                <input
                  type="text"
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-[11px] focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[11px]">
                  VITE_FIREBASE_AUTH_DOMAIN
                </label>
                <input
                  type="text"
                  placeholder="project-id.firebaseapp.com"
                  value={authDomain}
                  onChange={(e) => setAuthDomain(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-[11px] focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[11px]">
                  VITE_FIREBASE_PROJECT_ID
                </label>
                <input
                  type="text"
                  placeholder="my-streaming-app"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-[11px] focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[11px]">
                  VITE_FIREBASE_STORAGE_BUCKET
                </label>
                <input
                  type="text"
                  placeholder="project-id.firebasestorage.app"
                  value={storageBucket}
                  onChange={(e) => setStorageBucket(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-[11px] focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[11px]">
                  VITE_FIREBASE_MESSAGING_SENDER_ID
                </label>
                <input
                  type="text"
                  placeholder="123456789012"
                  value={messagingSenderId}
                  onChange={(e) => setMessagingSenderId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-[11px] focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[11px]">
                  VITE_FIREBASE_APP_ID
                </label>
                <input
                  type="text"
                  placeholder="1:123456789012:web:abcdef"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-[11px] focus:outline-hidden focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/50 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5" />
              <span>2. CDN & Remote Video Transcoding Worker (2 Keys)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[11px]">
                  CDN_BASE_URL
                </label>
                <input
                  type="url"
                  placeholder="https://cdn.yepstreamer.com"
                  value={cdnBaseUrl}
                  onChange={(e) => setCdnBaseUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-[11px] focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[11px]">
                  FFMPEG_WORKER_ENDPOINT
                </label>
                <input
                  type="url"
                  placeholder="https://ffmpeg-worker-xyz.a.run.app"
                  value={ffmpegWorkerEndpoint}
                  onChange={(e) => setFfmpegWorkerEndpoint(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-[11px] focus:outline-hidden focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => copyToClipboard(envTemplate, 'env')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedSection === 'env' ? 'Copied to Clipboard!' : 'Copy .env snippet'}</span>
              </button>

              <button
                type="button"
                onClick={handleResetToSandbox}
                className="px-3 py-1.5 bg-slate-800/60 hover:bg-rose-950/50 hover:text-rose-300 rounded-lg text-xs text-slate-400 transition-colors"
              >
                Reset to Sandbox
              </button>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-cyan-950/50"
            >
              Apply & Reload App
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
