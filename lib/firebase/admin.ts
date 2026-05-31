import admin from 'firebase-admin';

export function getAdminApp(): admin.app.App {
  if (admin.apps.length > 0) {
    const app = admin.apps[0];
    if (app) return app;
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  // Check if we are running in a Firebase Auth/Firestore emulator environment
  const isEmulator = process.env.FIREBASE_AUTH_EMULATOR_HOST || process.env.FIRESTORE_EMULATOR_HOST;

  if (isEmulator) {
    return admin.initializeApp({
      projectId,
    });
  }

  if (clientEmail && privateKey) {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  }

  // Fallback: Initialize using Application Default Credentials
  // This automatically works in environments like Google Cloud Run / Functions without keys.
  return admin.initializeApp({
    projectId,
  });
}
