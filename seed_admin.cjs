require("dotenv").config({ path: ".env" });
const { initializeApp } = require("firebase/app");
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require("firebase/auth");
const { initializeFirestore, doc, setDoc } = require("firebase/firestore");
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
    const email = "khakimovvv2107@gmail.com";
    let uid;
    try {
      const cred = await signInWithEmailAndPassword(auth, email, "123456");
      uid = cred.user.uid;
      console.log("Logged in existing auth user.");
    } catch (e) {
      const cred = await createUserWithEmailAndPassword(auth, email, "123456");
      uid = cred.user.uid;
      console.log("Created new auth user.");
    }
    
    await setDoc(doc(db, "users", uid), {
      username: "admin",
      email: email,
      fullName: "Super Admin",
      role: "admin",
      status: "active",
      createdAt: new Date().toISOString()
    });
    console.log("Seeded admin doc in Firestore.");
    process.exit(0);
  } catch (e) {
    console.error("Error:", e.message);
    process.exit(1);
  }
}
run();
