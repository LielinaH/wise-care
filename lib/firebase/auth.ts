import { 
  signInWithEmailAndPassword as fbSignIn,
  createUserWithEmailAndPassword as fbRegister,
  signOut as fbSignOut,
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

  signOut: async (): Promise<void> => {
    if (!auth) return;
    return fbSignOut(auth);
  }
};
