import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, updatePassword } from 'firebase/auth';
import { readFileSync } from 'fs';

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function run() {
  try {
    const email = 'admin@wissen.internal';
    const oldPassword = 'wissen_admin_password';
    const newPassword = '777888';
    
    console.log(`Updating password for: ${email}...`);
    const userCredential = await signInWithEmailAndPassword(auth, email, oldPassword);
    
    await updatePassword(userCredential.user, newPassword);
    
    console.log('Password updated to 777888!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating password:', error);
    process.exit(1);
  }
}

run();
