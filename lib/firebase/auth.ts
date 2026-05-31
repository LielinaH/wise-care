import { 
  signInWithEmailAndPassword as fbSignIn,
  createUserWithEmailAndPassword as fbRegister,
  signOut as fbSignOut,
  signInWithPopup,
  GoogleAuthProvider,
  UserCredential
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './client';

export const authActions = {
  signIn: async (email: string, password: string): Promise<UserCredential> => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase is not configured. Please add your credentials in .env.local.");
    }
    return fbSignIn(auth, email, password);
  },

  register: async (email: string, password: string): Promise<UserCredential> => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase is not configured. Please add your credentials in .env.local.");
    }
    return fbRegister(auth, email, password);
  },

  signInWithGoogle: async (): Promise<UserCredential> => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase is not configured. Please add your credentials in .env.local.");
    }
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  },

  signOut: async (): Promise<void> => {
    if (!auth) return;
    return fbSignOut(auth);
  }
};

export function getFriendlyAuthErrorMessage(err: any): string {
  const errCode = err?.code || '';
  const errMsg = err?.message || '';

  if (
    errCode === 'auth/invalid-credential' ||
    errCode === 'auth/user-not-found' ||
    errCode === 'auth/wrong-password' ||
    errMsg.includes('auth/invalid-credential') ||
    errMsg.includes('auth/user-not-found') ||
    errMsg.includes('auth/wrong-password')
  ) {
    return 'Invalid email or password. Please try again.';
  }

  if (errCode === 'auth/email-already-in-use' || errMsg.includes('auth/email-already-in-use')) {
    return 'This email address is already in use. Please sign in instead.';
  }

  if (errCode === 'auth/weak-password' || errMsg.includes('auth/weak-password')) {
    return 'Password is too weak. It must be at least 6 characters.';
  }

  if (errCode === 'auth/invalid-email' || errMsg.includes('auth/invalid-email')) {
    return 'Please enter a valid email address.';
  }

  if (errCode === 'auth/popup-closed-by-user' || errMsg.includes('auth/popup-closed-by-user')) {
    return 'The sign-in window was closed before completion. Please try again.';
  }

  if (errCode === 'auth/cancelled-popup-request' || errMsg.includes('auth/cancelled-popup-request')) {
    return 'The sign-in request was cancelled. Please try again.';
  }

  if (errCode === 'auth/network-request-failed' || errMsg.includes('auth/network-request-failed')) {
    return 'Network connection failed. Please check your internet connection.';
  }

  return errMsg || 'An error occurred during authentication.';
}

