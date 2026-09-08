const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSATDatabase.tsx', 'utf-8');

// 1. Add State
code = code.replace(
  `  const vocabContainerRef = useRef<HTMLDivElement>(null);`,
  `  const vocabContainerRef = useRef<HTMLDivElement>(null);
  const [isLessonAssignModalOpen, setIsLessonAssignModalOpen] = useState(false);
  const [assigningLesson, setAssigningLesson] = useState<any>(null);
  const [lessonAssignGroupId, setLessonAssignGroupId] = useState('');`
);

// 2. Add Handlers
const assignHandlers = `
  const handleLessonAssignSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningLesson || !lessonAssignGroupId) return;
    try {
      const assignedGroups = assigningLesson.assignedGroups || [];
      if (!assignedGroups.includes(lessonAssignGroupId)) {
        await updateDoc(doc(db, 'sat_lessons', assigningLesson.id), {
          assignedGroups: [...assignedGroups, lessonAssignGroupId]
        });
      }
      setIsLessonAssignModalOpen(false);
      setAssigningLesson(null);
      setLessonAssignGroupId('');
      toast.success("Dars guruhga faollashtirildi");
    } catch(err) {
      toast.error("Xatolik yuz berdi");
    }
  };

  const handleRemoveAssignedGroup = async (lesson: any, groupId: string) => {
    try {
      const assignedGroups = lesson.assignedGroups.filter((id: string) => id !== groupId);
      await updateDoc(doc(db, 'sat_lessons', lesson.id), { assignedGroups });
      toast.success("Guruh o'chirildi");
    } catch (e) {
      toast.error("Xatolik");
    }
  };
`;

code = code.replace(
  `  const handleLessonDelete = async (id: string) => {`,
  assignHandlers + `\n  const handleLessonDelete = async (id: string) => {`
);

// 3. Add Modal UI
const modalUI = `
      {isLessonAssignModalOpen && assigningLesson && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setIsLessonAssignModalOpen(false)}>
          <div className="bg-[#1a1a1a] rounded-[24px] w-full max-w-md border border-white/10 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-[18px] font-black text-white">Darsni faollashtirish</h2>
              <button type="button" onClick={() => setIsLessonAssignModalOpen(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleLessonAssignSave} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-white/60 uppercase tracking-wider mb-2">Guruhni tanlang *</label>
                <select
                  required
                  value={lessonAssignGroupId}
                  onChange={e => setLessonAssignGroupId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-[14px] outline-none focus:border-[#FEC204] transition-colors appearance-none"
                >
                  <option value="" className="bg-[#1a1a1a]">Tanlang</option>
                  {groups.filter(g => user?.role !== 'teacher' || g.teacherName === user?.fullName).map(g => (
                    <option key={g.id} value={g.id} className="bg-[#1a1a1a]">{g.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsLessonAssignModalOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-white/70 transition-colors">Bekor qilish</button>
                <button type="submit" className="flex-1 py-3 bg-[#FEC204] hover:bg-[#e5ae03] text-black rounded-xl font-bold transition-colors shadow-[0_0_15px_rgba(254,194,4,0.3)]">Faollashtirish</button>
              </div>
            </form>
          </div>
        </div>
      )}
`;

// Insert the modal before `{isAssignModalOpen && assigningTest && (`
code = code.replace(
  `      {isAssignModalOpen && assigningTest && (`,
  modalUI + `      {isAssignModalOpen && assigningTest && (`
);

// 4. Update the Card UI to show the "Faollashtirish" button and assigned groups
const oldCardButtons = `                        <button 
                          onClick={() => {
                            {
                              const engs = (lesson.vocabularyEng || '').split('\\n').map(s => s.trim());
                              const uzs = (lesson.vocabularyUz || '').split('\\n').map(s => s.trim());
                              const maxLen = Math.max(engs.length, uzs.length, 1);
                              const pairs = [];
                              for (let i = 0; i < maxLen; i++) {
                                pairs.push({
                                  eng: engs[i] || '',
                                  uz: uzs[i] || ''
                                });
                              }
                              setVocabForm({ id: lesson.id, pairs: pairs.filter(p => p.eng || p.uz).length ? pairs.filter(p => p.eng || p.uz) : [{ eng: '', uz: '' }] });
                            }
                            setIsVocabModalOpen(true);
                          }}
                          className="w-full py-2.5 rounded-lg border border-white/10 text-white/70 font-bold text-sm hover:bg-white/5 hover:text-white transition-colors"
                        >
                          Lug'atlarni {(lesson.vocabularyEng || lesson.vocabularyUz) ? 'tahrirlash' : 'kiritish'}
                        </button>
                      </div>`;

const newCardButtons = `                        <button 
                          onClick={() => {
                            {
                              const engs = (lesson.vocabularyEng || '').split('\\n').map(s => s.trim());
                              const uzs = (lesson.vocabularyUz || '').split('\\n').map(s => s.trim());
                              const maxLen = Math.max(engs.length, uzs.length, 1);
                              const pairs = [];
                              for (let i = 0; i < maxLen; i++) {
                                pairs.push({
                                  eng: engs[i] || '',
                                  uz: uzs[i] || ''
                                });
                              }
                              setVocabForm({ id: lesson.id, pairs: pairs.filter(p => p.eng || p.uz).length ? pairs.filter(p => p.eng || p.uz) : [{ eng: '', uz: '' }] });
                            }
                            setIsVocabModalOpen(true);
                          }}
                          className="w-full py-2.5 rounded-lg border border-white/10 text-white/70 font-bold text-sm hover:bg-white/5 hover:text-white transition-colors"
                        >
                          Lug'atlarni {(lesson.vocabularyEng || lesson.vocabularyUz) ? 'tahrirlash' : 'kiritish'}
                        </button>
                        
                        <button 
                          onClick={() => {
                            setAssigningLesson(lesson);
                            setIsLessonAssignModalOpen(true);
                          }}
                          className="w-full py-2.5 rounded-lg bg-white/5 text-white/90 font-bold text-sm hover:bg-white/10 transition-colors mt-2"
                        >
                          Faollashtirish (Guruhga biriktirish)
                        </button>
                      </div>
                      
                      {/* Assigned Groups Tags */}
                      {lesson.assignedGroups && lesson.assignedGroups.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/5">
                          <p className="text-[10px] uppercase text-white/40 font-bold mb-2">Faollashtirilgan guruhlar</p>
                          <div className="flex flex-wrap gap-2">
                            {lesson.assignedGroups.map((gId: string) => {
                              const group = groups.find(g => g.id === gId);
                              if (!group) return null;
                              return (
                                <div key={gId} className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1 rounded-md text-xs text-white/80">
                                  <span>{group.name}</span>
                                  <button onClick={() => handleRemoveAssignedGroup(lesson, gId)} className="text-white/40 hover:text-red-400 ml-1">
                                    <X size={12} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
`;

code = code.replace(oldCardButtons, newCardButtons);
fs.writeFileSync('src/pages/admin/AdminSATDatabase.tsx', code);
