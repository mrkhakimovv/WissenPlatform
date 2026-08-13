import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  try {
    const email = 'admin@wissen.internal';
    const password = 'wissen_admin_password'; // Change this if needed
    
    console.log(`Creating admin user: ${email}...`);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log(`User created in Auth with UID: ${user.uid}`);
    
    // Create document in users collection
    await setDoc(doc(db, 'users', user.uid), {
      username: 'admin',
      fullName: 'Asosiy Admin',
      role: 'admin',
      createdAt: new Date().toISOString()
    });
    
    console.log('Admin user document created successfully in Firestore!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

run();
