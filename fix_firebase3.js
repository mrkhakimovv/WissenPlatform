import fs from 'fs';

// 1. Edit package.json to add prebuild
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.scripts.prebuild = "node -e \"const fs=require('fs'); if(!fs.existsSync('firebase-applet-config.json')) fs.writeFileSync('firebase-applet-config.json', '{}');\"";
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));

// 2. Edit firebase.ts
const firebaseCode = `import { initializeApp } from 'firebase/app';
import { getFirestore, setLogLevel, collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, orderBy, addDoc, limit } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import localFirebaseConfig from '../../firebase-applet-config.json';

const configAny = localFirebaseConfig as any;
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || configAny.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || configAny.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || configAny.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || configAny.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || configAny.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || configAny.appId,
};
const firestoreDatabaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || configAny.firestoreDatabaseId || undefined;

// Tarmoq uzilishi ogohlantirishlarini yashirish
setLogLevel('error');

const app = initializeApp(firebaseConfig);
const secondaryApp = initializeApp(firebaseConfig, 'Secondary');

export const db = getFirestore(app, firestoreDatabaseId);
export const auth = getAuth(app);
export const secondaryAuth = getAuth(secondaryApp);

export { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, orderBy, addDoc, limit, signInWithEmailAndPassword, onAuthStateChanged, signOut, createUserWithEmailAndPassword };
`;

fs.writeFileSync('src/lib/firebase.ts', firebaseCode);
