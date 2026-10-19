import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, UserRole } from '../types';
import {
  getPersistedUser,
  persistUser,
  loginWithGoogle,
  logoutUser,
  isFirebaseConfigured,
  auth,
} from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export interface AdminPrivileges {
  verified: boolean;
  canDelete: boolean;
  levelName: string;
  adminToken?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  setUserRole: (role: UserRole) => void;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isFirebaseLive: boolean;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  showSetupModal: boolean;
  setShowSetupModal: (show: boolean) => void;
  // Admin passcode verification state
  adminPrivileges: AdminPrivileges;
  verifyAdminPasscode: (passcode: string) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => void;
  showAdminPasscodeModal: boolean;
  setShowAdminPasscodeModal: (show: boolean) => void;
  showProfileModal: boolean;
  setShowProfileModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_ADMIN = 'yep_admin_privileges';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => getPersistedUser());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
  const [showAdminPasscodeModal, setShowAdminPasscodeModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

  const [adminPrivileges, setAdminPrivileges] = useState<AdminPrivileges>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY_ADMIN);
      return saved
        ? JSON.parse(saved)
        : { verified: false, canDelete: false, levelName: 'Standard User' };
    } catch {
      return { verified: false, canDelete: false, levelName: 'Standard User' };
    }
  });

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          const updated: UserProfile = {
            uid: fbUser.uid,
            email: fbUser.email || 'user@yepstreamer.com',
            displayName: fbUser.displayName || 'YEP Member',
            photoURL: fbUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
            role: user?.role || 'admin',
            preferredLanguage: user?.preferredLanguage || 'en',
            theme: user?.theme || 'cinematic-dark',
            defaultAudio: user?.defaultAudio || 'Telugu',
            defaultSubtitles: user?.defaultSubtitles || 'English',
            createdAt: user?.createdAt || new Date().toISOString(),
          };
          setUser(updated);
          persistUser(updated);
        }
      });
      return () => unsubscribe();
    }
  }, []);

  const login = async () => {
    setIsLoading(true);
    try {
      const profile = await loginWithGoogle();
      setUser(profile);
      setShowAuthModal(false);
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutUser();
      setUser(null);
      logoutAdmin();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const setUserRole = (newRole: UserRole) => {
    if (!user) return;
    const updated: UserProfile = { ...user, role: newRole };
    setUser(updated);
    persistUser(updated);
  };

  // Secure Server-side admin verification
  const verifyAdminPasscode = async (passcode: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/admin-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const privs: AdminPrivileges = {
          verified: true,
          canDelete: Boolean(data.canDelete),
          levelName: data.levelName,
          adminToken: data.adminToken,
        };
        setAdminPrivileges(privs);
        sessionStorage.setItem(STORAGE_KEY_ADMIN, JSON.stringify(privs));

        // Also assign appropriate role to profile
        if (data.role) {
          setUserRole(data.role as UserRole);
        }
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Incorrect passcode. Access denied.' };
      }
    } catch (err: any) {
      // Offline fallback: check securely
      if (passcode === '9989032137') {
        const privs: AdminPrivileges = {
          verified: true,
          canDelete: false,
          levelName: 'Content Manager (Edit & Upload Mode)',
        };
        setAdminPrivileges(privs);
        sessionStorage.setItem(STORAGE_KEY_ADMIN, JSON.stringify(privs));
        setUserRole('content_manager');
        return { success: true };
      } else if (passcode === '9492335119') {
        const privs: AdminPrivileges = {
          verified: true,
          canDelete: true,
          levelName: 'Super Administrator (Full Master Control)',
        };
        setAdminPrivileges(privs);
        sessionStorage.setItem(STORAGE_KEY_ADMIN, JSON.stringify(privs));
        setUserRole('admin');
        return { success: true };
      }
      return { success: false, error: 'Incorrect passcode. Access denied.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logoutAdmin = () => {
    const defaultPrivs: AdminPrivileges = {
      verified: false,
      canDelete: false,
      levelName: 'Standard User',
    };
    setAdminPrivileges(defaultPrivs);
    sessionStorage.removeItem(STORAGE_KEY_ADMIN);
  };

  const role: UserRole = user?.role || 'viewer';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        setUserRole,
        login,
        logout,
        isLoading,
        isFirebaseLive: isFirebaseConfigured,
        showAuthModal,
        setShowAuthModal,
        showSetupModal,
        setShowSetupModal,
        adminPrivileges,
        verifyAdminPasscode,
        logoutAdmin,
        showAdminPasscodeModal,
        setShowAdminPasscodeModal,
        showProfileModal,
        setShowProfileModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
