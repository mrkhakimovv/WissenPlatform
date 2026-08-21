const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSATDatabase.tsx', 'utf-8');

const importTarget = `import { collection, addDoc, onSnapshot, query, deleteDoc, doc, updateDoc, getDocs } from '../../lib/firebase';`;
const newImport = `import { collection, addDoc, onSnapshot, query, deleteDoc, doc, updateDoc, getDocs } from '../../lib/firebase';
import { sendAutoNotification } from '../../lib/notificationSender';`;
code = code.replace(importTarget, newImport);

const saveTarget = `      await addDoc(collection(db, 'exams'), {
        title: assigningTest.title,
        subject: assigningTest.testType || 'Online Test',
        groupId: assignForm.groupId,
        date: assignForm.date,
        startTime: assignForm.startTime,
        duration: Number(assignForm.duration),
        location: 'Online',
        description: assigningTest.title + ' (Online)',
        testId: assigningTest.id,
        isOnline: true,
        maxAttempts: assignForm.maxAttempts || 1,
        createdAt: new Date().toISOString()
      });
      toast.success("Online test guruhga biriktirildi!");
      setIsAssignModalOpen(false);`;
const newSave = `      await addDoc(collection(db, 'exams'), {
        title: assigningTest.title,
        subject: assigningTest.testType || 'Online Test',
        groupId: assignForm.groupId,
        date: assignForm.date,
        startTime: assignForm.startTime,
        duration: Number(assignForm.duration),
        location: 'Online',
        description: assigningTest.title + ' (Online)',
        testId: assigningTest.id,
        isOnline: true,
        maxAttempts: assignForm.maxAttempts || 1,
        createdAt: new Date().toISOString()
      });
      toast.success("Online test guruhga biriktirildi!");
      setIsAssignModalOpen(false);
      
      await sendAutoNotification({
        title: "Yangi SAT test: " + assigningTest.title,
        body: \`\${assigningTest.title} ishlashga tayyor!\`,
        link: '/student/sat',
        target: 'group',
        targetId: assignForm.groupId
      });`;
code = code.replace(saveTarget, newSave);

const saveExamTarget = `      if (examEditingId) {
        await updateDoc(doc(db, 'exams', examEditingId), dataToSave);
        toast.success("Yangilandi");
      } else {
        await addDoc(collection(db, 'exams'), { ...dataToSave, createdAt: new Date().toISOString() });
        toast.success("Yaratildi");
      }`;
const newSaveExam = `      if (examEditingId) {
        await updateDoc(doc(db, 'exams', examEditingId), dataToSave);
        toast.success("Yangilandi");
      } else {
        await addDoc(collection(db, 'exams'), { ...dataToSave, createdAt: new Date().toISOString() });
        toast.success("Yaratildi");
        
        await sendAutoNotification({
          title: "Yangi SAT Mock tayinlandi: " + examFormData.title,
          body: \`\${examFormData.title} ishlashga tayyor!\`,
          link: '/student/sat',
          target: 'group',
          targetId: examFormData.groupId
        });
      }`;
code = code.replace(saveExamTarget, newSaveExam);

fs.writeFileSync('src/pages/admin/AdminSATDatabase.tsx', code);
