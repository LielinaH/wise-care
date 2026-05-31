'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, UserCredential } from 'firebase/auth';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase/client';
import { doc, onSnapshot } from 'firebase/firestore';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { authActions } from '@/lib/firebase/auth';
import { UserRecord } from '@/lib/firebase/types';
import { storage } from '@/lib/storage';

interface AuthContextType {
  currentUser: any | null;
  userProfile: UserRecord | null;
  role: 'patient' | 'provider_org' | 'solo_provider' | 'admin' | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserCredential | any>;
  register: (email: string, password: string, role?: 'patient' | 'provider_org' | 'solo_provider' | 'admin') => Promise<UserCredential | any>;
  signInWithGoogle: () => Promise<UserCredential | any>;
  signOut: () => Promise<void>;
  isFirebaseMode: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  role: null,
  loading: true,
  signIn: async () => {},
  register: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
  isFirebaseMode: false,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<UserRecord | null>(null);
  const [role, setRole] = useState<'patient' | 'provider_org' | 'solo_provider' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);

  const isFirebaseMode = isFirebaseConfigured;

  useEffect(() => {
    if (!isFirebaseMode) {
      // LocalStorage Fallback Mode
      const storedRole = storage.getRole() as any;
      const mappedRole = ['patient', 'provider_org', 'solo_provider', 'admin'].includes(storedRole)
        ? storedRole
        : (storedRole === 'provider' 
          ? 'solo_provider' 
          : storedRole === 'org' 
            ? 'provider_org' 
            : 'patient'); // Default fallback

      setCurrentUser({
        uid: 'demo-local-uid',
        email: `${mappedRole}.demo@wisecare.test`,
        displayName: 'Demo Account',
      });
      setUserProfile({
        uid: 'demo-local-uid',
        email: `${mappedRole}.demo@wisecare.test`,
        displayName: 'Demo Account',
        role: mappedRole,
        onboardingComplete: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setRole(mappedRole);
      setLoading(false);
      return;
    }

    // Firebase Auth Mode
    if (!auth) {
      setLoading(false);
      return;
    }

    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      // Clean up previous profile listener if any
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (user) {
        setCurrentUser(user);
        
        // Listen to profile in real-time
        if (db) {
          unsubscribeProfile = onSnapshot(
            doc(db, 'users', user.uid),
            (snap) => {
              if (snap.exists()) {
                const profile = snap.data() as UserRecord;
                setUserProfile(profile);
                setRole(profile.role);
              } else {
                setUserProfile(null);
                setRole(null);
              }
              setLoading(false);
            },
            (err) => {
              console.error("Error reading user profile snapshot:", err);
              setLoading(false);
            }
          );
        } else {
          setLoading(false);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        setRole(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, [isFirebaseMode]);

  const signIn = async (email: string, password: string) => {
    if (!isFirebaseMode) {
      // Handle login for local fallback mode
      // Deduce role from email (e.g. patient.demo@wisecare.test -> patient)
      let roleChoice: 'patient' | 'provider_org' | 'solo_provider' | 'admin' = 'patient';
      if (email.startsWith('patient')) roleChoice = 'patient';
      else if (email.startsWith('clinic')) roleChoice = 'provider_org';
      else if (email.startsWith('clinician')) roleChoice = 'solo_provider';
      else if (email.startsWith('admin')) roleChoice = 'admin';

      storage.setRole(roleChoice);
      const user = { uid: 'demo-local-uid', email, displayName: 'Demo Account' };
      setCurrentUser(user);
      setUserProfile({
        uid: 'demo-local-uid',
        email,
        displayName: 'Demo Account',
        role: roleChoice,
        onboardingComplete: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setRole(roleChoice);
      return { user };
    }
    return authActions.signIn(email, password);
  };

  const register = async (email: string, password: string, selectedRole?: 'patient' | 'provider_org' | 'solo_provider' | 'admin') => {
    if (!isFirebaseMode) {
      const roleChoice = selectedRole || 'patient';
      storage.setRole(roleChoice);
      const user = { uid: 'demo-local-uid', email, displayName: 'Demo Account' };
      setCurrentUser(user);
      setUserProfile({
        uid: 'demo-local-uid',
        email,
        displayName: 'Demo Account',
        role: roleChoice,
        onboardingComplete: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setRole(roleChoice);
      return { user };
    }
    return authActions.register(email, password);
  };

  const signInWithGoogle = async () => {
    if (!isFirebaseMode) {
      const user = { uid: 'demo-local-uid', email: 'patient.demo@wisecare.test', displayName: 'Google Demo User' };
      setCurrentUser(user);
      setUserProfile({
        uid: 'demo-local-uid',
        email: 'patient.demo@wisecare.test',
        displayName: 'Google Demo User',
        role: 'patient',
        onboardingComplete: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setRole('patient');
      return { user };
    }
    return authActions.signInWithGoogle();
  };

  const signOut = async () => {
    if (!isFirebaseMode) {
      setCurrentUser(null);
      setUserProfile(null);
      setRole(null);
      return;
    }
    await authActions.signOut();
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      userProfile,
      role,
      loading,
      signIn,
      register,
      signInWithGoogle,
      signOut,
      isFirebaseMode
    }}>
      {children}
    </AuthContext.Provider>
  );
}
