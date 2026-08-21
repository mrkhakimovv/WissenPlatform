const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminNews.tsx', 'utf-8');

const importTarget = `import { collection, addDoc, onSnapshot, query, deleteDoc, doc, updateDoc } from '../../lib/firebase';`;
const newImport = `import { collection, addDoc, onSnapshot, query, deleteDoc, doc, updateDoc } from '../../lib/firebase';
import { sendAutoNotification } from '../../lib/notificationSender';`;
code = code.replace(importTarget, newImport);

const saveTarget = `      if (editingId) {
        await updateDoc(doc(db, 'news', editingId), formData);
        toast.success("Yangilandi");
      } else {
        await addDoc(collection(db, 'news'), {
          ...formData,
          publishedAt: new Date().toISOString()
        });
        toast.success("Qo'shildi");
      }`;
const newSave = `      if (editingId) {
        await updateDoc(doc(db, 'news', editingId), formData);
        toast.success("Yangilandi");
      } else {
        await addDoc(collection(db, 'news'), {
          ...formData,
          publishedAt: new Date().toISOString()
        });
        toast.success("Qo'shildi");
        
        // Auto push notification for new news
        await sendAutoNotification({
          title: "Yangi e'lon: " + formData.title,
          body: formData.content.substring(0, 100) + (formData.content.length > 100 ? '...' : ''),
          link: '/student/news',
          target: 'all'
        });
      }`;
code = code.replace(saveTarget, newSave);

fs.writeFileSync('src/pages/admin/AdminNews.tsx', code);
