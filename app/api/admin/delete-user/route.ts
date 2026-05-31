import { NextResponse } from 'next/server';
import { getAdminApp } from '@/lib/firebase/admin';
import admin from 'firebase-admin';

export async function POST(request: Request) {
  try {
    const { uid } = await request.json();

    if (!uid || typeof uid !== 'string') {
      return NextResponse.json({ error: 'Invalid UID parameter' }, { status: 400 });
    }

    // Initialize Admin SDK
    const app = getAdminApp();
    if (!app) {
      return NextResponse.json({ error: 'Failed to initialize Firebase Admin app.' }, { status: 500 });
    }
    const auth = app.auth();
    const db = admin.firestore(app);

    // 1. Fetch user profile from Firestore to determine their role
    const userDocRef = db.collection('users').doc(uid);
    const userSnap = await userDocRef.get();
    let role = null;
    if (userSnap.exists) {
      role = userSnap.data()?.role;
    }

    // 2. Delete user from Firebase Authentication
    try {
      await auth.deleteUser(uid);
    } catch (authError: any) {
      // If the user doesn't exist in Auth, we can ignore and clean up Firestore anyway
      if (authError.code !== 'auth/user-not-found') {
        throw authError;
      }
    }

    // 3. Delete Firestore documents in an atomic batch
    const batch = db.batch();
    
    // Delete role-specific profile document
    if (role === 'patient') {
      batch.delete(db.collection('patients').doc(uid));
    } else if (role === 'solo_provider') {
      batch.delete(db.collection('soloProviders').doc(uid));
    } else if (role === 'provider_org') {
      batch.delete(db.collection('providerOrganizations').doc(uid));
    } else {
      // Fallback: If role is unknown or document is missing, try deleting from all collections to be safe
      batch.delete(db.collection('patients').doc(uid));
      batch.delete(db.collection('soloProviders').doc(uid));
      batch.delete(db.collection('providerOrganizations').doc(uid));
    }

    // Delete primary users record
    batch.delete(userDocRef);

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in administrative account deletion:', error);
    
    // Check if error is due to missing credentials
    if (error.message && error.message.includes('credential')) {
      return NextResponse.json({ 
        error: 'Firebase Admin credentials missing. Please set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in your .env.local file.' 
      }, { status: 500 });
    }

    return NextResponse.json({ error: error.message || 'Failed to delete account' }, { status: 500 });
  }
}
