/* eslint-disable */
const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, updateDoc } = require('firebase/firestore');

// Read .env.local manually to get Firebase credentials
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error("Error: .env.local file not found at " + envPath);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    // Remove surrounding quotes if present
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    env[match[1]] = value.trim();
  }
});

const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error("Error: Firebase credentials not found in .env.local");
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.length < 2) {
  console.log("Usage: node scripts/make-admin.js <email> <password>");
  process.exit(1);
}

const email = args[0];
const password = args[1];

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log(`Attempting to sign in as ${email}...`);

signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    const uid = userCredential.user.uid;
    console.log(`Successfully signed in. UID: ${uid}`);
    console.log("Updating role in Firestore...");
    const userDocRef = doc(db, 'users', uid);
    return updateDoc(userDocRef, {
      role: 'admin'
    });
  })
  .then(() => {
    console.log("Success! Role successfully updated to 'admin'.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error occurred:", error.message);
    process.exit(1);
  });
