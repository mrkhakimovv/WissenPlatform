const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSATDatabase.tsx', 'utf-8');

// Update button onClick
code = code.replace(
  `             <button \n                onClick={() => {}}\n                className="bg-[#FEC204] text-black px-6 py-2.5 rounded-[12px] font-bold hover:bg-[#FEC204]/90 transition-colors shadow-[0_0_15px_rgba(254,194,4,0.3)] flex items-center gap-2 text-[14px]"`,
  `             <button \n                onClick={() => setIsLessonModalOpen(true)}\n                className="bg-[#FEC204] text-black px-6 py-2.5 rounded-[12px] font-bold hover:bg-[#FEC204]/90 transition-colors shadow-[0_0_15px_rgba(254,194,4,0.3)] flex items-center gap-2 text-[14px]"`
);

// Update empty state with actual list rendering
const oldEmptyState = `              <div className="glass-panel p-6 flex flex-col items-center justify-center opacity-70 border-dashed border-2 px-12 py-16">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <span className="text-[24px]">🎥</span>
                </div>
                <h3 className="text-[18px] font-bold text-white mb-2">Hali darslar qo'shilmagan</h3>
                <p className="text-[13px] text-white/40 text-center max-w-sm font-medium">Bu yerda siz o'quvchilaringiz uchun onlayn SAT darslari, videolar, va qo'shimcha materiallar yuklashingiz mumkin bo'ladi.</p>
              </div>`;

const newListRender = `              {lessons.length === 0 ? (
              <div className="glass-panel p-6 flex flex-col items-center justify-center opacity-70 border-dashed border-2 px-12 py-16">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <span className="text-[24px]">🎥</span>
                </div>
                <h3 className="text-[18px] font-bold text-white mb-2">Hali darslar qo'shilmagan</h3>
                <p className="text-[13px] text-white/40 text-center max-w-sm font-medium">Bu yerda siz o'quvchilaringiz uchun onlayn SAT darslari, videolar, va qo'shimcha materiallar yuklashingiz mumkin bo'ladi.</p>
              </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lessons.map(lesson => (
                    <div key={lesson.id} className="glass-panel p-5 relative group border border-white/5 hover:border-[#FEC204]/50 transition-colors">
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleLessonDelete(lesson.id)} className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <h3 className="text-[16px] font-bold text-[#FEC204] mb-4">{lesson.title}</h3>
                      {lesson.homeworkKeys && (
                        <div className="mb-3">
                          <p className="text-[10px] uppercase text-white/40 font-bold mb-1">Uyga vazifaning javob kalitlari</p>
                          <p className="text-white/80 text-sm line-clamp-2">{lesson.homeworkKeys}</p>
                        </div>
                      )}
                      {lesson.vocabulary && (
                        <div>
                          <p className="text-[10px] uppercase text-white/40 font-bold mb-1">Lug'atlar</p>
                          <p className="text-white/80 text-sm line-clamp-2">{lesson.vocabulary}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}`;

code = code.replace(oldEmptyState, newListRender);

// Add the Modal HTML at the end before closing tag
const modalJSX = `      {isLessonModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center animate-in fade-in duration-200">
          <div className="w-full md:w-[500px] bg-[#0d0d0d] border border-white/10 rounded-[20px] p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[18px] font-black tracking-tight text-white">Yangi dars qo'shish</h2>
              <button onClick={() => setIsLessonModalOpen(false)} className="p-2 bg-white/5 rounded-full text-white/40 hover:bg-white/10 hover:text-white transition-colors"><X size={16} /></button>
            </div>
            <form onSubmit={handleLessonSave} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Dars nomi *</label>
                <input required placeholder="Masalan: Unit 1 - Reading strategies" value={lessonForm.title} onChange={e => setLessonForm({...lessonForm, title: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white" />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Uyga vazifaning javob kalitlari</label>
                <textarea rows={3} placeholder="Masalan: 1-A, 2-B, 3-C..." value={lessonForm.homeworkKeys} onChange={e => setLessonForm({...lessonForm, homeworkKeys: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white resize-none" />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Lug'atlar</label>
                <textarea rows={4} placeholder="Sözlarni bu yerga kiriting..." value={lessonForm.vocabulary} onChange={e => setLessonForm({...lessonForm, vocabulary: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white resize-none" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsLessonModalOpen(false)} className="flex-1 py-3 px-4 rounded-xl font-bold text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                  Bekor qilish
                </button>
                <button type="submit" className="flex-1 py-3 px-4 rounded-xl font-bold bg-[#FEC204] text-black hover:bg-[#e5ae03] transition-colors shadow-[0_0_20px_rgba(254,194,4,0.3)]">
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
`;

code = code.replace(`    </div>\n  );\n}`, modalJSX + `    </div>\n  );\n}`);

fs.writeFileSync('src/pages/admin/AdminSATDatabase.tsx', code);
