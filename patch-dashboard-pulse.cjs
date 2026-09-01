const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf-8');

if (!code.includes('hasUpcomingClass')) {
    code = code.replace(
        "hasUnassignedStudents: false",
        "hasUnassignedStudents: false,\n    hasUpcomingClass: false"
    );
}

// Update the useEffect to include checking for upcoming classes
const qSubjectsMatch = code.indexOf("const qSubjects = query(collection(db, 'subjects'));");
if (qSubjectsMatch !== -1) {
    const newCode = `
    const qGroups = query(collection(db, 'groups'));
    let groupsData = [];
    const unsubGroups = onSnapshot(qGroups, (snap) => {
      groupsData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      checkUpcomingClasses();
    });

    let intervalId;
    const checkUpcomingClasses = () => {
      const now = new Date();
      const currentDay = now.getDay();
      const currentDayId = currentDay === 0 ? '7' : String(currentDay);
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTimeInMins = currentHours * 60 + currentMinutes;

      let hasUpcoming = false;
      for (const group of groupsData) {
        if (group.days && group.days.includes(currentDayId)) {
          const sched = group.schedule?.[currentDayId] || { startTime: group.startTime, endTime: group.endTime };
          if (sched && sched.startTime) {
             const [h, m] = sched.startTime.split(':').map(Number);
             const classTimeInMins = h * 60 + m;
             const diff = classTimeInMins - currentTimeInMins;
             // class starts in 10 minutes or less (and hasn't started more than 0 mins ago, to just flash before class)
             // or let's say diff is between 0 and 10
             if (diff >= 0 && diff <= 10) {
               hasUpcoming = true;
               break;
             }
          }
        }
      }
      setStats(s => ({ ...s, hasUpcomingClass: hasUpcoming }));
    };

    intervalId = setInterval(checkUpcomingClasses, 60000);
    
    `;
    code = code.substring(0, qSubjectsMatch) + newCode + code.substring(qSubjectsMatch);
}

// add unsubGroups and clearInterval to the cleanup function
const cleanupMatch = code.indexOf("unsubStudents();");
if (cleanupMatch !== -1 && !code.includes("unsubGroups();")) {
    code = code.substring(0, cleanupMatch) + "unsubGroups(); clearInterval(intervalId); " + code.substring(cleanupMatch);
}

// Update the Davomat card in JSX
const davomatCardRegex = /<div onClick=\{\(\) => navigate\('\/admin\/attendance', \{ replace: true \}\)\} className="glass-panel p-4 md:p-6 border-l-4 border-\[#FEC204\] hover:scale-\[1\.02\] transition-transform cursor-pointer">/g;

if (davomatCardRegex.test(code)) {
    const replacement = `<div onClick={() => navigate('/admin/attendance', { replace: true })} className="relative glass-panel p-4 md:p-6 border-l-4 border-[#FEC204] hover:scale-[1.02] transition-transform cursor-pointer">
          {stats.hasUpcomingClass && (
             <div className="absolute inset-0 rounded-[1.5rem] border-2 border-[#FEC204] shadow-[0_0_15px_rgba(254,194,4,0.5)] animate-pulse pointer-events-none z-10"></div>
          )}`;
    code = code.replace(davomatCardRegex, replacement);
}

fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', code);
console.log('Success');
