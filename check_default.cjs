require("dotenv").config({ path: ".env" });
const { initializeApp } = require("firebase/app");
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require("firebase/auth");
const { initializeFirestore, collection, getDocs } = require("firebase/firestore");
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
const db = initializeFirestore(app, {}, undefined);

async function run() {
  try {
    const cred = await createUserWithEmailAndPassword(auth, "test6_" + Date.now() + "@example.com", "123456");
    const snap = await getDocs(collection(db, "users"));
    console.log("Found in default:", snap.size);
    process.exit(0);
  } catch (e) {
    console.error("Error:", e.message);
    process.exit(1);
  }
}
run();
