import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { initializeFirestore, doc, getDoc } from "firebase/firestore";
import localFirebaseConfig from "./firebase-applet-config.json";

const configAny = (localFirebaseConfig as any).default || localFirebaseConfig;
const firebaseConfig = {
  apiKey: configAny.apiKey,
  authDomain: configAny.authDomain,
  projectId: configAny.projectId,
  storageBucket: configAny.storageBucket,
  messagingSenderId: configAny.messagingSenderId,
  appId: configAny.appId,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = initializeFirestore(app, {}, configAny.databaseId);

async function run() {
  try {
    const cred = await signInWithEmailAndPassword(auth, "khakimovvv2107@gmail.com", "123456");
    console.log("Logged in:", cred.user.uid);
    const d = await getDoc(doc(db, "users", cred.user.uid));
    console.log("Doc exists:", d.exists());
    process.exit(0);
  } catch (e) {
    console.error("Error:", e);
    process.exit(1);
  }
}
run();
