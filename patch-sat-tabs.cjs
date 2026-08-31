const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSATDatabase.tsx', 'utf-8');

// Add activeTab state if it doesn't exist
if (!code.includes('activeTab')) {
    code = code.replace(
        'const [existingTests, setExistingTests] = useState<string[]>([]);',
        `const [existingTests, setExistingTests] = useState<string[]>([]);\n  const [activeTab, setActiveTab] = useState<'exams' | 'base'>('exams');`
    );
}

// First, grab the tests list block
const testListMatch = code.match(/\{tests\.length === 0 \? \([\s\S]*?\}\s*\)\s*\}/);
if (!testListMatch) {
    console.error("Could not find tests list");
    process.exit(1);
}
const testsListBlock = testListMatch[0];

// Grab the exams list block
const examListMatch = code.match(/\{satExams\.length === 0 \? \([\s\S]*?\}\s*\)\s*\}/);
if (!examListMatch) {
    console.error("Could not find exams list");
    process.exit(1);
}
const examsListBlock = examListMatch[0];

// Replace everything from `<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">`
// down to the end of `examsListBlock`.

const startStr = `<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">`;
const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(examsListBlock) + examsListBlock.length;

if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    console.error("Could not find replacement bounds");
    process.exit(1);
}

const replacement = `<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
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
      
      <div className="mt-6">
         {activeTab === 'exams' ? (
           <>
              <div className="mb-4">
                 <h2 className="text-[20px] font-black tracking-tight text-white mb-1">SAT Imtihonlar</h2>
                 <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">Markaz ichki SAT imtihonlari</p>
              </div>
              ${examsListBlock.replace(/\$/g, '$$$$')}
           </>
         ) : (
           <>
              <div className="mb-4">
                 <h2 className="text-[20px] font-black tracking-tight text-white mb-1">SAT BAZA</h2>
                 <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">Barcha yaratilgan testlar to'plami ({tests.length})</p>
              </div>
              ${testsListBlock.replace(/\$/g, '$$$$')}
           </>
         )}
      </div>`;

code = code.substring(0, startIndex) + replacement + code.substring(endIndex);

fs.writeFileSync('src/pages/admin/AdminSATDatabase.tsx', code);
console.log('Successfully patched tabs.');

