const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentSAT.tsx', 'utf-8');

// Add lessons state
code = code.replace(
  `  const [activeTab, setActiveTab] = useState<'lessons' | 'exams'>('exams');`,
  `  const [activeTab, setActiveTab] = useState<'lessons' | 'exams'>('exams');\n  const [lessons, setLessons] = useState<any[]>([]);`
);

// Add onSnapshot
code = code.replace(
  `    const unsubExams = onSnapshot(query(collection(db, 'exams')), snap => {`,
  `    const unsubLessons = onSnapshot(collection(db, 'sat_lessons'), snap => {
      setLessons(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubExams = onSnapshot(query(collection(db, 'exams')), snap => {`
);

// Add to cleanup
code = code.replace(
  `return () => unsubExams();`,
  `return () => { unsubExams(); unsubLessons(); };`
);

// Replace lessons UI
const emptyLessonsUI = `<div className="glass-panel p-6 flex flex-col items-center justify-center opacity-70 border-dashed border-2 px-12 py-16">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <span className="text-[24px]">🎥</span>
          </div>
          <h3 className="text-[18px] font-bold text-white mb-2">Hali darslar yo'q</h3>
          <p className="text-[13px] text-white/40 text-center max-w-sm font-medium">Hozircha markaz tomonidan sizga SAT darslari va videokurslari biriktirilmagan.</p>
        </div>`;

const newLessonsUI = `{lessons.length === 0 ? (
        <div className="glass-panel p-6 flex flex-col items-center justify-center opacity-70 border-dashed border-2 px-12 py-16">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <span className="text-[24px]">🎥</span>
          </div>
          <h3 className="text-[18px] font-bold text-white mb-2">Hali darslar yo'q</h3>
          <p className="text-[13px] text-white/40 text-center max-w-sm font-medium">Hozircha markaz tomonidan sizga SAT darslari va videokurslari biriktirilmagan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lessons.map(lesson => (
            <div key={lesson.id} className="glass-panel p-5 relative group border border-white/5 transition-colors">
              <h3 className="text-[16px] font-bold text-[#FEC204] mb-4">{lesson.title}</h3>
              {lesson.homeworkKeys && (
                <div className="mb-3">
                  <p className="text-[10px] uppercase text-white/40 font-bold mb-1">Uyga vazifaning javob kalitlari</p>
                  <p className="text-white/80 text-sm whitespace-pre-wrap">{lesson.homeworkKeys}</p>
                </div>
              )}
              {lesson.vocabulary && (
                <div>
                  <p className="text-[10px] uppercase text-white/40 font-bold mb-1">Lug'atlar</p>
                  <p className="text-white/80 text-sm whitespace-pre-wrap">{lesson.vocabulary}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}`;

code = code.replace(emptyLessonsUI, newLessonsUI);

fs.writeFileSync('src/pages/student/StudentSAT.tsx', code);
