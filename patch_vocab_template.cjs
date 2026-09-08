const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSATDatabase.tsx', 'utf-8');

// Add state variables
code = code.replace(
  `  const [isVocabModalOpen, setIsVocabModalOpen] = useState(false);
  const [vocabForm, setVocabForm] = useState({ id: '', pairs: [{ eng: '', uz: '' }] });`,
  `  const [isVocabModalOpen, setIsVocabModalOpen] = useState(false);
  const [vocabForm, setVocabForm] = useState({ id: '', pairs: [{ eng: '', uz: '' }] });
  const [isTemplateMode, setIsTemplateMode] = useState(false);
  const [templateText, setTemplateText] = useState('');`
);

// We need a function to handle parsing the template
const parseFunc = `
  const handleParseTemplate = () => {
    const regex = /\\[#(.*?);\\+(.*?)\\]/g;
    let match;
    const newPairs = [];
    while ((match = regex.exec(templateText)) !== null) {
      newPairs.push({
        eng: match[1].trim(),
        uz: match[2].trim()
      });
    }
    
    if (newPairs.length > 0) {
      // Filter out empty existing pairs, then append new ones
      const existing = vocabForm.pairs.filter(p => p.eng.trim() !== '' || p.uz.trim() !== '');
      setVocabForm({ ...vocabForm, pairs: [...existing, ...newPairs] });
      setTemplateText('');
      setIsTemplateMode(false);
      toast.success(newPairs.length + " ta so'z qo'shildi!");
      setTimeout(() => {
        if (vocabContainerRef.current) {
          vocabContainerRef.current.scrollTop = vocabContainerRef.current.scrollHeight;
        }
      }, 50);
    } else {
      toast.error("Shablonga mos so'zlar topilmadi");
    }
  };
`;

code = code.replace(`  const handleAddVocabPair = () => {`, parseFunc + `\n  const handleAddVocabPair = () => {`);

// Modify the modal UI
const oldModalForm = `            <form onSubmit={handleVocabSave} className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] uppercase font-bold text-[#FEC204]">Inglizcha</label>
                <label className="text-[10px] uppercase font-bold text-white/60">O'zbekcha</label>
              </div>
              <div ref={vocabContainerRef} className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-2 pr-1">
                {vocabForm.pairs.map((pair, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <div className="w-5 text-right text-xs font-bold text-white/40">
                      {idx + 1}.
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-3">
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

const newModalForm = `            <form onSubmit={handleVocabSave} className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-4">
                  <label className="text-[10px] uppercase font-bold text-[#FEC204]">Inglizcha</label>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    type="button" 
                    onClick={() => setIsTemplateMode(!isTemplateMode)}
                    className="text-[10px] uppercase font-bold text-[#FEC204] hover:text-white transition-colors underline"
                  >
                    {isTemplateMode ? 'Jadval orqali kiritish' : 'Shablon orqali kiritish'}
                  </button>
                  <label className="text-[10px] uppercase font-bold text-white/60">O'zbekcha</label>
                </div>
              </div>
              
              {isTemplateMode ? (
                <div className="space-y-3">
                  <textarea 
                    rows={8} 
                    placeholder="[#apple;+olma]\n[#book;+kitob]" 
                    value={templateText} 
                    onChange={e => setTemplateText(e.target.value)} 
                    className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white resize-none font-mono" 
                  />
                  <button
                    type="button"
                    onClick={handleParseTemplate}
                    className="w-full py-2.5 rounded-lg font-bold bg-white/10 text-white hover:bg-white/20 transition-colors text-sm"
                  >
                    Tartiblash
                  </button>
                </div>
              ) : (
                <>
                  <div ref={vocabContainerRef} className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-2 pr-1">
                    {vocabForm.pairs.map((pair, idx) => (
                      <div key={idx} className="flex gap-3 items-center">
                        <div className="w-5 text-right text-xs font-bold text-white/40">
                          {idx + 1}.
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-3">
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
                </>
              )}
              
              <div className="pt-4 flex gap-3">`;

code = code.replace(oldModalForm, newModalForm);

fs.writeFileSync('src/pages/admin/AdminSATDatabase.tsx', code);
