import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config.default || config);
const db = getFirestore(app);

async function run() {
  const snap = await getDocs(collection(db, 'exams'));
  snap.forEach(d => {
    const data = d.data();
    if (data.title.includes('EKUB')) {
      console.log('Exam ID:', d.id);
      console.log('testId:', data.testId);
      console.log('examType:', data.examType);
    }
  });
}
run();
