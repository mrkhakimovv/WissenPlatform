import fs from 'fs';
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf8');

// 1. Add Bookmark to lucide-react import
code = code.replace(
  "import { X, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';",
  "import { X, CheckCircle, ChevronRight, ChevronLeft, Bookmark } from 'lucide-react';"
);

// 2. Add marked state
if (!code.includes("const [marked, setMarked]")) {
  code = code.replace(
    "const [answers, setAnswers] = useState<Record<number, number>>({});",
    "const [answers, setAnswers] = useState<Record<number, number>>({});\n  const [marked, setMarked] = useState<Record<number, boolean>>({});"
  );
}

// 3. Update pagination buttons
const oldPagination = `<div className="flex gap-1 mb-8 overflow-x-auto pb-2 custom-scrollbar">
            {testData.questions.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                className={\`w-8 h-8 shrink-0 rounded-md flex items-center justify-center text-[13px] font-bold transition-colors \${
                  currentQuestion === idx 
                    ? 'bg-[#FEC204] text-black' 
                    : answers[idx] !== undefined
                      ? 'bg-white/20 text-white'
                      : 'bg-white/5 text-white/40 hover:bg-white/10'
                }\`}
              >
                {idx + 1}
              </button>
            ))}
          </div>`;

const newPagination = `<div className="flex gap-1 mb-8 overflow-x-auto pb-2 custom-scrollbar">
            {testData.questions.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                className={\`relative w-8 h-8 shrink-0 rounded-md flex items-center justify-center text-[13px] font-bold transition-colors \${
                  currentQuestion === idx 
                    ? 'bg-[#FEC204] text-black' 
                    : answers[idx] !== undefined
                      ? 'bg-white/20 text-white'
                      : 'bg-white/5 text-white/40 hover:bg-white/10'
                }\`}
              >
                {idx + 1}
                {marked[idx] && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border border-[#0d0d0d]" />
                )}
              </button>
            ))}
          </div>`;

code = code.replace(oldPagination, newPagination);

// 4. Update the question container
const oldQuestion = `          <motion.div 
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-6 md:p-10 rounded-[24px]"
          >
            <h3 className="text-[20px] font-bold text-white mb-6 leading-relaxed">`;

const newQuestion = `          <motion.div 
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-6 md:p-10 rounded-[24px] relative"
          >
            <button
              onClick={() => setMarked(prev => ({ ...prev, [currentQuestion]: !prev[currentQuestion] }))}
              className={\`absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center transition-colors \${
                marked[currentQuestion] 
                  ? 'bg-[rgba(254,194,4,0.1)] text-[#FEC204]' 
                  : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
              }\`}
            >
              <Bookmark size={20} className={marked[currentQuestion] ? "fill-current" : ""} />
            </button>
            <h3 className="text-[20px] font-bold text-white mb-6 leading-relaxed pr-12">`;

code = code.replace(oldQuestion, newQuestion);

fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
