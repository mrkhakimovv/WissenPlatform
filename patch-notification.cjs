const fs = require('fs');
let code = fs.readFileSync('src/components/NotificationCenter.tsx', 'utf-8');

code = code.replace(
  "let all = snap.docs.map(d => ({id: d.id, ...d.data()}));",
  "let all: any[] = snap.docs.map(d => ({id: d.id, ...(d.data() as any)}));"
);

fs.writeFileSync('src/components/NotificationCenter.tsx', code);
