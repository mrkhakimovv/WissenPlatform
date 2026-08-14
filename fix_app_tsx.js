import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('import StudentResults from')) {
  code = code.replace(
    "import StudentExams from './pages/student/StudentExams';",
    "import StudentExams from './pages/student/StudentExams';\nimport StudentResults from './pages/student/StudentResults';"
  );
  
  code = code.replace(
    /<Route path="exams" element={<StudentExams \/>} \/>/,
    '<Route path="exams" element={<StudentExams />} />\n              <Route path="results" element={<StudentResults />} />'
  );

  fs.writeFileSync('src/App.tsx', code);
}
