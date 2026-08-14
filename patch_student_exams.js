import fs from 'fs';
let code = fs.readFileSync('src/pages/student/StudentExams.tsx', 'utf8');

code = code.replace(
  "import { motion } from 'motion/react';",
  "import { motion } from 'motion/react';\nimport StudentTestTake from './StudentTestTake';"
);

if (!code.includes("const [takingExam, setTakingExam]")) {
  code = code.replace(
    "const [groups, setGroups] = useState<Group[]>([]);",
    "const [groups, setGroups] = useState<Group[]>([]);\n  const [takingExam, setTakingExam] = useState<Exam | null>(null);"
  );
}

const renderExamCardOld = `      {exam.description && (
        <p className="text-[12px] text-white/50 bg-white/5 p-3 rounded-lg">{exam.description}</p>
      )}
    </motion.div>`;
    
const renderExamCardNew = `      {exam.description && (
        <p className="text-[12px] text-white/50 bg-white/5 p-3 rounded-lg mb-4">{exam.description}</p>
      )}
      
      {exam.isOnline && !isPast && (
        <button onClick={() => setTakingExam(exam)} className="w-full mt-2 py-3 rounded-[12px] font-bold bg-[rgba(254,194,4,0.15)] text-[#FEC204] hover:bg-[rgba(254,194,4,0.25)] transition-colors border border-[#FEC204]/20 flex items-center justify-center gap-2">
          <MapPin size={16} className="hidden" /> {/* just to align imports */}
          <span className="text-[18px] mb-1 leading-none">▶</span> Testni boshlash
        </button>
      )}
    </motion.div>`;
    
code = code.replace(renderExamCardOld, renderExamCardNew);

code = code.replace(
  "    <div className=\"space-y-6 pb-6\">",
  `    <div className="space-y-6 pb-6">
      {takingExam && (
        <StudentTestTake exam={takingExam} onClose={() => setTakingExam(null)} />
      )}`
);

fs.writeFileSync('src/pages/student/StudentExams.tsx', code);
