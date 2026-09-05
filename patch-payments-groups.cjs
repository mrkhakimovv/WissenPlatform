const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminPayments.tsx', 'utf-8');

code = code.replace(
  "const [payments, setPayments] = useState<any[]>([]);",
  "const [payments, setPayments] = useState<any[]>([]);\n  const [groups, setGroups] = useState<any[]>([]);"
);

code = code.replace(
  "return () => { unsubStudents(); unsubPayments(); }",
  "const unsubGroups = onSnapshot(query(collection(db, 'groups')), (snap) => {\n      setGroups(snap.docs.map(d => ({id: d.id, ...d.data()})));\n    });\n    return () => { unsubStudents(); unsubPayments(); unsubGroups(); }"
);

fs.writeFileSync('src/pages/admin/AdminPayments.tsx', code);
