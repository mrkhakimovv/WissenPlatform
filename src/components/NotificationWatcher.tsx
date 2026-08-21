import { useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function NotificationWatcher() {
  const { user } = useAuth();
  // Faqat komponent o'rnatilgandan keyin yaratilgan xabarnomalarni ushlab qolamiz
  const mountTime = useRef(new Date().toISOString());
  // Ikki marta ko'rsatmaslik uchun ID larni saqlaymiz
  const processedIds = useRef(new Set<string>());

  useEffect(() => {
    // Faqat talabalar uchun ishlaydi
    if (!user || user.role !== 'student') return;

    const q = query(
      collection(db, 'notifications'),
      where('createdAt', '>=', mountTime.current)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          const notifId = change.doc.id;
          
          if (processedIds.current.has(notifId)) return;
          processedIds.current.add(notifId);

          // Xabarnoma bu talabaga tegishlimi?
          let isTargeted = false;
          if (data.target === 'all') {
            isTargeted = true;
          } else if (data.target === 'user' && data.targetId === user.id) {
            isTargeted = true;
          } else if (data.target === 'group') {
            const userGroups = user.groups || [];
            if (userGroups.includes(data.targetId) || user.groupId === data.targetId) {
              isTargeted = true;
            }
          }

          if (isTargeted) {
            // 1. Qisqa ovoz chalish
            playNotificationSound();
            
            // 2. Ekranda toast chiqarish
            toast.success(`${data.title}\n${data.body}`, { duration: 6000 });
            
            // 3. Tizim bildirishnomasini ko'rsatish (Token kerak emas)
            if ('serviceWorker' in navigator && Notification.permission === 'granted') {
              navigator.serviceWorker.ready.then((registration) => {
                registration.showNotification(data.title || 'Yangi xabarnoma', {
                  body: data.body,
                  icon: '/icon.png', // Ilova ikonkasi (public jildida bo'lsa)
                  data: { link: data.link || '/' }
                });
              }).catch(err => console.error("SW Notification error:", err));
            }
          }
        }
      });
    });

    return () => unsubscribe();
  }, [user]);

  return null; // Ko'rinmas komponent
}

// Brauzer orqali qisqa bildirishnoma ovozini chalish (Web Audio API)
// Hech qanday audio fayl talab qilmaydi
function playNotificationSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    // Ovoz turi va chastotasi
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // 800Hz dan
    oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1); // 1200Hz ga ko'tariladi
    
    // Ovoz balandligini sozlash (Tugashda pasayish)
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05); // Maksimal ovoz
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    // Chalish
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.5);
  } catch (e) {
    console.error("Audio error:", e);
  }
}
