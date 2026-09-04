import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { increment } from 'firebase/firestore';
import { collection, doc, getDocs, getDoc, onSnapshot } from '../lib/firebase';
import { db, auth, signInWithEmailAndPassword, onAuthStateChanged, signOut, updateDoc } from '../lib/firebase';
import toast from 'react-hot-toast';

import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        // Clean up any existing listener before creating a new one
        if (unsubscribeDoc) {
          unsubscribeDoc();
        }

        unsubscribeDoc = onSnapshot(userDocRef, (userDoc) => {
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.status === 'archived') {
              signOut(auth).catch(console.error);
              setUser(null);
              setLoading(false);
              return;
            }
            setUser({
              id: firebaseUser.uid,
              username: data.username || firebaseUser.email,
              fullName: data.fullName,
              role: data.role as UserRole,
              subject: data.subject,
              groupId: data.groupId, 
              groups: data.groups,
              teacherId: data.teacherId,
              monthlyFee: data.monthlyFee,
              joinedDate: data.joinedDate,
              phone: data.phone,
              createdAt: data.createdAt,
              lastActive: data.lastActive,
              dailyUsage: data.dailyUsage
            });
            setLoading(false);
          } else {
            console.warn('User doc not found in Firestore, signing out.');
            signOut(auth);
            setUser(null);
            setLoading(false);
          }
        }, (err) => {
          console.error('Error fetching user:', err);
          if (err.message && err.message.toLowerCase().includes('offline')) {
            console.warn('Client is offline. Keeping current auth state.');
            setLoading(false);
          } else {
            toast.error("Tizimga kirishda xatolik (Ruxsat yo'q). Firebase qoidalarini tekshiring.");
            signOut(auth);
            setUser(null);
            setLoading(false);
          }
        });
      } else {
        setUser(null);
        setLoading(false);
        if (unsubscribeDoc) {
          unsubscribeDoc();
          unsubscribeDoc = null;
        }
      }
    });

    return () => {
      if (unsubscribeDoc) {
        unsubscribeDoc();
      }
      unsubscribeAuth();
    };
  }, []);


  useEffect(() => {
    if (!user?.id) return;
    
    const updateUsage = () => {
      const today = new Date();
      const dateStr = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
      
      const userRef = doc(db, 'users', user.id);
      updateDoc(userRef, {
        lastActive: new Date().toISOString(),
        [`dailyUsage.${dateStr}`]: increment(1)
      }).catch(console.error);
    };

    // Darhol yangilash (1 daqiqa kutib o'tirmaslik uchun)
    updateUsage();
    
    // Keyin har 60 soniyada yangilab turish
    const interval = setInterval(updateUsage, 60000);
    
    return () => clearInterval(interval);
  }, [user?.id]);

  const login = async (email: string, pass: string) => {
    try {
      // In case they enter username without domain, append it
      const loginEmail = email.includes('@') ? email : `${email}@wissen.internal`;
      
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, pass);
      const firebaseUser = userCredential.user;

      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.status === 'archived') {
          await signOut(auth);
          throw new Error("Ushbu akkaunt arxivlangan. Arxivdan chiqarish uchun adminga murojaat qiling.");
        }
        
        // Save the entered password securely if it's not present (for old accounts)
        // or just update it to ensure admin can see it. We update it every successful login.
        try {
          await updateDoc(doc(db, 'users', firebaseUser.uid), {
            password: pass
          });
        } catch (e) {
          console.error("Could not update password on login", e);
        }

        const loggedInUser: User = {
          id: firebaseUser.uid,
          username: data.username || firebaseUser.email,
          fullName: data.fullName,
          role: data.role as UserRole,
          subject: data.subject,
          groupId: data.groupId, groups: data.groups,
          teacherId: data.teacherId,
          monthlyFee: data.monthlyFee,
          joinedDate: data.joinedDate,
          phone: data.phone,
          createdAt: data.createdAt
        };
        setUser(loggedInUser);
        toast.success(`Xush kelibsiz, ${data.fullName || "Foydalanuvchi"}!`);
        return true;
      }
      toast.error("Foydalanuvchi ma'lumotlari topilmadi!");
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = "Tizimga kirishda xatolik yuz berdi";
      
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = "Parol xato yoki foydalanuvchi topilmadi!";
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = "Bunday foydalanuvchi topilmadi!";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Juda ko'p urinish. Iltimos biroz kuting.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Tarmoq xatosi. Internet aloqasini tekshiring yoki Adblockerni o'chiring.";
      }
      
      toast.error(errorMessage);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      toast.success('Tizimdan chiqildi');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Chiqishda xatolik yuz berdi");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
