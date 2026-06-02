const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

// Read .env.local
const envPath = path.join(__dirname, '..', '.env.local');
console.log('Reading .env.local from:', envPath);
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (e) {
  console.error('Failed to read .env.local:', e);
  process.exit(1);
}

const env = {};
envContent.split('\n').forEach(line => {
  const cleanLine = line.trim();
  if (!cleanLine || cleanLine.startsWith('#')) return;
  const eqIdx = cleanLine.indexOf('=');
  if (eqIdx === -1) return;
  const key = cleanLine.substring(0, eqIdx).trim();
  let val = cleanLine.substring(eqIdx + 1).trim();
  
  // Strip quotes if present
  if (val.startsWith('"') && val.endsWith('"')) {
    val = val.substring(1, val.length - 1);
  }
  env[key] = val;
});

// Set env variables
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
process.env.FIREBASE_CLIENT_EMAIL = env.FIREBASE_CLIENT_EMAIL;
process.env.FIREBASE_PRIVATE_KEY = env.FIREBASE_PRIVATE_KEY;

// Initialize Firebase Admin
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!clientEmail || !privateKey) {
  console.error('ERROR: Missing clientEmail or privateKey in env!');
  process.exit(1);
}

const cleanPrivateKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId,
    clientEmail,
    privateKey: cleanPrivateKey,
  }),
});

const auth = admin.auth();
const db = admin.firestore();

const targetEmail = 'solo@solo.solo';

async function run() {
  console.log(`Searching for user with email: ${targetEmail}...`);
  let userRecord = null;
  try {
    userRecord = await auth.getUserByEmail(targetEmail);
    console.log('User found in Firebase Auth!');
    console.log('UID:', userRecord.uid);
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      console.log('User not found in Firebase Auth.');
    } else {
      console.error('Error fetching user:', err);
    }
  }

  if (userRecord) {
    const uid = userRecord.uid;
    console.log(`Attempting to delete user ${uid} from Firebase Auth...`);
    try {
      await auth.deleteUser(uid);
      console.log('Successfully deleted user from Firebase Auth.');
    } catch (e) {
      console.error('Error deleting user from Auth:', e);
    }

    console.log('Checking and cleaning up Firestore documents...');
    // Delete from users collection
    try {
      await db.collection('users').doc(uid).delete();
      console.log('Deleted users doc.');
    } catch (e) {
      console.error('Error deleting users doc:', e);
    }

    // Delete from soloProviders collection
    try {
      await db.collection('soloProviders').doc(uid).delete();
      console.log('Deleted soloProviders doc.');
    } catch (e) {
      console.error('Error deleting solo provider doc:', e);
    }

    // Delete from patients collection
    try {
      await db.collection('patients').doc(uid).delete();
      console.log('Deleted patients doc.');
    } catch (e) {
      console.error('Error deleting patient doc:', e);
    }

    // Delete from providerOrganizations collection
    try {
      await db.collection('providerOrganizations').doc(uid).delete();
      console.log('Deleted providerOrganizations doc.');
    } catch (e) {
      console.error('Error deleting org doc:', e);
    }
  } else {
    console.log('No user found in Auth. Scanning for orphaned Firestore documents...');
    const usersSnap = await db.collection('users').where('email', '==', targetEmail).get();
    if (!usersSnap.empty) {
      console.log(`Found ${usersSnap.size} orphaned Firestore users record(s) for ${targetEmail}. Cleaning up...`);
      for (const doc of usersSnap.docs) {
        const uid = doc.id;
        console.log(`Deleting Firestore records for ${uid}...`);
        await db.collection('users').doc(uid).delete();
        await db.collection('soloProviders').doc(uid).delete();
        await db.collection('patients').doc(uid).delete();
        await db.collection('providerOrganizations').doc(uid).delete();
      }
    } else {
      console.log('No orphaned Firestore users records found.');
    }
  }

  console.log('Cleanup completed successfully.');
}

run().catch(console.error);
