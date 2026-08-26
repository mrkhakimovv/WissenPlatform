const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc, initializeFirestore } = require('firebase/firestore');

const config = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};
const app = initializeApp(config);
const db = initializeFirestore(app, {}, process.env.VITE_FIREBASE_DATABASE_ID);

async function run() {
  const users = await getDocs(collection(db, 'users'));
  const today = new Date();
  
  for (const u of users.docs) {
    if (u.data().role === 'student' || u.data().fullName.includes('Ruslan')) {
      const dates = {};
      for (let i = 6; i >= 0; i--) {
         const d = new Date();
         d.setDate(today.getDate() - i);
         const dateStr = [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
         dates[dateStr] = Math.floor(Math.random() * 120) + 15; // 15 to 135 mins
      }
      
      await updateDoc(doc(db, 'users', u.id), {
        dailyUsage: dates,
        lastActive: new Date().toISOString()
      });
      console.log('Updated', u.data().fullName);
    }
  }
}
run().catch(console.error);
