import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { app, db, auth } from './firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import toast from 'react-hot-toast';

export async function requestNotificationPermission() {
  try {
    const supported = await isSupported();
    if (!supported) {
      toast.error("Brauzeringiz bildirishnomalarni qo'llab-quvvatlamaydi.");
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const messaging = getMessaging(app);
      
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
      if (!vapidKey) {
        console.warn('VITE_FIREBASE_VAPID_KEY is not defined. Push notifications may not work.');
        return null;
      }

      const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      
      const currentToken = await getToken(messaging, { 
        vapidKey: vapidKey,
        serviceWorkerRegistration: swReg
      });

      if (currentToken) {
        // Save to user doc
        if (auth.currentUser) {
          await updateDoc(doc(db, 'users', auth.currentUser.uid), {
            fcmTokens: arrayUnion(currentToken)
          });
          toast.success("Bildirishnomalar yoqildi!");
          return currentToken;
        }
      } else {
        toast.error("Token olinmadi. Ruxsatlarni tekshiring.");
      }
    } else {
      toast.error("Bildirishnomalarga ruxsat berilmadi.");
    }
  } catch (err) {
    console.error('An error occurred while retrieving token. ', err);
    toast.error("Bildirishnomalarni yoqishda xatolik yuz berdi.");
  }
  return null;
}

export async function setupMessageListener() {
  const supported = await isSupported();
  if (!supported) return;
  
  const messaging = getMessaging(app);
  onMessage(messaging, (payload) => {
    // Server "data-only" xabar yuboradi — sarlavha/matnni payload.data dan olamiz.
    const title = payload.data?.title || payload.notification?.title || 'Yangi xabarnoma';
    const body = payload.data?.body || payload.notification?.body || '';

    // Ilova ochiq (foreground) bo'lganda faqat ichki toast ko'rsatamiz.
    // Bu yerda yana tizim bildirishnomasini ko'rsatsak, foydalanuvchi bir vaqtda
    // ikkita xabar ko'rardi (toast + tizim). Tizim bildirishnomasi faqat orqa
    // fonda (service worker orqali) ko'rsatiladi.
    toast.success(`${title}\n${body}`, { duration: 5000 });
  });
}