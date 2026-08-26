const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminStudents.tsx', 'utf8');

if (!content.includes("import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'")) {
    content = content.replace("import { User, Group, Payment, Attendance } from '../../types';", "import { User, Group, Payment, Attendance } from '../../types';\nimport { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';");
}

fs.writeFileSync('src/pages/admin/AdminStudents.tsx', content);
