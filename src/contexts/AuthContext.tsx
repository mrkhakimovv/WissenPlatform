import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, query, where, getDocs } from '../lib/firebase';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';

export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  fullName?: string;
  username: string;
  role: UserRole;
  subject?: string;
  groupId?: string;
  teacherId?: string;
  monthlyFee?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for persistent session
    const storedUser = localStorage.getItem('wissen_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username: string, pass: string) => {
    try {
      // Hardcoded Admin Check per instructions
      if (username === 'admin' && pass === '777888') {
        const adminUser: User = { id: 'admin-1', username: 'admin', role: 'admin', fullName: 'Asosiy Admin' };
        setUser(adminUser);
        localStorage.setItem('wissen_user', JSON.stringify(adminUser));
        toast.success("Xush kelibsiz, Admin!");
        return true;
      }

      // Check students collection in Firestore
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username), where('password', '==', pass));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        const studentUser: User = {
          id: doc.id,
          username: data.username,
          fullName: data.fullName,
          role: 'student',
          subject: data.subject,
          groupId: data.groupId,
          teacherId: data.teacherId,
          monthlyFee: data.monthlyFee
        };
        setUser(studentUser);
        localStorage.setItem('wissen_user', JSON.stringify(studentUser));
        toast.success(`Xush kelibsiz, ${data.fullName || "O'quvchi"}!`);
        return true;
      }

      toast.error('Login yoki parol xato!');
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Tizimda xatolik yuz berdi.');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('wissen_user');
    toast.success('Tizimdan chiqildi');
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
