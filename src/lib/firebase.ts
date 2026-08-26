import { getStorage } from 'firebase/storage';
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  setLogLevel,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  addDoc,
  limit,
} from "firebase/firestore";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import localFirebaseConfig from "../../firebase-applet-config.json";

const configAny =
  (localFirebaseConfig as any).default || (localFirebaseConfig as any);
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || configAny.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || configAny.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || configAny.projectId,
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || configAny.storageBucket,
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    configAny.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || configAny.appId,
};
const firestoreDatabaseId =
  import.meta.env.VITE_FIREBASE_DATABASE_ID ||
  configAny.firestoreDatabaseId ||
  undefined;

// Tarmoq uzilishi ogohlantirishlarini yashirish
setLogLevel("silent");

console.log("Final Firebase Config:", firebaseConfig);
export const app = initializeApp(firebaseConfig);
const secondaryApp = initializeApp(firebaseConfig, "Secondary");

import { initializeFirestore } from "firebase/firestore";
export const db = initializeFirestore(
  app,
  { experimentalAutoDetectLongPolling: true },
  firestoreDatabaseId,
);

export const auth = getAuth(app);
export const secondaryAuth = getAuth(secondaryApp);

export {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  addDoc,
  limit,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
};

export const storage = getStorage(app);
