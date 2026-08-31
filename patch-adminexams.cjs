const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminExams.tsx', 'utf-8');

code = code.replace(
  "const [allTests, setAllTests] = useState<{id: string, title: string, totalCount: number}[]>([]);",
  "const [allTests, setAllTests] = useState<{id: string, title: string, totalCount: number, testType?: string}[]>([]);"
);

fs.writeFileSync('src/pages/admin/AdminExams.tsx', code);
