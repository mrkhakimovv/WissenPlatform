const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf8');

const startStr = `{/* Left Sidebar - Progress */}`;
const startIdx = code.indexOf(startStr);
if (startIdx === -1) throw new Error('start not found');

const endStr = `</div>\n                    \n          <div className="mt-4 md:mt-8 border-t border-white/5 pt-4 md:pt-6">`;
const endIdx = code.indexOf(endStr, startIdx);
if (endIdx === -1) throw new Error('end not found');

const newSection = `
        {/* Left Sidebar - Progress */}
        <div className="w-full md:w-[260px] lg:w-[300px] shrink-0 border-b md:border-b-0 md:border-r border-white/10 flex flex-col bg-[#0d0d0d]/80 z-10">
        <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar md:h-full">
          <h3 className="text-white/60 font-bold mb-4 text-[13px] uppercase tracking-widest hidden md:block">Savollar</h3>
          <div className="flex md:grid md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3 overflow-x-auto md:overflow-visible pb-2 md:pb-0 custom-scrollbar">
            {testData.questions.map((_: any, idx: number) => (
              <button 
                key={idx}
                onClick={() => {
                  const el = document.getElementById(\`question-\${idx}\`);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={\`relative shrink-0 w-10 h-10 md:w-full md:h-auto md:aspect-square rounded-lg flex items-center justify-center text-[13px] md:text-[14px] font-bold transition-all \${
                  (answers[idx] !== undefined && answers[idx] !== "")
                     ? 'bg-white/20 text-white border border-white/10'
                     : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-transparent'
                }\`}
              >
                {idx + 1}
                {marked[idx] && (
                  <div className="absolute -top-1 -right-1 md:-top-1.5 md:-right-1.5 w-3 h-3 md:w-3.5 md:h-3.5 rounded-full bg-red-500 border-2 border-[#0d0d0d]" />
                )}
              </button>
            ))}
          </div>
`;

code = code.substring(0, startIdx) + newSection.trim() + '\n          ' + code.substring(endIdx);
fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
console.log('patched2');
