const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function check() {
  const q = query(collection(db, 'exam_results'));
  const snap = await getDocs(q);
  console.log("exam_results count:", snap.docs.length);
  snap.docs.forEach(d => {
    const data = d.data();
    console.log(`- Result for student: ${data.studentId}, testId: ${data.testId}, score: ${data.score}`);
  });

  const uq = query(collection(db, 'users'));
  const usnap = await getDocs(uq);
  console.log("users count:", usnap.docs.length);
  usnap.docs.forEach(d => {
     console.log(`- User: ${d.id}, name: ${d.data().fullName}`);
  });
}
check().catch(console.error);
