import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Exam } from '../types';
import StudentCertificateTake from './student/StudentCertificateTake';
import { useAuth } from '../contexts/AuthContext';

export default function TelegramExam() {
  const [searchParams] = useSearchParams();
  const examId = searchParams.get('examId');
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const initTgApp = async () => {
      try {
        const tg = (window as any).Telegram?.WebApp;
        if (tg) {
          tg.ready();
          tg.expand();
        }

        const tgUserId = tg?.initDataUnsafe?.user?.id;
        if (!tgUserId) {
          // Check if we are already logged in to firebase
          const auth = getAuth();
          await new Promise((resolve) => {
            const unsub = auth.onAuthStateChanged((user) => {
              unsub();
              if (user) resolve(true);
              else resolve(false);
            });
          });
          
          if (!auth.currentUser) {
            setError("Telegram orqali kirilmadi.");
            setLoading(false);
            return;
          }
        } else {
          // Call API to get custom token
          const res = await fetch('/api/tg-auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tgUserId })
          });
          
          const data = await res.json();
          if (data.token) {
            const auth = getAuth();
            await signInWithCustomToken(auth, data.token);
          } else {
            setError("Avtorizatsiyadan o'tishda xatolik. Avval bot orqali login va parolingizni kiriting.");
            setLoading(false);
            return;
          }
        }

        if (!examId) {
          setError("Imtihon ID si topilmadi.");
          setLoading(false);
          return;
        }

        // Fetch Exam
        const examDoc = await getDoc(doc(db, 'exams', examId));
        if (!examDoc.exists()) {
          setError("Imtihon topilmadi.");
          setLoading(false);
          return;
        }

        setExam({ id: examDoc.id, ...examDoc.data() } as Exam);
        setLoading(false);

      } catch (err: any) {
        console.error(err);
        setError(err.message || "Xatolik yuz berdi");
        setLoading(false);
      }
    };

    initTgApp();
  }, [examId]);

  if (loading || authLoading || !user) {
    return <div className="h-screen w-full flex items-center justify-center bg-[#0a0a0a] text-white">Yuklanmoqda...</div>;
  }

  if (error || !exam) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0a0a0a] text-white p-4 text-center">
        <div className="text-red-400 mb-4">{error}</div>
        <button 
          onClick={() => {
            const tg = (window as any).Telegram?.WebApp;
            if (tg) tg.close();
          }}
          className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-bold"
        >
          Yopish
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#0a0a0a] overflow-hidden">
      <StudentCertificateTake 
        exam={exam} 
        onClose={() => {
          const tg = (window as any).Telegram?.WebApp;
          if (tg) tg.close();
          else navigate('/');
        }} 
      />
    </div>
  );
}
