const fs = require('fs');

const replacement = `{currentQ.isOpenEnded ? (
                       <div className="w-full text-left p-3 md:p-4 rounded-[14px] md:rounded-xl border border-gray-200 shadow-sm mt-4">
                          <p className="text-gray-500 text-sm mb-3">O'z javobingizni kiriting:</p>
                          <div className="w-full bg-gray-50 p-4 rounded-lg outline-none border border-gray-300 text-gray-400 font-bold flex items-center justify-between">
                            <span className="opacity-50 text-sm">Javobingizni shu yerga yozing...</span>
                            <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center"><span className="text-[10px]">⌨️</span></div>
                          </div>
                       </div>
                    ) : (`;

let code1 = fs.readFileSync('src/pages/admin/AdminSATBuilder.tsx', 'utf-8');
code1 = code1.replace(/\{currentQ\.isOpenEnded \? \([\s\S]*?\) : \(/, replacement);
fs.writeFileSync('src/pages/admin/AdminSATBuilder.tsx', code1);

let code2 = fs.readFileSync('src/pages/admin/AdminTestBuilder.tsx', 'utf-8');
code2 = code2.replace(/\{currentQ\.isOpenEnded \? \([\s\S]*?\) : \(/, replacement);
fs.writeFileSync('src/pages/admin/AdminTestBuilder.tsx', code2);

