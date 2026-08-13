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

  const u = await getDocs(collection(db, 'users'));
  console.log("Users:");
  u.forEach(d => {
    if (d.data().role === 'student') {
      console.log(d.id, d.data().fullName, "groups:", d.data().groups, "groupId:", d.data().groupId);
    }
  });
}

check().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1)});
