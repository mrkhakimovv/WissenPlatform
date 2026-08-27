const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminMilliySertifikat.tsx', 'utf-8');

const oldHandleCreateTest = `  const handleCreateTest = () => {
    setEditingTest({
      title: 'Yangi Sertifikat Testi',
      questionCount: 45,
      variantCount: 0,
      testType: 'Milliy Sertifikat',
      format: 'rasch',
      questions: [],
      createdAt: new Date().toISOString()
    });
    setIsBuilderOpen(true);
  };`;

const newHandleCreateTest = `  const handleCreateTest = () => {
    setIsCreationModeModalOpen(true);
  };

  const handleStartCreation = (isFastMode: boolean) => {
    setEditingTest({
      title: 'Yangi Sertifikat Testi',
      questionCount: 45,
      variantCount: 0,
      testType: 'Milliy Sertifikat',
      format: 'rasch',
      isFastMode,
      questions: [],
      createdAt: new Date().toISOString()
    });
    setIsCreationModeModalOpen(false);
    setIsBuilderOpen(true);
  };`;

code = code.replace(oldHandleCreateTest, newHandleCreateTest);
fs.writeFileSync('src/pages/admin/AdminMilliySertifikat.tsx', code);
