import fs from 'fs';

// Update AdminExams.tsx button
let examsCode = fs.readFileSync('src/pages/admin/AdminExams.tsx', 'utf8');
const buttonRegexExams = /<button onClick=\{\(\) => setIsTestConfigOpen\(true\)\} className="glass-panel px-6 py-3 font-bold text-white hover:bg-white\/10 transition-colors rounded-\[12px\] border border-white\/20">\s*Test yaratish\s*<\/button>/;
examsCode = examsCode.replace(buttonRegexExams, `<button onClick={() => {
            setTestConfig({
              title: '',
              questionCount: 10,
              variantCount: 4,
              testType: 'Mavzulashtirilgan',
              questions: [],
              createdAt: ''
            });
            setIsTestConfigOpen(true);
          }} className="bg-[#FEC204] text-black px-6 py-2.5 rounded-[12px] font-bold hover:bg-[#FEC204]/90 transition-colors shadow-[0_0_15px_rgba(254,194,4,0.3)] flex items-center gap-2 text-[14px] h-[46px]">
            <span className="text-xl leading-none">+</span> Test yaratish
          </button>`);
fs.writeFileSync('src/pages/admin/AdminExams.tsx', examsCode);

// Read AdminTestsDatabase.tsx
let dbCode = fs.readFileSync('src/pages/admin/AdminTestsDatabase.tsx', 'utf8');
// I need to add existingTests, isTestConfigOpen state, testConfig should be initialized properly
