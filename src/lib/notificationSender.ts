import { auth } from './firebase';

export async function sendAutoNotification({ title, body, link, target, targetId }: { title: string, body: string, link?: string, target: 'all'|'group'|'user', targetId?: string }) {
  try {
    if (!auth.currentUser) return;
    const idToken = await auth.currentUser.getIdToken();
    
    const res = await fetch('/api/send-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({
        title, body, link, target, targetId
      })
    });
    
    if (!res.ok) {
      const data = await res.json();
      console.error("Auto notification failed:", data.error);
    }
  } catch (err) {
    console.error("Error sending auto notification:", err);
  }
}
