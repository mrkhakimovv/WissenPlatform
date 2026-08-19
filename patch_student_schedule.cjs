const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentSchedule.tsx', 'utf-8');

const targetLogic = `        fetchedGroups.forEach(g => {
            if (g.days && g.days.length > 0) {
                g.days.forEach(dayStr => {
                    mappedSchedules.push({
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

const replaceLogic = `        fetchedGroups.forEach(g => {
            if (g.days && g.days.length > 0) {
                g.days.forEach(dayStr => {
                    const sched = g.schedule?.[dayStr] || { startTime: g.startTime || '', endTime: g.endTime || '' };
                    mappedSchedules.push({
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
fs.writeFileSync('src/pages/student/StudentSchedule.tsx', code);
