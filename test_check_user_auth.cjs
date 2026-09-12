require("dotenv").config({ path: ".env" });
const { initializeApp } = require("firebase/app");
const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");
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
const db = initializeFirestore(app, {}, localFirebaseConfig.databaseId);

async function run() {
  try {
    const cred = await signInWithEmailAndPassword(auth, "test1726132072175@example.com", "123456");
    const snap = await getDocs(collection(db, "users"));
    console.log("Users count:", snap.size);
    snap.forEach(d => {
        console.log(d.id, "=>", d.data().email, d.data().role);
    });
    process.exit(0);
  } catch (e) {
    console.error("Error:", e);
    process.exit(1);
  }
}
run();
