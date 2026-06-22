import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { readFileSync } from 'fs';

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const q = collection(db, 'users');
  const snap = await getDocs(q);
  console.log("Users count:", snap.size);
  console.log("Users:", snap.docs.map(d => ({id: d.id, ...d.data()})));
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
