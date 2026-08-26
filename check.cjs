const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, limit, query } = require('firebase/firestore');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function check() {
  const users = await getDocs(query(collection(db, 'users'), limit(5)));
  users.forEach(u => console.log(u.id, u.data().fullName, u.data().lastActive, u.data().dailyUsage));
}
check();
