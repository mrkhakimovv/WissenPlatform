import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, setDoc, updateDoc, deleteDoc, onSnapshot, orderBy, addDoc, limit } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

export { collection, query, where, getDocs, doc, setDoc, updateDoc, deleteDoc, onSnapshot, orderBy, addDoc, limit };
