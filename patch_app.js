import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes("AdminTestsDatabase")) {
  code = code.replace(
    "import AdminExams from './pages/admin/AdminExams';",
    "import AdminExams from './pages/admin/AdminExams';\nimport AdminTestsDatabase from './pages/admin/AdminTestsDatabase';"
  );
  
  code = code.replace(
    `<Route path="exams" element={<AdminExams />} />`,
    `<Route path="tests" element={<AdminTestsDatabase />} />\n              <Route path="exams" element={<AdminExams />} />`
  );
}

fs.writeFileSync('src/App.tsx', code);
