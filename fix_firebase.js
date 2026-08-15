import fs from 'fs';
let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');

const newConfigLogic = `
const localModules = import.meta.glob('../../firebase-applet-config.json', { eager: true });
let localConfig = {};
if (localModules['../../firebase-applet-config.json']) {
  localConfig = localModules['../../firebase-applet-config.json'].default || localModules['../../firebase-applet-config.json'];
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || localConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || localConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || localConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || localConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || localConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || localConfig.appId,
};
const firestoreDatabaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || localConfig.firestoreDatabaseId || undefined;
`;

code = code.replace(/const firebaseConfig = \{[\s\S]*?\};\nconst firestoreDatabaseId = [^\n]*;/m, newConfigLogic.trim());

fs.writeFileSync('src/lib/firebase.ts', code);
