import fs from 'fs';
let code = fs.readFileSync('src/pages/admin/AdminExams.tsx', 'utf8');

if (!code.includes('allTests')) {
  code = code.replace(
    'const [existingTests, setExistingTests] = useState<string[]>([]);',
    'const [existingTests, setExistingTests] = useState<string[]>([]);\n  const [allTests, setAllTests] = useState<{id: string, title: string, totalCount: number}[]>([]);'
  );
  
  code = code.replace(
    /const \[formData, setFormData\] = useState\(\{([^}]+)\}\);/g,
    `const [formData, setFormData] = useState({$1, testSources: [] as {testId: string, name: string, count: number}[]});`
  );
  
  code = code.replace(
    /setFormData\(\{ title: '', subject: '', groupId: '', date: '', startTime: '', duration: '', location: '', description: '' \}\);/g,
    `setFormData({ title: '', subject: '', groupId: '', date: '', startTime: '', duration: '', location: '', description: '', testSources: [] });`
  );
  
  code = code.replace(
    /setFormData\(\{([\s\S]*?)description: exam\.description \|\| ''\s*\}\);/g,
    `setFormData({$1description: exam.description || '', testSources: exam.testSources || []});`
  );

  code = code.replace(
    /const unsubTests = onSnapshot\(collection\(db, 'tests'\), snap => \{([\s\S]*?)\}, err => \{/g,
    `const unsubTests = onSnapshot(collection(db, 'tests'), snap => {
      const titles = new Set<string>();
      const testsData: any[] = [];
      snap.docs.forEach(d => {
        const data = d.data();
        if (data.title) titles.add(data.title);
        testsData.push({ id: d.id, title: data.title || 'Nomsiz test', totalCount: data.questions?.length || data.questionCount || 0 });
      });
      setExistingTests(Array.from(titles));
      setAllTests(testsData);
    }, err => {`
  );

  code = code.replace(
    /duration: Number\(formData.duration\),\s*location: formData.location,\s*description: formData.description/g,
    `duration: Number(formData.duration),
        location: formData.location,
        description: formData.description,
        testSources: formData.testSources`
  );

  code = code.replace(
    /duration: Number\(formData.duration\),\s*location: formData.location,\s*description: formData.description\s*\}/g,
    `duration: Number(formData.duration),
          location: formData.location,
          description: formData.description,
          testSources: formData.testSources
        }`
  );

  fs.writeFileSync('src/pages/admin/AdminExams.tsx', code);
}
