const fs = require('fs');

function fixFile(file) {
  let code = fs.readFileSync(file, 'utf-8');

  // Find the exact match of the wrongly replaced part
  const wrongReplacement = `{currentQ.isOpenEnded ? (
                       <div className="w-full text-left p-3 md:p-4 rounded-[14px] md:rounded-xl border border-gray-200 shadow-sm mt-4">
                          <p className="text-gray-500 text-sm mb-3">O'z javobingizni kiriting:</p>
                          <div className="w-full bg-gray-50 p-4 rounded-lg outline-none border border-gray-300 text-gray-400 font-bold flex items-center justify-between">
                            <span className="opacity-50 text-sm">Javobingizni shu yerga yozing...</span>
                            <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center"><span className="text-[10px]">⌨️</span></div>
                          </div>
                       </div>
                    ) : (`;

  const leftPanel = `{currentQ.isOpenEnded ? (
                   <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                      <MathAnswerField
                        value={currentQ.correctAnswerText || ''}
                        onChange={(latex) => updateQuestion(activeQuestion, 'correctAnswerText', latex)}
                        placeholder="To'g'ri javobni kiriting..."
                      />
                   </div>
                 ) : (`;

  // First replace the wrong left panel with the correct left panel
  code = code.replace(wrongReplacement, leftPanel);

  const oldRightPanel = `{currentQ.isOpenEnded ? (
                       <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                          <span className="font-bold text-gray-500 mb-2 block">To'g'ri javob:</span>
                          <div className="bg-gray-100 p-3 rounded text-sm text-gray-600">
                             <Latex>{currentQ.correctAnswerText ? \`$$\${currentQ.correctAnswerText}$$\` : 'Kiritilmagan'}</Latex>
                          </div>
                       </div>
                    ) : (`;

  const newRightPanel = `{currentQ.isOpenEnded ? (
                       <div className="w-full text-left p-3 md:p-4 rounded-[14px] md:rounded-xl border border-gray-200 shadow-sm mt-4">
                          <p className="text-gray-500 text-sm mb-3">O'z javobingizni kiriting:</p>
                          <div className="w-full bg-gray-50 p-4 rounded-lg outline-none border border-gray-300 text-gray-400 font-bold flex items-center justify-between">
                            <span className="opacity-50 text-sm">Javobingizni shu yerga yozing...</span>
                            <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center"><span className="text-[10px]">⌨️</span></div>
                          </div>
                       </div>
                    ) : (`;

  code = code.replace(oldRightPanel, newRightPanel);

  fs.writeFileSync(file, code);
}

fixFile('src/pages/admin/AdminSATBuilder.tsx');
fixFile('src/pages/admin/AdminTestBuilder.tsx');

