const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSATDatabase.tsx', 'utf-8');

const target = `                            })}
                          </div>
                        </div>
                      )}`;

const replacement = `                            })}
                          </div>
                          
                          <button
                            onClick={() => handleDownloadResults(lesson)}
                            className="mt-4 w-full py-2.5 rounded-lg bg-[rgba(254,194,4,0.1)] text-[#FEC204] border border-[#FEC204]/20 font-bold text-sm hover:bg-[rgba(254,194,4,0.2)] transition-colors flex items-center justify-center gap-2"
                          >
                            <FileText size={16} /> Natijalarni yuklab olish
                          </button>
                        </div>
                      )}`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/admin/AdminSATDatabase.tsx', code);
