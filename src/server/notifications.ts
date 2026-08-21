import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Initialize firebase-admin if not already initialized
if (getApps().length === 0) {
  try {
    const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccountStr) {
      const serviceAccount = JSON.parse(serviceAccountStr);
      initializeApp({
        credential: cert(serviceAccount)
      });
    } else {
      console.warn("FIREBASE_SERVICE_ACCOUNT not set in environment");
    }
  } catch (err) {
    console.error("Failed to initialize firebase-admin:", err);
  }
}

export const adminMessaging = getApps().length > 0 ? getMessaging() : null;
export const adminAuth = getApps().length > 0 ? getAuth() : null;
export const adminDb = getApps().length > 0 ? getFirestore() : null;
export { FieldValue };
