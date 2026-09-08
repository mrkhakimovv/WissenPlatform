const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSATDatabase.tsx', 'utf-8');

const oldForm = `              <div>
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
              </div>`;

const newForm = `              <div>
                <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Dars nomi *</label>
                <input required placeholder="Masalan: Unit 1 - Reading strategies" value={lessonForm.title} onChange={e => setLessonForm({...lessonForm, title: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white" />
              </div>`;

code = code.replace(oldForm, newForm);
fs.writeFileSync('src/pages/admin/AdminSATDatabase.tsx', code);
console.log('Successfully patched AdminSATDatabase.tsx!');
