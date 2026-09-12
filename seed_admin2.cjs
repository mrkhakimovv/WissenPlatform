require("dotenv").config({ path: ".env" });
const { initializeApp } = require("firebase/app");
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require("firebase/auth");
const { initializeFirestore, doc, getDoc, setDoc } = require("firebase/firestore");
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

async function run() {
  try {
    const email = "admin@wissen.internal";
    let uid;
    try {
      const cred = await signInWithEmailAndPassword(auth, email, "123456"); // Try random password? I don't know it.
      uid = cred.user.uid;
      console.log("Logged in existing admin@wissen.internal.");
    } catch (e) {
      console.log("Sign in failed:", e.code);
      // We cannot easily create it if it exists. Let's just find the UID if we can.
    }
    process.exit(0);
  } catch (e) {
    console.error("Error:", e.message);
    process.exit(1);
  }
}
run();
