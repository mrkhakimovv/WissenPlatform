import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  projectId: "wissenapp-4bce7",
  databaseURL: "https://wissenapp-4bce7.firebaseio.com",
  apiKey: "AIzaSyCn04t32JuYeOl-xvNklbJ9vNeTK7RGrfg"
};

const app = initializeApp(firebaseConfig);
// Need to supply databaseId somehow if it's not default.
const db = getFirestore(app, "ai-studio-41d7d5e5-6008-47c8-ae27-1ade7e269b79");

async function run() {
  try {
    const snap = await getDocs(collection(db, "users"));
    snap.forEach(doc => {
      const data = doc.data();
      if(JSON.stringify(data).includes("ICV")) {
        console.log(doc.id, data);
      }
    });
  } catch(e) {
    console.error(e);
  }
}
run();
