const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSATDatabase.tsx', 'utf-8');

// 1. Update state definition
if (!code.includes("'real_exams'")) {
    code = code.replace(
        "const [activeTab, setActiveTab] = useState<'exams' | 'base'>('exams');",
        "const [activeTab, setActiveTab] = useState<'exams' | 'base' | 'real_exams'>('exams');"
    );
}

// Ensure baseTests and realExamTests exist
if (!code.includes("const baseTests = tests.filter")) {
    code = code.replace("return (", "const baseTests = tests.filter(t => t.satType !== 'SAT real EXAM');\n  const realExamTests = tests.filter(t => t.satType === 'SAT real EXAM');\n\n  return (");
}

// Find the return block components
const returnStart = code.indexOf('return (');
const modalStart = code.indexOf('{isExamModalOpen && (');
if (returnStart === -1 || modalStart === -1) {
    console.error("Could not find boundaries"); process.exit(1);
}

const mainContent = code.substring(returnStart, modalStart);

const testsListStart = mainContent.indexOf('{tests.length === 0 ? (');
const testsListEndMatch = mainContent.match(/\{tests\.length === 0 \? \([\s\S]*?\)\s*:\s*\([\s\S]*?\}\s*\)/);
if (!testsListEndMatch) {
    console.error("Could not find tests list"); process.exit(1);
}
const testsListStr = testsListEndMatch[0];

const examsListStart = mainContent.indexOf('{satExams.length === 0 ? (');
const examsListEndMatch = mainContent.match(/\{satExams\.length === 0 \? \([\s\S]*?\)\s*:\s*\([\s\S]*?\}\s*\)/);
if (!examsListEndMatch) {
    console.error("Could not find exams list"); process.exit(1);
}
const examsListStr = examsListEndMatch[0];

// Prepare the new header
const newHeader = `  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
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
          <button 
            onClick={() => setActiveTab('real_exams')}
            className={\`px-6 py-2.5 rounded-lg font-bold text-sm transition-all \${activeTab === 'real_exams' ? 'bg-[#FEC204] text-black shadow-[0_0_10px_rgba(254,194,4,0.3)]' : 'text-white/60 hover:text-white hover:bg-white/5'}\`}
          >
            EXAM BASE
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
          ) : activeTab === 'real_exams' ? (
             <button 
                onClick={() => {
                  setTestConfig({
                    title: '',
                    questionCount: 10,
                    variantCount: 4,
                    testType: 'sat',
                    satType: 'SAT real EXAM',
                    questions: [],
                    createdAt: ''
                  });
                  setIsTestConfigOpen(true);
                }}
                className="bg-[#FEC204] text-black px-6 py-2.5 rounded-[12px] font-bold hover:bg-[#FEC204]/90 transition-colors shadow-[0_0_15px_rgba(254,194,4,0.3)] flex items-center gap-2 text-[14px]"
             >
                <span className="text-xl leading-none">+</span> Real Exam yaratish
             </button>
          ) : (
             <button onClick={openExamAdd} className="bg-[#FEC204] text-black px-6 py-2.5 rounded-[12px] font-bold hover:bg-[#FEC204]/90 transition-colors shadow-[0_0_15px_rgba(254,194,4,0.3)] flex items-center gap-2 text-[14px]">
                <span className="text-xl leading-none">+</span> Sat online test
             </button>
          )}
        </div>
      </div>`;

// We'll create custom list strings for base and real_exams by replacing 'tests' with filtered lists
const baseTestsListStr = testsListStr.replace(/tests\.length/g, "baseTests.length").replace(/tests\.map/g, "baseTests.map");
const realExamsTestsListStr = testsListStr.replace(/tests\.length/g, "realExamTests.length").replace(/tests\.map/g, "realExamTests.map");

const newBody = `
      <div>
        {activeTab === 'exams' ? (
           <>
              <div className="mb-4">
                 <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">Markaz ichki SAT imtihonlari ro'yxati</p>
              </div>
              ${examsListStr}
           </>
        ) : activeTab === 'base' ? (
           <>
              <div className="mb-4">
                 <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">Barcha yaratilgan testlar to'plami ({baseTests.length})</p>
              </div>
              ${baseTestsListStr}
           </>
        ) : (
           <>
              <div className="mb-4">
                 <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">SAT Real Imtihonlar bazasi ({realExamTests.length})</p>
              </div>
              ${realExamsTestsListStr}
           </>
        )}
      </div>

      `;

const replacement = newHeader + newBody;
code = code.substring(0, returnStart) + replacement + code.substring(modalStart);

fs.writeFileSync('src/pages/admin/AdminSATDatabase.tsx', code);
console.log('Success');
