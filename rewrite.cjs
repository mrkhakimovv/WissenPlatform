const fs = require('fs');

let code = fs.readFileSync('src/pages/admin/AdminSATDatabase.tsx', 'utf-8');

// Add activeTab state
if (!code.includes('activeTab')) {
    code = code.replace(
        'const [existingTests, setExistingTests] = useState<string[]>([]);',
        `const [existingTests, setExistingTests] = useState<string[]>([]);\n  const [activeTab, setActiveTab] = useState<'exams' | 'base'>('exams');`
    );
}

// Find the return block
const startOfReturn = code.indexOf('return (');
if (startOfReturn === -1) {
    console.log("no return found"); process.exit(1);
}

// Let's replace the whole structure.
// We'll keep the modals intact. Modals start at:
// {isExamModalOpen && (
const modalStartIndex = code.indexOf('{isExamModalOpen && (');
const mainJSX = code.substring(startOfReturn, modalStartIndex);

// mainJSX currently contains:
/*
  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-black tracking-tight text-white mb-1">SAT BAZA</h1>
          <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">Barcha yaratilgan testlar to'plami ({tests.length})</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              ...
            }}
            ...
          >
            ...
          </button>
          <button onClick={openExamAdd} className="...">
            Sat online test
          </button>
        </div>
      </div>
      
      {tests.length === 0 ? (
        // tests
      ) : (
        // tests list
      )}
            
      <div className="mt-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-black tracking-tight text-white mb-1">SAT Imtihonlar</h2>
          ...
        </div>
      </div>
      
      {satExams.length === 0 ? (
        // exams
      ) : (
        // exams list
      )}
*/

const testsListRegex = /\{tests\.length === 0 \? \([\s\S]*?\)\s*:\s*\([\s\S]*?\}\s*\)/;
const examsListRegex = /\{satExams\.length === 0 \? \([\s\S]*?\)\s*:\s*\([\s\S]*?\}\s*\)/;

const testsListMatch = mainJSX.match(testsListRegex);
const examsListMatch = mainJSX.match(examsListRegex);

if (!testsListMatch || !examsListMatch) {
    console.log("Could not find lists");
    process.exit(1);
}

const testsListStr = testsListMatch[0];
const examsListStr = examsListMatch[0];

const newMainJSX = `  return (
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
      </div>

      <div>
        {activeTab === 'exams' ? (
           <>
              <div className="mb-4">
                 <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">Markaz ichki SAT imtihonlari ro'yxati</p>
              </div>
              ${examsListStr.replace(/\$/g, '$$$$')}
           </>
        ) : (
           <>
              <div className="mb-4">
                 <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">Barcha yaratilgan testlar to'plami ({tests.length})</p>
              </div>
              ${testsListStr.replace(/\$/g, '$$$$')}
           </>
        )}
      </div>

      `;

code = code.substring(0, startOfReturn) + newMainJSX + code.substring(modalStartIndex);
fs.writeFileSync('src/pages/admin/AdminSATDatabase.tsx', code);
console.log('Done');
