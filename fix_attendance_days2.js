import fs from 'fs';

let code = fs.readFileSync('src/pages/admin/AdminAttendance.tsx', 'utf-8');

code = code.replace(/  const \[schedules, setSchedules\] = useState<any\[\]>\(\[\]\);\n/, '');
code = code.replace(/    const unsubSched = onSnapshot\(query\(collection\(db, 'schedules'\)\), \(snap\) => \{\n      setSchedules\(snap\.docs\.map\(d => \(\{id: d\.id, \.\.\.d\.data\(\)\}\)\)\);\n    \}\);\n/, '');
code = code.replace(/unsubSched\(\); /, '');

fs.writeFileSync('src/pages/admin/AdminAttendance.tsx', code);
