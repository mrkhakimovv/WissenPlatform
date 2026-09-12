require("dotenv").config({ path: ".env" });
const { initializeApp } = require("firebase/app");
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } = require("firebase/auth");
const { initializeFirestore, doc, getDoc, onSnapshot } = require("firebase/firestore");
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
const db = initializeFirestore(app, {}, localFirebaseConfig.databaseId);

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const ref = doc(db, 'users', user.uid);
        onSnapshot(ref, (snap) => {
            if (!snap.exists()) {
                console.log("onSnapshot: doc missing! Signing out.");
                signOut(auth);
            }
        });
    }
});

async function run() {
  try {
    const email = "missing_" + Date.now() + "@example.com";
    await createUserWithEmailAndPassword(auth, email, "123456");
    await auth.signOut();
    
    console.log("Signing in...");
    const cred = await signInWithEmailAndPassword(auth, email, "123456");
    
    console.log("Waiting a tiny bit, then getDoc...");
    await new Promise(r => setTimeout(r, 100)); // simulate network delay of getDoc
    const d = await getDoc(doc(db, "users", cred.user.uid));
    
  } catch (e) {
    console.error("Login Error:", e.message);
    process.exit(1);
  }
  process.exit(0);
}
run();
