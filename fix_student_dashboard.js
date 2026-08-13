import fs from 'fs';

let code = fs.readFileSync('src/pages/student/StudentDashboard.tsx', 'utf-8');

const regex = /\/\/ Fetch schedules for all groups[\s\S]*?const todays = schedules\.filter\(s => Number\(s\.dayOfWeek\) === todayDayOfWeek\);/;

const replacement = `// Build schedules from groups
      let schedules: any[] = [];
      fetchedGroups.forEach(g => {
          if (g.days && g.days.length > 0) {
              g.days.forEach(dayStr => {
                  schedules.push({
                      id: Math.random().toString(),
                      groupId: g.id,
                      subject: g.subject || '',
                      teacherName: g.teacherName || '',
                      dayOfWeek: Number(dayStr),
                      startTime: g.startTime || '',
                      endTime: g.endTime || '',
                      location: 'Asosiy xona'
                  });
              });
          }
      });
      
      const todayDayOfWeek = new Date().getDay() || 7; // 1-7
      const todays = schedules.filter(s => Number(s.dayOfWeek) === todayDayOfWeek);`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/pages/student/StudentDashboard.tsx', code);
