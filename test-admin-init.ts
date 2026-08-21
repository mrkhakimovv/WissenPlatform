import { initializeApp, getApps, cert } from 'firebase-admin/app';
const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
if (serviceAccountStr) {
  try {
    initializeApp({
      credential: cert(JSON.parse(serviceAccountStr))
    });
    console.log("Firebase Admin Initialized successfully! Apps count:", getApps().length);
  } catch (e) {
    console.log("Error initializing:", e.message);
  }
} else {
  console.log("No service account string found");
}
