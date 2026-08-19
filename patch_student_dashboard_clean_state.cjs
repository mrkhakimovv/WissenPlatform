const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentDashboard.tsx', 'utf-8');

const targetLogic = `  const [todaySchedules, setTodaySchedules] = useState<any[]>([]);`;

code = code.replace(targetLogic, '');
fs.writeFileSync('src/pages/student/StudentDashboard.tsx', code);
