import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function run() {
  const snap = await getDocs(collection(db, 'payments'));
  let found = 0;
  for (const d of snap.docs) {
    const data = d.data();
    console.log(d.id, data);
    if (data.amount === 20000 || data.amount === '20000') {
      console.log('Found errant payment:', d.id, data);
      await deleteDoc(doc(db, 'payments', d.id));
      found++;
    }
  }
  console.log('Deleted', found, 'payments');
  process.exit(0);
}
run();
