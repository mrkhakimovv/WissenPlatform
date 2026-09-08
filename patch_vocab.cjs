const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSATDatabase.tsx', 'utf-8');

// Modify the vocab state
code = code.replace(
  `  const [vocabForm, setVocabForm] = useState({ id: '', vocabulary: '' });`,
  `  const [vocabForm, setVocabForm] = useState({ id: '', vocabularyEng: '', vocabularyUz: '' });`
);

// Modify vocabSave
code = code.replace(
  `      await updateDoc(doc(db, 'sat_lessons', vocabForm.id), { vocabulary: vocabForm.vocabulary });`,
  `      await updateDoc(doc(db, 'sat_lessons', vocabForm.id), { 
        vocabularyEng: vocabForm.vocabularyEng,
        vocabularyUz: vocabForm.vocabularyUz
      });`
);

// Update opening the modal
code = code.replace(
  `                            setVocabForm({ id: lesson.id, vocabulary: lesson.vocabulary || '' });`,
  `                            setVocabForm({ id: lesson.id, vocabularyEng: lesson.vocabularyEng || '', vocabularyUz: lesson.vocabularyUz || '' });`
);

// Update vocab display in Admin
const oldAdminVocabDisplay = `                      {lesson.vocabulary && (
                        <div>
                          <p className="text-[10px] uppercase text-white/40 font-bold mb-1">Lug'atlar</p>
                          <p className="text-white/80 text-sm line-clamp-2">{lesson.vocabulary}</p>
                        </div>
                      )}`;
const newAdminVocabDisplay = `                      {(lesson.vocabularyEng || lesson.vocabularyUz) && (
                        <div className="grid grid-cols-2 gap-2 bg-white/5 p-2 rounded-lg mt-2">
                          <div>
                            <p className="text-[10px] uppercase text-white/40 font-bold mb-1">Inglizcha</p>
                            <p className="text-white/80 text-sm line-clamp-2 whitespace-pre-wrap">{lesson.vocabularyEng}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase text-white/40 font-bold mb-1">O'zbekcha</p>
                            <p className="text-white/80 text-sm line-clamp-2 whitespace-pre-wrap">{lesson.vocabularyUz}</p>
                          </div>
                        </div>
                      )}`;
code = code.replace(oldAdminVocabDisplay, newAdminVocabDisplay);

// Update button text in Admin
code = code.replace(
  `                          Lug'atlarni {lesson.vocabulary ? 'tahrirlash' : 'kiritish'}`,
  `                          Lug'atlarni {(lesson.vocabularyEng || lesson.vocabularyUz) ? 'tahrirlash' : 'kiritish'}`
);

// Update vocab Modal
const oldVocabModal = `            <form onSubmit={handleVocabSave} className="space-y-4">
              <div>
                <textarea rows={8} placeholder="So'zlarni bu yerga kiriting..." value={vocabForm.vocabulary} onChange={e => setVocabForm({...vocabForm, vocabulary: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white resize-none" />
              </div>
              <div className="pt-4 flex gap-3">`;

const newVocabModal = `            <form onSubmit={handleVocabSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#FEC204] ml-1 mb-1 block">Inglizcha so'zlar</label>
                  <textarea rows={8} placeholder="Masalan:&#10;Apple&#10;Car&#10;Book" value={vocabForm.vocabularyEng} onChange={e => setVocabForm({...vocabForm, vocabularyEng: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white resize-none" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/60 ml-1 mb-1 block">O'zbekcha tarjimasi</label>
                  <textarea rows={8} placeholder="Masalan:&#10;Olma&#10;Mashina&#10;Kitob" value={vocabForm.vocabularyUz} onChange={e => setVocabForm({...vocabForm, vocabularyUz: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white resize-none" />
                </div>
              </div>
              <p className="text-[11px] text-white/40 text-center">So'zlarni mosma-mos qatorma-qator kiriting.</p>
              <div className="pt-4 flex gap-3">`;

code = code.replace(oldVocabModal, newVocabModal);

fs.writeFileSync('src/pages/admin/AdminSATDatabase.tsx', code);
