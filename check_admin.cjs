import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function run() {
  const snap = await getDocs(query(collection(db, 'users'), where('role', '==', 'admin')));
  for (const d of snap.docs) {
    console.log(d.id, d.data());
  }
  process.exit(0);
}
run();
