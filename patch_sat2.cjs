const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSATDatabase.tsx', 'utf-8');

if (!code.includes("import { sendAutoNotification }")) {
  code = code.replace("import { collection, addDoc", "import { sendAutoNotification } from '../../lib/notificationSender';\nimport { collection, addDoc");
}

const saveTarget = `        description: assigningTest.title + ' (Online)',
        testId: assigningTest.id,
        isOnline: true,
        maxAttempts: assignForm.maxAttempts || 1,
        createdAt: new Date().toISOString()
      });
      toast.success("Online test guruhga biriktirildi!");
      setIsAssignModalOpen(false);`;

const newSave = `        description: assigningTest.title + ' (Online)',
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

fs.writeFileSync('src/pages/admin/AdminSATDatabase.tsx', code);
