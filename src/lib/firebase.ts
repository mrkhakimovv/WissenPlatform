import { initializeApp } from 'firebase/app';
import { getFirestore, setLogLevel, collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, orderBy, addDoc, limit } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Tarmoq uzilishi ogohlantirishlarini yashirish
setLogLevel('error');

const app = initializeApp(firebaseConfig);
const secondaryApp = initializeApp(firebaseConfig, 'Secondary');

export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const auth = getAuth(app);
export const secondaryAuth = getAuth(secondaryApp);

export { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, orderBy, addDoc, limit, signInWithEmailAndPassword, onAuthStateChanged, signOut, createUserWithEmailAndPassword };
