require("dotenv").config({ path: ".env" });
const { initializeApp } = require("firebase/app");
const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");
const { initializeFirestore, collection, getDocs, query, where } = require("firebase/firestore");
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
    const cred = await signInWithEmailAndPassword(auth, "test3_" + Date.now() + "@example.com", "123456").catch(async () => {
        return await require("firebase/auth").createUserWithEmailAndPassword(auth, "test3_" + Date.now() + "@example.com", "123456");
    });
    const snap = await getDocs(query(collection(db, "users"), where("email", "==", "khakimovvv2107@gmail.com")));
    console.log("Found:", snap.size);
    snap.forEach(d => console.log(d.id, d.data()));
    
    const snap2 = await getDocs(collection(db, "users"));
    let found = false;
    snap2.forEach(d => {
        if (d.data().email === "khakimovvv2107@gmail.com" || d.data().username === "khakimovvv2107@gmail.com" || d.id === "khakimovvv2107@gmail.com") {
            console.log("Found in all:", d.id, d.data());
            found = true;
        }
    });
    if (!found) console.log("Not found in all users");
    process.exit(0);
  } catch (e) {
    console.error("Error:", e.message);
    process.exit(1);
  }
}
run();
