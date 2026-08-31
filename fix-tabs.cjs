const fs = require('fs');

let code = fs.readFileSync('src/pages/admin/AdminSATDatabase.tsx', 'utf-8');

if (!code.includes('activeTab')) {
    code = code.replace(
        'const [existingTests, setExistingTests] = useState<string[]>([]);',
        `const [existingTests, setExistingTests] = useState<string[]>([]);\n  const [activeTab, setActiveTab] = useState<'exams' | 'base'>('exams');`
    );
}

const origStart = code.indexOf('<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">');
const modalStart = code.indexOf('{isExamModalOpen && (');
if (origStart === -1 || modalStart === -1) {
    console.error("Could not find boundaries"); process.exit(1);
}

const mainContent = code.substring(origStart, modalStart);

// testsList block
const testsListStart = mainContent.indexOf('{tests.length === 0 ? (');
const examsTitleStart = mainContent.indexOf('<div className="mt-12 flex flex-col md:flex-row md:items-end justify-between gap-4">');
const testsListStr = mainContent.substring(testsListStart, examsTitleStart).trim();

// examsList block
const examsListStart = mainContent.indexOf('{satExams.length === 0 ? (');
const examsListStr = mainContent.substring(examsListStart).trim();

const newHeader = `<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div className="flex bg-white/5 p-1 rounded-xl w-fit border border-white/10">
          <button 
            onClick={() => setActiveTab('exams')}
            className={\`px-6 py-2.5 rounded-lg font-bold text-sm transition-all \${activeTab === 'exams' ? 'bg-[#FEC204] text-black shadow-[0_0_10px_rgba(254,194,4,0.3)]' : 'text-white/60 hover:text-white hover:bg-white/5'}\`}
          >
            SAT EXAMS
          </button>
          <button 
            onClick={() => setActiveTab('base')}
            className={\`px-6 py-2.5 rounded-lg font-bold text-sm transition-all \${activeTab === 'base' ? 'bg-[#FEC204] text-black shadow-[0_0_10px_rgba(254,194,4,0.3)]' : 'text-white/60 hover:text-white hover:bg-white/5'}\`}
          >
            SAT BASE
          </button>
        </div>
        <div className="flex gap-2">
          {activeTab === 'base' ? (
             <button 
                onClick={() => {
                  setTestConfig({
                    title: '',
                    questionCount: 10,
                    variantCount: 4,
                    testType: 'sat',
                    satType: 'SAT Mavzulashtirilgan',
                    questions: [],
                    createdAt: ''
                  });
                  setIsTestConfigOpen(true);
                }}
                className="bg-[#FEC204] text-black px-6 py-2.5 rounded-[12px] font-bold hover:bg-[#FEC204]/90 transition-colors shadow-[0_0_15px_rgba(254,194,4,0.3)] flex items-center gap-2 text-[14px]"
             >
                <span className="text-xl leading-none">+</span> Test yaratish
             </button>
          ) : (
             <button onClick={openExamAdd} className="bg-[#FEC204] text-black px-6 py-2.5 rounded-[12px] font-bold hover:bg-[#FEC204]/90 transition-colors shadow-[0_0_15px_rgba(254,194,4,0.3)] flex items-center gap-2 text-[14px]">
                <span className="text-xl leading-none">+</span> Sat online test
             </button>
          )}
        </div>
      </div>`;

const newBody = `
      <div>
        {activeTab === 'exams' ? (
           <>
              <div className="mb-4">
                 <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">Markaz ichki SAT imtihonlari ro'yxati</p>
              </div>
              ${examsListStr}
           </>
        ) : (
           <>
              <div className="mb-4">
                 <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">Barcha yaratilgan testlar to'plami</p>
              </div>
              ${testsListStr}
           </>
        )}
      </div>

      `;

const replacement = newHeader + newBody;
code = code.substring(0, origStart) + replacement + code.substring(modalStart);
fs.writeFileSync('src/pages/admin/AdminSATDatabase.tsx', code);
console.log('Success');
