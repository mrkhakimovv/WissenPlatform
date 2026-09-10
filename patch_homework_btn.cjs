const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentSAT.tsx', 'utf-8');

const oldCode = `                {lesson.homeworkTestId && (
                  <button 
                    onClick={() => {
                      setTakingExam({
                        id: lesson.id + '_hw',
                        title: lesson.title + ' - Uyga vazifa',
                        testId: lesson.homeworkTestId,
                        examType: 'sat',
                        subject: 'Homework',
                        date: new Date().toISOString(),
                        duration: 'Cheklanmagan',
                        location: 'Online',
                        groupId: ''
                      } as Exam);
                    }}
                    className="w-full py-3 rounded-xl font-bold bg-[rgba(254,194,4,0.15)] text-[#FEC204] hover:bg-[rgba(254,194,4,0.25)] transition-colors border border-[#FEC204]/20 flex items-center justify-center gap-2"
                  >
                    <PlayCircle size={18} /> Uyga vazifani yuborish
                  </button>
                )}
                
                {(lesson.vocabularyEng || lesson.vocabularyUz) && (
                  <button 
                    onClick={() => setPracticingVocab(lesson)}
                    className="w-full py-3 rounded-xl font-bold bg-white/5 text-white/80 hover:bg-white/10 hover:text-white transition-colors border border-white/10 flex items-center justify-center gap-2"
                  >
                    <Book size={18} /> Lug'atlarni yodlash
                  </button>
                )}
                
                {!lesson.homeworkTestId && !lesson.vocabularyEng && !lesson.vocabularyUz && (
                  <div className="text-center py-2 text-white/40 text-xs font-bold uppercase tracking-wider">
                    Vazifalar kiritilmagan
                  </div>
                )}`;

const newCode = `                <button 
                  onClick={() => {
                    if (!lesson.homeworkTestId) {
                      toast.error("Ushbu dars uchun uyga vazifa hali yuklanmagan!");
                      return;
                    }
                    setTakingExam({
                      id: lesson.id + '_hw',
                      title: lesson.title + ' - Uyga vazifa',
                      testId: lesson.homeworkTestId,
                      examType: 'sat',
                      subject: 'Homework',
                      date: new Date().toISOString(),
                      duration: 'Cheklanmagan',
                      location: 'Online',
                      groupId: ''
                    } as Exam);
                  }}
                  className="w-full py-3 rounded-xl font-bold bg-[rgba(254,194,4,0.15)] text-[#FEC204] hover:bg-[rgba(254,194,4,0.25)] transition-colors border border-[#FEC204]/20 flex items-center justify-center gap-2"
                >
                  <PlayCircle size={18} /> Uyga vazifani yuborish
                </button>
                
                {(lesson.vocabularyEng || lesson.vocabularyUz) && (
                  <button 
                    onClick={() => setPracticingVocab(lesson)}
                    className="w-full py-3 rounded-xl font-bold bg-white/5 text-white/80 hover:bg-white/10 hover:text-white transition-colors border border-white/10 flex items-center justify-center gap-2"
                  >
                    <Book size={18} /> Lug'atlarni yodlash
                  </button>
                )}`;

code = code.replace(oldCode, newCode);
if (!code.includes('import toast') && code.includes('toast.error')) {
  code = code.replace(/import React/, "import toast from 'react-hot-toast';\nimport React");
}

fs.writeFileSync('src/pages/student/StudentSAT.tsx', code);
