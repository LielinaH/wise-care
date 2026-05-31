import { getAdminApp } from '../lib/firebase/admin';

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Please provide an email address. Usage: npx tsx --env-file=.env.local scripts/delete-auth-user.ts <email>');
    process.exit(1);
  }

  console.log(`Looking up user with email "${email}" in Firebase Authentication...`);
  
  const app = getAdminApp();
  if (!app) {
    console.error('Failed to initialize Firebase Admin SDK. Please check your .env.local file.');
    process.exit(1);
  }

  const auth = app.auth();
  try {
    const user = await auth.getUserByEmail(email);
    console.log(`Found user: UID=${user.uid}, Email=${user.email}. Deleting...`);
    
    await auth.deleteUser(user.uid);
    console.log(`✓ Successfully deleted user "${email}" from Firebase Authentication.`);
  } catch (err: any) {
    if (err.code === 'auth/user-not-found') {
      console.log(`❌ User with email "${email}" does not exist in Firebase Authentication.`);
    } else {
      console.error('Error occurred:', err.message || err);
      process.exit(1);
    }
  }
}

main();
