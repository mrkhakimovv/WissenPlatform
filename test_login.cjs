require("dotenv").config({ path: ".env" });
const { initializeApp } = require("firebase/app");
const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");
const { initializeFirestore, doc, getDoc } = require("firebase/firestore");
const localFirebaseConfig = require("./firebase-applet-config.json");

const configAny = (localFirebaseConfig).default || localFirebaseConfig;
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || configAny.apiKey,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || configAny.authDomain,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || configAny.projectId,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || configAny.storageBucket,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || configAny.messagingSenderId,
  appId: process.env.VITE_FIREBASE_APP_ID || configAny.appId,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = initializeFirestore(app, {}, process.env.VITE_FIREBASE_DATABASE_ID || configAny.databaseId);

async function run() {
  try {
    console.log("Signing in...");
    const cred = await signInWithEmailAndPassword(auth, "khakimovvv2107@gmail.com", "123456");
    console.log("Signed in with uid:", cred.user.uid);
    const d = await getDoc(doc(db, "users", cred.user.uid));
    console.log("Doc exists:", d.exists());
    if (d.exists()) {
        console.log("Data:", d.data());
    }
    process.exit(0);
  } catch (e) {
    console.error("Login Error:", e.message);
    process.exit(1);
  }
}
run();
