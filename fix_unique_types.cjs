const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminTestsDatabase.tsx', 'utf-8');

const returnTarget = `  const handleEdit = (t: TestData) => {
    setTestConfig(t);
    setIsTestBuilderOpen(true);
  };

  return (`;

const newReturn = `  const handleEdit = (t: TestData) => {
    setTestConfig(t);
    setIsTestBuilderOpen(true);
  };

  const uniqueTypes = ['Barchasi', ...Array.from(new Set(tests.map(t => t.testType || "Noma'lum").filter(Boolean)))];
  const filteredTests = filterType === 'Barchasi' ? tests : tests.filter(t => (t.testType || "Noma'lum") === filterType);

  return (`;

code = code.replace(returnTarget, newReturn);
fs.writeFileSync('src/pages/admin/AdminTestsDatabase.tsx', code);
