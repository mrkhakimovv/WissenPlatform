import fs from 'fs';

const files = [
  'src/pages/admin/AdminDashboard.tsx',
  'src/pages/Login.tsx',
  'src/pages/student/StudentDashboard.tsx',
  'src/pages/admin/AdminGroups.tsx',
  'src/pages/admin/AdminStudents.tsx',
  'src/pages/admin/AdminAttendance.tsx',
  'src/pages/student/StudentProfile.tsx',
  'src/pages/student/StudentSchedule.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/text-black/g, 'text-[#0d0d0d]');
    fs.writeFileSync(file, content);
  }
});
console.log('Done');
