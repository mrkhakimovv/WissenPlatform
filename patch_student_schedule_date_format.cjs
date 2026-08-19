const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentSchedule.tsx', 'utf-8');

const targetLogic = `  const today = new Date();
  const currentDayOfWeek = today.getDay() || 7;
  
  const scheduleData = DAYS.map(dayInfo => {
    const diff = dayInfo.id - currentDayOfWeek;
    const dateForDay = new Date(today);
    dateForDay.setDate(today.getDate() + diff);
    const dateStr = dateForDay.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' });
    const isToday = diff === 0;`;

const replaceLogic = `  const today = new Date();
  const currentDayOfWeek = today.getDay() || 7;
  const MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];
  
  const scheduleData = DAYS.map(dayInfo => {
    const diff = dayInfo.id - currentDayOfWeek;
    const dateForDay = new Date(today);
    dateForDay.setDate(today.getDate() + diff);
    const dateStr = \`\${dateForDay.getDate()}-\${MONTHS[dateForDay.getMonth()]}, \${dateForDay.getFullYear()}\`;
    const isToday = diff === 0;`;

code = code.replace(targetLogic, replaceLogic);
fs.writeFileSync('src/pages/student/StudentSchedule.tsx', code);
