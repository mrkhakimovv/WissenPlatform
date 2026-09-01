const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf-8');

// 1. Add groups to stats
code = code.replace(
    "subjects: 0,",
    "subjects: 0,\n    groups: 0,"
);

// 2. Update unsubGroups to also set stats.groups
code = code.replace(
    /const unsubGroups = onSnapshot\(qGroups, \(snap\) => \{\s*groupsData = snap\.docs\.map\(d => \(\{ id: d\.id, \.\.\.d\.data\(\) \}\)\);\s*checkUpcomingClasses\(\);\s*\}\);/,
    `const unsubGroups = onSnapshot(qGroups, (snap) => {
      groupsData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setStats(s => ({ ...s, groups: snap.docs.length }));
      checkUpcomingClasses();
    });`
);

// 3. Update the UI
code = code.replace(
    /<p className="text-\[9px\] md:text-\[11px\] uppercase tracking-\[2px\] font-bold text-white\/40 mb-1">Fanlar<\/p>\s*<p className="text-\[26px\] md:text-\[32px\] font-\[900\] tracking-\[-1px\] text-white">\{stats\.subjects\}<\/p>\s*<p className="text-xs font-bold text-white\/40 mt-1\.5">Aktiv kurslar<\/p>/,
    `<p className="text-[9px] md:text-[11px] uppercase tracking-[2px] font-bold text-white/40 mb-1">Guruhlar</p>
          <p className="text-[26px] md:text-[32px] font-[900] tracking-[-1px] text-white">{stats.groups}</p>
          <p className="text-xs font-bold text-white/40 mt-1.5">Aktiv guruhlar</p>`
);

fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', code);
console.log('Success');
