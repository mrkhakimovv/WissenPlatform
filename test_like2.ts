import { adminAuth } from "./src/server/notifications";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { getAuth, signInWithCustomToken } from "firebase/auth";

const config = {
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN
};
const firestoreDatabaseId = process.env.VITE_FIREBASE_DATABASE_ID;

const app = initializeApp(config);
import { initializeFirestore } from "firebase/firestore";
const db = initializeFirestore(app, {}, firestoreDatabaseId);
const auth = getAuth(app);

async function run() {
  try {
    const token = await adminAuth.createCustomToken("DcoHHDOXr1dG3fANUU92hEBPsY42"); // diyorbek
    await signInWithCustomToken(auth, token);
    console.log("Logged in as diyorbek!");
    
    await updateDoc(doc(db, "news", "v8ZiMuP33gH9PIUk8xA6"), {
      likes: arrayUnion(auth.currentUser.uid)
    });
    console.log("Like updated!");
  } catch(e) {
    console.log("Error:", e.message);
  }
  process.exit(0);
}
run().catch(console.error);
