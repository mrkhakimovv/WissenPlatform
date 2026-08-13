import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  try {
    console.log("Migrating schema...");

    // Migrate Payments
    console.log("Migrating payments...");
    const paymentsSnap = await getDocs(collection(db, 'payments'));
    for (const d of paymentsSnap.docs) {
      const data = d.data();
      const updates: any = {};
      if (data.date && !data.paidAt) {
        updates.paidAt = data.date;
      }
      if (!data.status) {
        updates.status = 'paid'; // default old ones to paid
      }
      if (!data.month && data.date) {
        updates.month = new Date(data.date).getMonth() + 1;
        updates.year = new Date(data.date).getFullYear();
      }
      if (Object.keys(updates).length > 0) {
        await updateDoc(doc(db, 'payments', d.id), updates);
        console.log(`Updated payment ${d.id}`);
      }
    }

    // Migrate Attendance
    console.log("Migrating attendance...");
    const attendanceSnap = await getDocs(collection(db, 'attendance'));
    for (const d of attendanceSnap.docs) {
      const data = d.data();
      const updates: any = {};
      if (data.present !== undefined && !data.status) {
        updates.status = data.present ? 'present' : 'absent';
      }
      if (Object.keys(updates).length > 0) {
        await updateDoc(doc(db, 'attendance', d.id), updates);
        console.log(`Updated attendance ${d.id}`);
      }
    }

    console.log("Migration complete!");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

run();
