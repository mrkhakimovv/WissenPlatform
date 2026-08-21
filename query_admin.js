import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  projectId: "wissenapp-4bce7",
  apiKey: "AIzaSyCn04t32JuYeOl-xvNklbJ9vNeTK7RGrfg"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-41d7d5e5-6008-47c8-ae27-1ade7e269b79");

async function checkAdmin() {
  const snap = await getDocs(collection(db, "users"));
  snap.forEach(d => {
    if(d.data().role === 'admin') {
      console.log("Admin found:", d.id, d.data());
    }
  });
}
checkAdmin();
