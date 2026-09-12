const { initializeApp } = require("firebase/app");
const { getAuth, createUserWithEmailAndPassword } = require("firebase/auth");
const { initializeFirestore, doc, getDoc, setDoc } = require("firebase/firestore");
const localFirebaseConfig = require("./firebase-applet-config.json");

const app = initializeApp(localFirebaseConfig);
const auth = getAuth(app);
const db = initializeFirestore(app, {}, localFirebaseConfig.databaseId);

async function run() {
  try {
    const email = "test" + Date.now() + "@example.com";
    const cred = await createUserWithEmailAndPassword(auth, email, "123456");
    console.log("Created user:", cred.user.uid);
    await setDoc(doc(db, "users", cred.user.uid), {
        role: "student",
        email: email
    });
    console.log("Wrote doc.");
    const d = await getDoc(doc(db, "users", cred.user.uid));
    console.log("Doc exists:", d.exists());
    process.exit(0);
  } catch (e) {
    console.error("Error:", e);
    process.exit(1);
  }
}
run();
