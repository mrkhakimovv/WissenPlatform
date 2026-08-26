import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc, arrayUnion, collection, getDocs, limit, query } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import fs from "fs";

// The config uses the VITE_ prefixed env variables
const config = {
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN
};

const app = initializeApp(config);
const db = getFirestore(app);
const auth = getAuth(app);

async function run() {
  try {
    await signInWithEmailAndPassword(auth, "mirzo@wissen.uz", "mirzo123");
    console.log("Logged in!");
    
    const newsQ = query(collection(db, 'news'), limit(1));
    const newsSnap = await getDocs(newsQ);
    if(newsSnap.empty) {
      console.log("No news found");
      process.exit(0);
    }
    const newsId = newsSnap.docs[0].id;
    console.log("News ID:", newsId);

    await updateDoc(doc(db, 'news', newsId), {
      likes: arrayUnion(auth.currentUser.uid)
    });
    console.log("Update succeeded!");
  } catch(e) {
    console.error("Error:", e.message);
  }
  process.exit(0);
}
run();
