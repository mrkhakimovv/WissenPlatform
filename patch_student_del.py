import re

with open('src/pages/admin/AdminStudents.tsx', 'r') as f:
    content = f.read()

old_logic = """  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if(await confirm({ title: 'Diqqat', message: `${name} ni haqiqatan ham o'chirmoqchimisiz?` })) {
      await deleteDoc(doc(db, 'users', id));
      toast.success("O'chirildi");
    }
  };"""

new_logic = """  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if(await confirm({ title: 'Diqqat', message: `${name} ni haqiqatan ham o'chirmoqchimisiz?` })) {
      try {
        await deleteDoc(doc(db, 'users', id));
        
        // Delete related payments
        const payQ = query(collection(db, 'payments'), where('studentId', '==', id));
        const paySnap = await getDocs(payQ);
        paySnap.forEach(d => deleteDoc(d.ref));
        
        // Delete related attendance
        const attQ = query(collection(db, 'attendance'), where('studentId', '==', id));
        const attSnap = await getDocs(attQ);
        attSnap.forEach(d => deleteDoc(d.ref));

        toast.success("O'chirildi");
      } catch (err: any) {
        toast.error("O'chirishda xatolik yuz berdi");
      }
    }
  };"""

content = content.replace(old_logic, new_logic)

with open('src/pages/admin/AdminStudents.tsx', 'w') as f:
    f.write(content)
