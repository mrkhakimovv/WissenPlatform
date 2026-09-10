const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSATBuilder.tsx', 'utf-8');

const settingsHandler = `
  const handleSettingsChange = (field: 'questionCount' | 'variantCount', value: number) => {
    let newQuestions = [...testData.questions];
    
    if (field === 'questionCount') {
      if (value > newQuestions.length) {
        // Add new questions
        const toAdd = value - newQuestions.length;
        for (let i = 0; i < toAdd; i++) {
          newQuestions.push({
            id: Math.random().toString(),
            text: '',
            options: Array(testData.variantCount).fill(''),
            correctOptionIndex: 0
          });
        }
      } else if (value < newQuestions.length) {
        // Remove extra questions
        newQuestions = newQuestions.slice(0, value);
      }
      setTestData({ ...testData, questionCount: value, questions: newQuestions });
    } else if (field === 'variantCount') {
      // Update options for all questions
      newQuestions = newQuestions.map(q => {
        let newOptions = [...q.options];
        if (value > newOptions.length) {
          const toAdd = value - newOptions.length;
          newOptions = [...newOptions, ...Array(toAdd).fill('')];
        } else if (value < newOptions.length) {
          newOptions = newOptions.slice(0, value);
        }
        
        return {
          ...q,
          options: newOptions,
          // Ensure correctOptionIndex doesn't exceed the new variant length
          correctOptionIndex: q.correctOptionIndex >= value ? 0 : q.correctOptionIndex
        };
      });
      setTestData({ ...testData, variantCount: value, questions: newQuestions });
    }
  };
`;

code = code.replace(
  `  const updateQuestion = (index: number, field: keyof TestQuestion, value: any) => {`,
  settingsHandler + `\n  const updateQuestion = (index: number, field: keyof TestQuestion, value: any) => {`
);

const oldHeader = `            <div className="mb-8">
              <label className="block text-sm font-bold text-white/70 mb-2">Test Nomi</label>
              <input
                type="text"
                value={testData.title}
                onChange={(e) => setTestData({ ...testData, title: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FEC204]"
                placeholder="Test nomini kiriting (Masalan: SAT Matematika 1-variant)"
              />
            </div>`;

const newHeader = `            <div className="mb-8 grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-6 lg:col-span-8">
                <label className="block text-sm font-bold text-white/70 mb-2">Test Nomi</label>
                <input
                  type="text"
                  value={testData.title}
                  onChange={(e) => setTestData({ ...testData, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FEC204]"
                  placeholder="Test nomini kiriting (Masalan: SAT Matematika 1-variant)"
                />
              </div>
              <div className="md:col-span-3 lg:col-span-2">
                <label className="block text-sm font-bold text-white/70 mb-2">Savollar soni</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={testData.questionCount || 0}
                  onChange={(e) => handleSettingsChange('questionCount', parseInt(e.target.value) || 1)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FEC204]"
                />
              </div>
              <div className="md:col-span-3 lg:col-span-2">
                <label className="block text-sm font-bold text-white/70 mb-2">Variantlar soni</label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={testData.variantCount || 4}
                  onChange={(e) => handleSettingsChange('variantCount', parseInt(e.target.value) || 2)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FEC204]"
                />
              </div>
            </div>`;

code = code.replace(oldHeader, newHeader);

fs.writeFileSync('src/pages/admin/AdminSATBuilder.tsx', code);
