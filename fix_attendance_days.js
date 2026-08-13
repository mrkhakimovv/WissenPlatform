import fs from 'fs';

let code = fs.readFileSync('src/pages/admin/AdminAttendance.tsx', 'utf-8');

// Use group.days instead of schedules.
code = code.replace(
  /const groupSchedules = schedules\.filter\(s => s\.groupId === selectedGroupId\);\n  const allowedDaysOfWeek = groupSchedules\.map\(s => Number\(s\.dayOfWeek\)\); \/\/ 1 to 7/,
  `const allowedDaysOfWeek = (selectedGroup?.days || []).map(Number); // e.g. [1, 3, 5]`
);

// We should also display the schedule in the header based on group fields if schedules is empty?
code = code.replace(
  /\{groupSchedules\.length > 0 && <span className="text-white\/40 text-\[16px\] font-medium">\{groupSchedules\[0\]\.startTime\}<\/span>\}/,
  `{selectedGroup?.startTime && <span className="text-white/40 text-[16px] font-medium">{selectedGroup.startTime}{selectedGroup.endTime ? \` - \${selectedGroup.endTime}\` : ''}</span>}`
);

fs.writeFileSync('src/pages/admin/AdminAttendance.tsx', code);
