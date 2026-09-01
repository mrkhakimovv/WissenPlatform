const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf-8');

// 1. Add hasUnassignedStudents to stats state
if (!code.includes('hasUnassignedStudents')) {
    code = code.replace(
        "subjects: 0",
        "subjects: 0,\n    hasUnassignedStudents: false"
    );
}

// 2. Update unsubStudents
const unsubStudentsMatch = code.match(/const unsubStudents = onSnapshot\(qStudents, \(snap\) => \{\s*setStats\(s => \(\{\s*\.\.\.s, students: snap\.docs\.length\s*\}\)\);\s*\}\);/);
if (unsubStudentsMatch) {
    const newUnsubStudents = `const unsubStudents = onSnapshot(qStudents, (snap) => {
      let unassigned = false;
      snap.docs.forEach(d => {
        const data = d.data();
        if ((!data.groups || data.groups.length === 0) && !data.groupId) {
           unassigned = true;
        }
      });
      setStats(s => ({ ...s, students: snap.docs.length, hasUnassignedStudents: unassigned }));
    });`;
    code = code.replace(unsubStudentsMatch[0], newUnsubStudents);
}

// 3. Update the UI for O'quvchilar card
const cardStart = code.indexOf("<div onClick={() => navigate('/admin/students', { replace: true })}");
const cardEnd = code.indexOf("<div onClick={() => navigate('/admin/attendance', { replace: true })}");
if (cardStart !== -1 && cardEnd !== -1) {
    let cardContent = code.substring(cardStart, cardEnd);
    
    // add relative to the class list if not there
    if (!cardContent.includes("relative")) {
        cardContent = cardContent.replace('className="glass-panel', 'className="relative glass-panel');
    }

    // Add the pulsing border overlay
    if (!cardContent.includes("stats.hasUnassignedStudents")) {
        const insertPos = cardContent.indexOf("><p") + 1; // right after className="...">
        const overlay = `
          {stats.hasUnassignedStudents && (
             <div className="absolute inset-0 rounded-[1.5rem] border-2 border-[#FEC204] shadow-[0_0_15px_rgba(254,194,4,0.5)] animate-pulse pointer-events-none z-10"></div>
          )}
          `;
        cardContent = cardContent.substring(0, insertPos) + overlay + cardContent.substring(insertPos);
    }
    
    code = code.substring(0, cardStart) + cardContent + code.substring(cardEnd);
}

fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', code);
console.log('Success');
