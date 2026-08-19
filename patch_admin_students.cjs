const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminStudents.tsx', 'utf-8');

// Sort filtered students by createdAt descending
const filterTarget = `  const filtered = students.filter(s => {
    if (user?.role === 'teacher') {
      const sGroupsIds = s.groups || (s.groupId ? [s.groupId] : []);
      const belongsToTeacher = groups.some(g => sGroupsIds.includes(g.id) && g.teacherName === user.fullName);
      if (!belongsToTeacher) return false;
    }
    return s.fullName?.toLowerCase().includes(search.toLowerCase()) || s.username?.toLowerCase().includes(search.toLowerCase());
  });`;

const filterReplace = `  const filtered = students.filter(s => {
    if (user?.role === 'teacher') {
      const sGroupsIds = s.groups || (s.groupId ? [s.groupId] : []);
      const belongsToTeacher = groups.some(g => sGroupsIds.includes(g.id) && g.teacherName === user.fullName);
      if (!belongsToTeacher) return false;
    }
    return s.fullName?.toLowerCase().includes(search.toLowerCase()) || s.username?.toLowerCase().includes(search.toLowerCase());
  }).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());`;

code = code.replace(filterTarget, filterReplace);

// Add yellow ring if student has no group
const cardTarget = `            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i*0.05 }}
              key={student.id} 
              className="glass-panel p-5 flex flex-col relative group hover:border-[#FEC204]/30 transition-colors"
            >`;

const cardReplace = `            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i*0.05 }}
              key={student.id} 
              className={\`glass-panel p-5 flex flex-col relative group hover:border-[#FEC204]/30 transition-colors \${(!student.groups?.length && !student.groupId) ? 'ring-2 ring-[#FEC204] shadow-[0_0_20px_rgba(254,194,4,0.1)]' : ''}\`}
            >`;

code = code.replace(cardTarget, cardReplace);

fs.writeFileSync('src/pages/admin/AdminStudents.tsx', code);
