import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "wissenapp-4bce7",
  apiKey: "AIzaSyCn04t32JuYeOl-xvNklbJ9vNeTK7RGrfg"
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {}, "ai-studio-41d7d5e5-6008-47c8-ae27-1ade7e269b79");

async function run() {
  const snap = await getDocs(collection(db, "users"));
  snap.forEach(doc => {
    const data = doc.data();
    console.log(data.username, data.password, doc.id);
  });
  process.exit(0);
}
run();
