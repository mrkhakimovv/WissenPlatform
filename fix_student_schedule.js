import fs from 'fs';

let code = fs.readFileSync('src/pages/student/StudentSchedule.tsx', 'utf-8');

// Replace schedules state logic
code = code.replace(/const \[schedules, setSchedules\] = useState<ScheduleItem\[\]>\(\[\]\);/, 'const [schedules, setSchedules] = useState<any[]>([]);');

code = code.replace(/    const queryGroups = userGroups\.slice\(0, 10\);\n    const q = query\(collection\(db, 'schedules'\), where\('groupId', 'in', queryGroups\)\);\n    \n    const unsubscribe = onSnapshot\(q, \(snapshot\) => \{\n      const data: ScheduleItem\[\] = \[\];\n      snapshot\.forEach\(doc => \{\n        data\.push\(\{ id: doc\.id, \.\.\.doc\.data\(\) \} as ScheduleItem\);\n      \}\);\n      setSchedules\(data\);\n    \}\);\n\n    return \(\) => unsubscribe\(\);/, 
`    // Build schedules from groups data
    return () => {};`);

code = code.replace(/setGroups\(fetchedGroups\);/, 
`setGroups(fetchedGroups);
        const mappedSchedules: any[] = [];
        fetchedGroups.forEach(g => {
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
        });
        setSchedules(mappedSchedules);`);

fs.writeFileSync('src/pages/student/StudentSchedule.tsx', code);
