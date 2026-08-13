import re

with open('src/pages/admin/AdminStudents.tsx', 'r') as f:
    content = f.read()

old_logic = """      await setDoc(doc(db, 'users', userCred.user.uid), {
        ...dataToSave,
        role: 'student',
        monthlyFee: Number(formData.monthlyFee),
        createdAt: new Date().toISOString()
      });

      toast.success("O'quvchi qo'shildi!");"""

new_logic = """      await setDoc(doc(db, 'users', userCred.user.uid), {
        ...dataToSave,
        role: 'student',
        monthlyFee: Number(formData.monthlyFee),
        createdAt: new Date().toISOString()
      });

      // Automatically create a payment doc if joined mid-month
      const info = getProratedInfo();
      if (info) {
        const d = new Date(formData.joinedDate);
        await addDoc(collection(db, 'payments'), {
          studentId: userCred.user.uid,
          amount: info.amount,
          month: d.getMonth() + 1,
          year: d.getFullYear(),
          status: 'unpaid',
          createdAt: new Date().toISOString()
        });
      }

      toast.success("O'quvchi qo'shildi!");"""

content = content.replace(old_logic, new_logic)

with open('src/pages/admin/AdminStudents.tsx', 'w') as f:
    f.write(content)
