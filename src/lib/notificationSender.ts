import { auth } from './firebase';

export async function sendAutoNotification({ title, body, link, target, targetId }: { title: string, body: string, link?: string, target: 'all'|'group'|'user', targetId?: string }) {
  try {
    if (!auth.currentUser) return { success: false, error: "Not logged in" };
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
    
    const data = await res.json();
    if (!res.ok) {
      console.error("Auto notification failed:", data.error);
      return { success: false, error: data.error };
    }
    
    return { success: true, data };
  } catch (err: any) {
    console.error("Error sending auto notification:", err);
    return { success: false, error: err.message || "Unknown error" };
  }
}

