const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function check() {
  const uq = query(collection(db, 'users'), where('role', '==', 'student'));
  const usnap = await getDocs(uq);
  console.log("students count:", usnap.docs.length);
  usnap.docs.forEach(d => {
     console.log(`- User: ${d.id}, joinedDate: ${d.data().joinedDate}`);
  });
}
check().catch(console.error);
