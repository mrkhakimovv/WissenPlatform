require("dotenv").config({ path: ".env" });
const { initializeApp } = require("firebase/app");
const { getAuth, createUserWithEmailAndPassword } = require("firebase/auth");
const { initializeFirestore, collection, getDocs, doc, setDoc } = require("firebase/firestore");
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
    const email = "test2_" + Date.now() + "@example.com";
    const cred = await createUserWithEmailAndPassword(auth, email, "123456");
    console.log("Email:", email);
    await setDoc(doc(db, "users", cred.user.uid), { role: "admin", email: email });
    const snap = await getDocs(collection(db, "users"));
    console.log("Users count:", snap.size);
    process.exit(0);
  } catch (e) {
    console.error("Error:", e);
    process.exit(1);
  }
}
run();
