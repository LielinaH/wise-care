import { getAdminApp } from '../lib/firebase/admin';
import admin from 'firebase-admin';

async function testConnection() {
  console.log('Testing Firebase Admin SDK connection...');
  
  const app = getAdminApp();
  if (!app) {
    throw new Error('Failed to initialize Admin App');
  }
  console.log('✓ Firebase Admin App initialized.');

  // Test Firestore connection
  console.log('Testing Firestore connection...');
  const db = admin.firestore(app);
  const collections = await db.listCollections();
  console.log('✓ Firestore connection successful. Collections found:');
  collections.forEach(col => console.log(`  - Collection ID: ${col.id}`));

  // Test Auth connection
  console.log('Testing Auth connection...');
  const auth = app.auth();
  const listUsersResult = await auth.listUsers(1);
  console.log('✓ Auth connection successful. Sample users count:', listUsersResult.users.length);

  console.log('\n🎉 Firebase Admin SDK is fully wired and working correctly!');
}

testConnection().catch(err => {
  console.error('❌ Connection test failed:', err);
  process.exit(1);
});
