const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminExams.tsx', 'utf-8');

code = code.replace(
  `setFormData({ title: '', subject: '', groupId: '', date: '', startTime: '', duration: '', location: '', description: '', testSources: [] });`,
  `setFormData({ title: '', subject: '', groupId: '', date: '', startTime: '', duration: '', location: '', description: '', testSources: [], maxAttempts: 1 });`
);

code = code.replace(
  `description: exam.description || '', testSources: exam.testSources || []});`,
  `description: exam.description || '', testSources: exam.testSources || [], maxAttempts: exam.maxAttempts || 1});`
);

fs.writeFileSync('src/pages/admin/AdminExams.tsx', code);
