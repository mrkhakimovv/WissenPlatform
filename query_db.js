import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

const app = initializeApp({
  projectId: 'ai-studio-41d7d5e5-6008-47c8-ae27-1ade7e269b79',
});
const db = getFirestore(app);

async function check() {
  const q = await getDocs(collection(db, 'schedules'));
  console.log("Schedules:");
  q.forEach(d => console.log(d.id, d.data()));
  
  const g = await getDocs(collection(db, 'groups'));
  console.log("Groups:");
  g.forEach(d => console.log(d.id, d.data()));
}

check().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1)});
