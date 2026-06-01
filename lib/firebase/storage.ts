import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firebaseStorage, isFirebaseConfigured } from './client';
import { FileMetadata } from './types';

/**
 * Uploads a file to Firebase Storage under the providers path.
 * If Firebase Storage is not configured or the upload fails, it falls back
 * to generating local mock metadata so the application continues to function in demo mode.
 */
export async function uploadProviderFile(
  userId: string,
  type: 'photo' | 'logo' | 'credential' | 'licensure',
  file: File
): Promise<FileMetadata> {
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `providers/${userId}/${type}/${Date.now()}_${sanitizedFileName}`;

  // If Firebase is configured and storage client is ready, try real upload
  if (isFirebaseConfigured && firebaseStorage) {
    try {
      const storageRef = ref(firebaseStorage, storagePath);
      // Perform upload
      const snapshot = await uploadBytes(storageRef, file);
      // Retrieve public download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      return {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        uploadedBy: userId,
        demoOnly: false,
        storagePath: storagePath,
        downloadURL: downloadURL,
      };
    } catch (e) {
      console.warn("Firebase Storage upload failed, falling back to mock metadata: ", e);
    }
  }

  // Graceful fallback to demo-only mock metadata (no object URLs stored in Firestore)
  return {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    uploadedAt: new Date().toISOString(),
    uploadedBy: userId,
    demoOnly: true,
    storagePath: null,
    downloadURL: null,
  };
}
