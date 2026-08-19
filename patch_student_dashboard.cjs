const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentDashboard.tsx', 'utf-8');

const targetLogic = `      // Build schedules from groups
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
      });`;

const replaceLogic = `      // Build schedules from groups
      let schedules: any[] = [];
      fetchedGroups.forEach(g => {
          if (g.days && g.days.length > 0) {
              g.days.forEach(dayStr => {
                  const sched = g.schedule?.[dayStr] || { startTime: g.startTime || '', endTime: g.endTime || '' };
                  schedules.push({
                      id: Math.random().toString(),
                      groupId: g.id,
                      subject: g.subject || '',
                      teacherName: g.teacherName || '',
                      dayOfWeek: Number(dayStr),
                      startTime: sched.startTime || '',
                      endTime: sched.endTime || '',
                      location: 'Asosiy xona'
                  });
              });
          }
      });`;

code = code.replace(targetLogic, replaceLogic);
fs.writeFileSync('src/pages/student/StudentDashboard.tsx', code);
