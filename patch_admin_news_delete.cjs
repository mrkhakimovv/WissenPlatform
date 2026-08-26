const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminNews.tsx', 'utf8');

code = code.replace(
  "import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, doc } from '../../lib/firebase';",
  "import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, doc, where, getDocs } from '../../lib/firebase';"
);

const oldHandleDelete = `  const handleDelete = async (id: string) => {
    if (await confirm({ title: 'Diqqat', message: "Yangilikni o'chirishni tasdiqlaysizmi?" })) {
      try {
        await deleteDoc(doc(db, 'news', id));
        toast.success("O'chirildi");
      } catch (err) {
      console.error('Kontekst:', err);
      const msg = err instanceof Error ? err.message : "Noma'lum xatolik";
      toast.error(msg);
    }
    }
  };`;

const newHandleDelete = `  const handleDelete = async (item: NewsItem) => {
    if (await confirm({ title: 'Diqqat', message: "Yangilikni o'chirishni tasdiqlaysizmi?" })) {
      try {
        await deleteDoc(doc(db, 'news', item.id));
        
        try {
          const q = query(
            collection(db, 'notifications'),
            where('title', '==', "Yangi e'lon: " + item.title),
            where('link', '==', '/student/news')
          );
          const snap = await getDocs(q);
          const deletePromises = snap.docs.map(d => deleteDoc(doc(db, 'notifications', d.id)));
          await Promise.all(deletePromises);
        } catch (notifErr) {
          console.error("Xabarnomalarni o'chirishda xato:", notifErr);
        }

        toast.success("O'chirildi");
      } catch (err) {
        console.error('Kontekst:', err);
        const msg = err instanceof Error ? err.message : "Noma'lum xatolik";
        toast.error(msg);
      }
    }
  };`;

code = code.replace(oldHandleDelete, newHandleDelete);

code = code.replace(
  "onClick={() => handleDelete(item.id)}",
  "onClick={() => handleDelete(item)}"
);

fs.writeFileSync('src/pages/admin/AdminNews.tsx', code);
console.log("Patched AdminNews.tsx");
