const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminCertificateBuilder.tsx', 'utf-8');

const returnStatementNew = `  const isFastMode = !!testData.isFastMode;

  return createPortal(
    <div className="fixed inset-0 bg-[#0d0d0d] z-[9999] flex flex-col animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0 bg-[#121212]">
        <div>
          <h2 className="text-lg font-black text-white">{testData.title}</h2>
          <p className="text-xs text-[#FEC204] font-bold">Milliy Sertifikat (Rasch) • 45 ta savol (55 birlik) {isFastMode && " • Faqat Javoblar"}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors text-sm font-bold">
            Yopish
          </button>
          <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 rounded-lg bg-[#FEC204] text-black hover:opacity-90 transition-colors text-sm font-bold flex items-center gap-2">
            {isSaving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </div>

      {isFastMode ? (
        <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar bg-[#0a0a0a]">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-2">Javoblar varaqasi (Kalitlarni belgilash)</h3>
            <p className="text-white/50 mb-8 text-sm">O'quvchilar testni qog'ozda ishlashadi va faqat javoblarni onlayn tizimga kiritishadi, yoki siz shu yerda to'g'ri kalitlarni belgilaysiz.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {testData.questions.map((q, i) => (
                <div key={q.id} className="bg-white/5 rounded-xl p-4 flex flex-col items-center gap-3 border border-white/10 relative">
                  <span className="font-bold text-white/70 text-lg">{i + 1}-savol</span>
                  
                  {q.isOpenEnded ? (
                    <div className="flex flex-col gap-2 w-full">
                      <div className="flex items-center gap-2">
                        <span className="text-[#FEC204] font-bold">a)</span>
                        <input 
                          type="text" 
                          placeholder="Javob..." 
                          value={q.subAnswers?.[0]?.correctAnswerText || ''}
                          onChange={(e) => updateSubAnswer(i, 0, e.target.value)}
                          className="flex-1 bg-white/5 p-2 rounded-lg outline-none text-white text-sm"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#FEC204] font-bold">b)</span>
                        <input 
                          type="text" 
                          placeholder="Javob..." 
                          value={q.subAnswers?.[1]?.correctAnswerText || ''}
                          onChange={(e) => updateSubAnswer(i, 1, e.target.value)}
                          className="flex-1 bg-white/5 p-2 rounded-lg outline-none text-white text-sm"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 w-full justify-center flex-wrap">
                      {q.options.map((_, optIndex) => (
                        <button
                          key={optIndex}
                          onClick={() => updateQuestion(i, 'correctOptionIndex', optIndex)}
                          className={\`w-10 h-10 rounded-full font-bold transition-colors flex items-center justify-center \${q.correctOptionIndex === optIndex ? 'bg-[#FEC204] text-black' : 'bg-white/10 text-white hover:bg-white/20'}\`}
                        >
                          {ALPHABET[optIndex]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden min-w-0">`;

let startIdx = code.indexOf('  return createPortal(');
let before = code.substring(0, startIdx);
let after = code.substring(startIdx);

let replaceTarget = `  return createPortal(
    <div className="fixed inset-0 bg-[#0d0d0d] z-[9999] flex flex-col animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0 bg-[#121212]">
        <div>
          <h2 className="text-lg font-black text-white">{testData.title}</h2>
          <p className="text-xs text-[#FEC204] font-bold">Milliy Sertifikat (Rasch) • 45 ta savol (55 birlik)</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors text-sm font-bold">
            Yopish
          </button>
          <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 rounded-lg bg-[#FEC204] text-black hover:opacity-90 transition-colors text-sm font-bold flex items-center gap-2">
            {isSaving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden min-w-0">`;

after = after.replace(replaceTarget, returnStatementNew);
after = after.replace(/      <\/div>\s*<\/div>\s*\);\s*}\s*$/, `      </div>\n      )}\n    </div>\n  );\n}\n`);

fs.writeFileSync('src/pages/admin/AdminCertificateBuilder.tsx', before + after);
console.log("Replaced successfully!");
