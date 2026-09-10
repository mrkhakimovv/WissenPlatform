const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentSAT.tsx', 'utf-8');

code = code.replace(/\{\(lesson\.vocabularyEng \|\| lesson\.vocabularyUz\) && \([\s\S]*?<button[\s\S]*?onClick=\{\(\) => setPracticingVocab\(lesson\)\}[\s\S]*?Lug'atlarni yodlash[\s\S]*?<\/button>[\s\S]*?\)\}/, 
`                  <button 
                    onClick={() => setPracticingVocab(lesson)}
                    className="w-full py-3 rounded-xl font-bold bg-white/5 text-white/80 hover:bg-white/10 hover:text-white transition-colors border border-white/10 flex items-center justify-center gap-2"
                  >
                    <Book size={18} /> Lug'atlarni yodlash
                  </button>`);

fs.writeFileSync('src/pages/student/StudentSAT.tsx', code);
