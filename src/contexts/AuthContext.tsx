import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, doc, getDocs, getDoc } from '../lib/firebase';
import { db, auth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from '../lib/firebase';
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUser({
              id: firebaseUser.uid,
              username: data.username || firebaseUser.email,
              fullName: data.fullName,
              role: data.role as UserRole,
              subject: data.subject,
              groupId: data.groupId,
              teacherId: data.teacherId,
              monthlyFee: data.monthlyFee,
              joinedDate: data.joinedDate,
              phone: data.phone,
              createdAt: data.createdAt
            });
          } else {
            console.error('User doc not found in Firestore');
            setUser(null);
          }
        } catch (err) {
          console.error('Error fetching user:', err);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      // In case they enter username without domain, append it
      const loginEmail = email.includes('@') ? email : `${email}@wissen.internal`;
      
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, pass);
      const firebaseUser = userCredential.user;

      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        const loggedInUser: User = {
          id: firebaseUser.uid,
          username: data.username || firebaseUser.email,
          fullName: data.fullName,
          role: data.role as UserRole,
          subject: data.subject,
          groupId: data.groupId,
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
