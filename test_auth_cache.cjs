require("dotenv").config({ path: ".env" });
const { initializeApp } = require("firebase/app");
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require("firebase/auth");
const { initializeFirestore, doc, getDoc, setDoc, persistentLocalCache, persistentMultipleTabManager } = require("firebase/firestore");
const localFirebaseConfig = require("./firebase-applet-config.json");

const firebaseConfig = {
  apiKey: "AIzaSyCn04t32JuYeOl-xvNklbJ9vNeTK7RGrfg",
  authDomain: "wissenapp-4bce7.firebaseapp.com",
  projectId: "wissenapp-4bce7",
  storageBucket: "wissenapp-4bce7.firebasestorage.app",
  messagingSenderId: "853806293997",
  appId: "1:853806293997:web:a1948456c1b16403e8bde4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
}, localFirebaseConfig.databaseId);

async function run() {
  try {
    const email = "test5_" + Date.now() + "@example.com";
    await createUserWithEmailAndPassword(auth, email, "123456");
    await auth.signOut();
    const cred = await signInWithEmailAndPassword(auth, email, "123456");
    const d = await getDoc(doc(db, "users", cred.user.uid));
    console.log("login getDoc ok");
    process.exit(0);
  } catch (e) {
    console.error("Login Error:", e.message);
    process.exit(1);
  }
}
run();
