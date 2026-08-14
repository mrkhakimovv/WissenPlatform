import fs from 'fs';
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf8');

const regexToReplace = /<div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-8 flex items-start justify-center">\s*<div className="w-full max-w-3xl">\s*\{\/\* Progress \*\/\}\s*<div className="flex gap-1 mb-6 md:mb-8 overflow-x-auto pb-2 custom-scrollbar">[\s\S]*?<\/div>\s*<motion\.div/g;

const replacement = `<div className="flex-1 flex flex-col md:flex-row overflow-hidden">
      
      {/* Left Sidebar - Progress */}
      <div className="w-full md:w-[260px] lg:w-[300px] shrink-0 border-b md:border-b-0 md:border-r border-white/10 flex flex-col bg-[#0d0d0d]/80 z-10">
        <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar md:h-full">
          <h3 className="text-white/60 font-bold mb-4 text-[13px] uppercase tracking-widest hidden md:block">Savollar</h3>
          <div className="flex md:grid md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3 overflow-x-auto md:overflow-visible pb-2 md:pb-0 custom-scrollbar">
            {testData.questions.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                className={\`relative shrink-0 w-10 h-10 md:w-full md:h-auto md:aspect-square rounded-lg flex items-center justify-center text-[13px] md:text-[14px] font-bold transition-all \${
                  currentQuestion === idx 
                    ? 'bg-[#FEC204] text-black shadow-[0_0_15px_rgba(254,194,4,0.3)] md:scale-105' 
                    : answers[idx] !== undefined
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
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-8 flex items-start justify-center relative">
        <div className="w-full max-w-3xl pt-2 md:pt-0 pb-10">
          <motion.div`;

if (!regexToReplace.test(code)) {
    console.error("Regex did not match!");
    process.exit(1);
}

code = code.replace(regexToReplace, replacement);

const endRegex = /<\/div>\s*<\/div>\s*<\/div>,\s*document\.body/g;
if (!endRegex.test(code)) {
    console.error("End regex did not match!");
    process.exit(1);
}

code = code.replace(endRegex, `</div>
        </div>
      </div>
    </div>,
    document.body`);

fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
console.log("Layout updated successfully.");
