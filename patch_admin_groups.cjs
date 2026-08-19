const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminGroups.tsx', 'utf-8');

// 1. Add schedule to formData initialization
code = code.replace(
  `  const [formData, setFormData] = useState({ 
    name: '', 
    subject: '', 
    teacherName: '',
    days: [] as string[],
    startTime: '',
    endTime: ''
  });`,
  `  const [formData, setFormData] = useState({ 
    name: '', 
    subject: '', 
    teacherName: '',
    days: [] as string[],
    startTime: '',
    endTime: '',
    schedule: {} as Record<string, {startTime: string, endTime: string}>
  });`
);

// 2. update openAdd
code = code.replace(
  `setFormData({ name: '', subject: '', teacherName: '', days: [], startTime: '', endTime: '' });`,
  `setFormData({ name: '', subject: '', teacherName: '', days: [], startTime: '', endTime: '', schedule: {} });`
);
code = code.replace(
  `setFormData({ name: '', subject: '', teacherName: '', days: [], startTime: '', endTime: '' });`,
  `setFormData({ name: '', subject: '', teacherName: '', days: [], startTime: '', endTime: '', schedule: {} });`
);

// 3. update openEdit
code = code.replace(
  `endTime: group.endTime || ''\n    });`,
  `endTime: group.endTime || '',
      schedule: group.schedule || {}\n    });`
);

fs.writeFileSync('src/pages/admin/AdminGroups.tsx', code);
