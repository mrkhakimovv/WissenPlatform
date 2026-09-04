const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSATBuilder.tsx', 'utf-8');

const sidebarRegex = /\{testData\.questions\.map\(\(q, i\) => \([\s\S]*?<\/button>\s*\)\)\}/;
const match = code.match(sidebarRegex);

if (match) {
    const replacement = `{testData.questions.map((q, i) => {
              const isRealExam = testData.satType === 'SAT real EXAM';
              const showModule1 = isRealExam && i === 0;
              const showModule2 = isRealExam && i === 22;
              return (
                <React.Fragment key={q.id}>
                  {showModule1 && <div className="text-[10px] uppercase font-black text-white/40 tracking-wider px-3 pt-3 pb-1">Modul 1 (1-22)</div>}
                  {showModule2 && <div className="text-[10px] uppercase font-black text-white/40 tracking-wider px-3 pt-4 pb-1">Modul 2 (23-44)</div>}
                  <button
                    onClick={() => { setActiveQuestion(i); setIsFastAnswerModeOpen(false); }}
                    className={\`w-full text-left p-3 rounded-lg flex items-center justify-between transition-colors shrink-0 \${activeQuestion === i ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5'}\`}
                  >
                    <span className="font-bold text-sm">Savol {i + 1}</span>
                    {q.text.trim() && <CheckCircle2 size={14} className="text-[#FEC204]" />}
                  </button>
                </React.Fragment>
              );
            })}`;
    
    code = code.replace(sidebarRegex, replacement);
    fs.writeFileSync('src/pages/admin/AdminSATBuilder.tsx', code);
    console.log("Success");
} else {
    console.log("Not found");
}
