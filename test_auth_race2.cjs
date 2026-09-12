require("dotenv").config({ path: ".env" });
const { initializeApp } = require("firebase/app");
const { getAuth, signInWithEmailAndPassword, onAuthStateChanged, createUserWithEmailAndPassword } = require("firebase/auth");
const { initializeFirestore, doc, getDoc, onSnapshot, setDoc } = require("firebase/firestore");
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
        console.log("onAuthStateChanged: user is here!");
        const ref = doc(db, 'users', user.uid);
        try {
            const d = await getDoc(ref);
            console.log("onAuthStateChanged: getDoc ok");
        } catch(e) {
            console.log("onAuthStateChanged: getDoc error", e.message);
        }
        onSnapshot(ref, (snap) => {
            console.log("onSnapshot fired");
        }, (err) => {
            console.log("onSnapshot error", err.message);
        });
    } else {
        console.log("onAuthStateChanged: no user");
    }
});

async function run() {
  try {
    const email = "test4_" + Date.now() + "@example.com";
    await createUserWithEmailAndPassword(auth, email, "123456");
    console.log("Created user, waiting...");
    await new Promise(r => setTimeout(r, 2000));
    await auth.signOut();
    console.log("Signing in...");
    const cred = await signInWithEmailAndPassword(auth, email, "123456");
    console.log("Sign in complete, awaiting getDoc...");
    const d = await getDoc(doc(db, "users", cred.user.uid));
    console.log("login getDoc ok");
    setTimeout(() => process.exit(0), 2000);
  } catch (e) {
    console.error("Login Error:", e.message);
    process.exit(1);
  }
}
run();
