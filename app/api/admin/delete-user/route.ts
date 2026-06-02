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

    // 3. Query all related Firestore documents to delete
    const refsToDelete: admin.firestore.DocumentReference[] = [];

    // Add primary user profile documents
    refsToDelete.push(userDocRef);
    refsToDelete.push(db.collection('patients').doc(uid));
    refsToDelete.push(db.collection('soloProviders').doc(uid));
    refsToDelete.push(db.collection('providerOrganizations').doc(uid));

    // Query referrals (both where patientId or providerId matches)
    const [referralsPatientSnap, referralsProviderSnap] = await Promise.all([
      db.collection('referrals').where('patientId', '==', uid).get(),
      db.collection('referrals').where('providerId', '==', uid).get(),
    ]);

    const referralIds = new Set<string>();
    const referralDocs: admin.firestore.QueryDocumentSnapshot[] = [];

    for (const snap of [referralsPatientSnap, referralsProviderSnap]) {
      for (const doc of snap.docs) {
        if (!referralIds.has(doc.id)) {
          referralIds.add(doc.id);
          referralDocs.push(doc);
        }
      }
    }

    // Add referrals to deletion list
    for (const doc of referralDocs) {
      refsToDelete.push(doc.ref);
    }

    // Query messages under each referral
    if (referralDocs.length > 0) {
      const messagesSnaps = await Promise.all(
        referralDocs.map(doc => 
          db.collection('referrals').doc(doc.id).collection('messages').get()
        )
      );
      for (const snap of messagesSnaps) {
        for (const doc of snap.docs) {
          refsToDelete.push(doc.ref);
        }
      }
    }

    // Query supportPlans (patientId or providerId matches)
    const [supportPlansPatientSnap, supportPlansProviderSnap] = await Promise.all([
      db.collection('supportPlans').where('patientId', '==', uid).get(),
      db.collection('supportPlans').where('providerId', '==', uid).get(),
    ]);

    const planIds = new Set<string>();
    for (const snap of [supportPlansPatientSnap, supportPlansProviderSnap]) {
      for (const doc of snap.docs) {
        if (!planIds.has(doc.id)) {
          planIds.add(doc.id);
          refsToDelete.push(doc.ref);
        }
      }
    }

    // Query followUps where patientId matches
    const followUpsSnap = await db.collection('followUps').where('patientId', '==', uid).get();
    for (const doc of followUpsSnap.docs) {
      refsToDelete.push(doc.ref);
    }

    // Query careRoutes where patientId matches
    const careRoutesSnap = await db.collection('careRoutes').where('patientId', '==', uid).get();
    for (const doc of careRoutesSnap.docs) {
      refsToDelete.push(doc.ref);
    }

    // Query carePackets where patientId matches
    const carePacketsSnap = await db.collection('carePackets').where('patientId', '==', uid).get();
    for (const doc of carePacketsSnap.docs) {
      refsToDelete.push(doc.ref);
    }

    // Query providerVerificationRequests (providerId or submittedBy matches)
    const [verifyProviderSnap, verifySubmitSnap] = await Promise.all([
      db.collection('providerVerificationRequests').where('providerId', '==', uid).get(),
      db.collection('providerVerificationRequests').where('submittedBy', '==', uid).get(),
    ]);

    const verifyIds = new Set<string>();
    for (const snap of [verifyProviderSnap, verifySubmitSnap]) {
      for (const doc of snap.docs) {
        if (!verifyIds.has(doc.id)) {
          verifyIds.add(doc.id);
          refsToDelete.push(doc.ref);
        }
      }
    }

    // 4. Batch delete all gathered document references in chunks of 400
    const chunkSize = 400;
    for (let i = 0; i < refsToDelete.length; i += chunkSize) {
      const chunk = refsToDelete.slice(i, i + chunkSize);
      const deleteBatch = db.batch();
      for (const ref of chunk) {
        deleteBatch.delete(ref);
      }
      await deleteBatch.commit();
    }

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
