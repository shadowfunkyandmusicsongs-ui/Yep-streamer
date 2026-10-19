import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { UserProfile, UserRole } from '../types';

const getCustomConfig = () => {
  try {
    const saved = localStorage.getItem('yep_streamer_firebase_custom_config');
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const custom = getCustomConfig();

export const firebaseConfig = {
  apiKey: custom.apiKey || import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: custom.authDomain || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: custom.projectId || import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: custom.storageBucket || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: custom.messagingSenderId || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: custom.appId || import.meta.env.VITE_FIREBASE_APP_ID || '',
  cdnBaseUrl: custom.cdnBaseUrl || import.meta.env.CDN_BASE_URL || '',
  ffmpegWorkerEndpoint: custom.ffmpegWorkerEndpoint || import.meta.env.FFMPEG_WORKER_ENDPOINT || '',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'AIzaSyPlaceholderKeyForYepStreamer' &&
  firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.info('[YEP Streamer] Firebase successfully initialized with project:', firebaseConfig.projectId);
  } catch (error) {
    console.warn('[YEP Streamer] Firebase initialization error, switching to controlled local state:', error);
  }
}

export { app, auth, db, storage };

const STORAGE_KEY_USER = 'yep_streamer_user';
const STORAGE_KEY_CONFIG = 'yep_streamer_firebase_custom_config';

// Fallback / Development User profile persistence
export function getPersistedUser(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }

  const defaultProfile: UserProfile = {
    uid: 'yep-user-shadow',
    email: 'shadowfunkyandmusicsongs@gmail.com',
    displayName: 'Shadow Commander',
    photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    role: 'admin',
    preferredLanguage: 'en',
    theme: 'cinematic-dark',
    defaultAudio: 'Telugu',
    defaultSubtitles: 'English',
    createdAt: new Date().toISOString(),
  };

  persistUser(defaultProfile);
  return defaultProfile;
}

export function persistUser(user: UserProfile | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY_USER);
  }
}

export async function loginWithGoogle(): Promise<UserProfile> {
  if (isFirebaseConfigured && auth) {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    const result = await signInWithPopup(auth, provider);
    const fbUser = result.user;

    const profile: UserProfile = {
      uid: fbUser.uid,
      email: fbUser.email || 'user@yepstreamer.com',
      displayName: fbUser.displayName || 'YEP Member',
      photoURL: fbUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      role: 'creator', // Default role for testing creator features
      preferredLanguage: 'en',
      theme: 'cinematic-dark',
      defaultAudio: 'Telugu',
      defaultSubtitles: 'English',
      createdAt: new Date().toISOString(),
    };
    persistUser(profile);
    return profile;
  }

  // Controlled development fallback with Google user simulation
  // This preserves usability when Firebase project is awaiting user console provisioning
  const demoProfile: UserProfile = {
    uid: 'google-oauth-demo-user-101',
    email: 'creator.shadow@yepstreamer.com',
    displayName: 'Shadow Commander (Creator & Admin)',
    photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    role: 'admin', // Start as Admin for full exploration of Studio & Admin Dashboard
    preferredLanguage: 'en',
    theme: 'cinematic-dark',
    defaultAudio: 'Telugu',
    defaultSubtitles: 'English',
    createdAt: new Date().toISOString(),
  };
  persistUser(demoProfile);
  return demoProfile;
}

export async function logoutUser(): Promise<void> {
  if (isFirebaseConfigured && auth) {
    await fbSignOut(auth);
  }
  persistUser(null);
}

export function saveCustomFirebaseConfig(config: typeof firebaseConfig) {
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  window.location.reload();
}
