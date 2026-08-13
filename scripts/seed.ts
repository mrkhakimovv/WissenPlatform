import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';
import fs from 'fs';

let firebaseConfig;
try {
  firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
} catch(e) {
  console.log("No config");
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const mockData = {
  users: [
    { username: 'student1', password: '123', role: 'student', fullName: 'Asadbek Rustamov', groupId: 'g1', subject: 'Matematika' },
    { username: 'student2', password: '123', role: 'student', fullName: 'Zilola Mansurova', groupId: 'g2', subject: 'English' },
    { username: 'teacher1', password: '123', role: 'teacher', fullName: 'Olimov B.' },
    { username: 'admin', password: '123', role: 'admin', fullName: 'Administrator' }
  ],
  groups: [
    { name: 'G-24', teacherName: 'Olimov B.', subject: 'Matematika', createdAt: new Date().toISOString() },
    { name: 'IELTS 7.0', teacherName: 'Karimova M.', subject: 'English', createdAt: new Date().toISOString() }
  ],
  payments: [
    { studentName: 'Asadbek Rustamov', amount: 450000, date: new Date().toISOString(), status: 'paid' },
    { studentName: 'Zilola Mansurova', amount: 500000, date: new Date().toISOString(), status: 'unpaid' }
  ],
  attendance: [
    { studentName: 'Asadbek Rustamov', date: new Date().toISOString(), present: true },
    { studentName: 'Zilola Mansurova', date: new Date().toISOString(), present: false }
  ],
  subjects: [
    { name: 'Matematika', createdAt: new Date().toISOString() },
    { name: 'English', createdAt: new Date().toISOString() },
    { name: 'Fizika', createdAt: new Date().toISOString() },
    { name: 'Tarix', createdAt: new Date().toISOString() }
  ]
};

async function seed() {
  for (const [colName, items] of Object.entries(mockData)) {
    const snap = await getDocs(collection(db, colName));
    if (snap.empty) {
      for (const item of items) {
        await addDoc(collection(db, colName), item);
        console.log(`Added to ${colName}`);
      }
    } else {
      console.log(`${colName} already seeded`);
    }
  }
}

seed().then(() => {
  console.log('Seeding complete');
  process.exit(0);
}).catch(console.error);
