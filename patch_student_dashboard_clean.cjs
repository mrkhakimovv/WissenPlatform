const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentDashboard.tsx', 'utf-8');

const targetLogic = `      // Build schedules from groups
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
      });
      
      const todayDayOfWeek = new Date().getDay() || 7; // 1-7
      const todays = schedules.filter(s => Number(s.dayOfWeek) === todayDayOfWeek);
      todays.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
      setTodaySchedules(todays);`;

code = code.replace(targetLogic, '');
fs.writeFileSync('src/pages/student/StudentDashboard.tsx', code);
