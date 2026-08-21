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

// MUHIM: Client (firebase.ts) nomlangan (named) Firestore bazasidan foydalanadi
// (VITE_FIREBASE_DATABASE_ID -> initializeFirestore). Agar server bu yerda
// getFirestore() ni database ID'siz chaqirsa, u "(default)" bazaga ulanadi —
// u mavjud bo'lmasligi mumkin va natijada "5 NOT_FOUND" xatosi chiqadi.
// Shuning uchun serverda ham xuddi shu database ID'ni ishlatamiz.
const databaseId = process.env.FIREBASE_DATABASE_ID || process.env.VITE_FIREBASE_DATABASE_ID || '';
// Diagnostika: server qaysi Firestore bazasiga ulanayotganini logga yozamiz.
// Render logida "(default)" ko'rinsa — env o'zgaruvchisi o'rnatilmagan degani.
console.log('[notifications] Firestore databaseId:', databaseId || '(default)');
export const adminDb = getApps().length > 0
  ? (databaseId ? getFirestore(databaseId) : getFirestore())
  : null;
export { FieldValue };