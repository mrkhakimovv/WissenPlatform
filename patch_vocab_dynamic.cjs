const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSATDatabase.tsx', 'utf-8');

// Change vocabForm to hold an array of pairs
code = code.replace(
  `  const [vocabForm, setVocabForm] = useState({ id: '', vocabularyEng: '', vocabularyUz: '' });`,
  `  const [vocabForm, setVocabForm] = useState({ id: '', pairs: [{ eng: '', uz: '' }] });`
);

// We need a helper to parse legacy string to pairs when opening
// vocabularyEng and vocabularyUz were strings split by newlines
const oldModalOpen = `                            setVocabForm({ id: lesson.id, vocabularyEng: lesson.vocabularyEng || '', vocabularyUz: lesson.vocabularyUz || '' });`;
const newModalOpen = `                            {
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
                            }`;
code = code.replace(oldModalOpen, newModalOpen);

// Change vocabSave to convert pairs back to strings
const oldVocabSave = `  const handleVocabSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vocabForm.id) return;
    try {
      await updateDoc(doc(db, 'sat_lessons', vocabForm.id), { 
        vocabularyEng: vocabForm.vocabularyEng,
        vocabularyUz: vocabForm.vocabularyUz
      });
      setIsVocabModalOpen(false);
      toast.success("Lug'atlar saqlandi");
    } catch(err) {
      toast.error("Xatolik");
    }
  };`;
const newVocabSave = `  const handleVocabSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vocabForm.id) return;
    try {
      const engs = vocabForm.pairs.map(p => p.eng.trim());
      const uzs = vocabForm.pairs.map(p => p.uz.trim());
      await updateDoc(doc(db, 'sat_lessons', vocabForm.id), { 
        vocabularyEng: engs.join('\\n'),
        vocabularyUz: uzs.join('\\n')
      });
      setIsVocabModalOpen(false);
      toast.success("Lug'atlar saqlandi");
    } catch(err) {
      toast.error("Xatolik");
    }
  };
  
  const handleAddVocabPair = () => {
    setVocabForm({ ...vocabForm, pairs: [...vocabForm.pairs, { eng: '', uz: '' }] });
  };
  
  const handleUpdateVocabPair = (index: number, field: 'eng' | 'uz', value: string) => {
    const newPairs = [...vocabForm.pairs];
    newPairs[index][field] = value;
    setVocabForm({ ...vocabForm, pairs: newPairs });
  };
  `;
code = code.replace(oldVocabSave, newVocabSave);

// Change the modal JSX
const oldVocabModal = `            <form onSubmit={handleVocabSave} className="space-y-4">
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

const newVocabModal = `            <form onSubmit={handleVocabSave} className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] uppercase font-bold text-[#FEC204]">Inglizcha</label>
                <label className="text-[10px] uppercase font-bold text-white/60">O'zbekcha</label>
              </div>
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-2 pr-1">
                {vocabForm.pairs.map((pair, idx) => (
                  <div key={idx} className="grid grid-cols-2 gap-3">
                    <input
                      placeholder="Apple"
                      value={pair.eng}
                      onChange={(e) => handleUpdateVocabPair(idx, 'eng', e.target.value)}
                      className="w-full glass-panel px-3 py-2 outline-none focus:border-[#FEC204]/50 text-sm text-white"
                    />
                    <input
                      placeholder="Olma"
                      value={pair.uz}
                      onChange={(e) => handleUpdateVocabPair(idx, 'uz', e.target.value)}
                      className="w-full glass-panel px-3 py-2 outline-none focus:border-[#FEC204]/50 text-sm text-white"
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddVocabPair}
                className="w-full py-2 rounded-lg border border-white/10 text-white/70 hover:bg-white/5 hover:text-white transition-colors text-sm font-bold flex items-center justify-center gap-2"
              >
                <span className="text-lg leading-none">+</span> Qator qo'shish
              </button>
              <div className="pt-4 flex gap-3">`;
code = code.replace(oldVocabModal, newVocabModal);

fs.writeFileSync('src/pages/admin/AdminSATDatabase.tsx', code);
