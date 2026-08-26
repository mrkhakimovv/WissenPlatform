const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentNews.tsx', 'utf8');

const uiToReplace = `                  <h3 className="text-[18px] font-bold text-white leading-snug mb-2">
                    {item.title}
                  </h3>`;

const uiReplacement = `                  {item.mediaUrl && (
                    <div className="w-full bg-black/40 rounded-xl mb-4 overflow-hidden relative">
                      {item.mediaType === 'video' ? (
                        <video src={item.mediaUrl} className="w-full max-h-[300px] object-cover" controls preload="metadata" />
                      ) : (
                        <img src={item.mediaUrl} alt={item.title} className="w-full max-h-[300px] object-cover" />
                      )}
                    </div>
                  )}
                  <h3 className="text-[18px] font-bold text-white leading-snug mb-2">
                    {item.title}
                  </h3>`;

code = code.replace(uiToReplace, uiReplacement);
fs.writeFileSync('src/pages/student/StudentNews.tsx', code);
console.log("Patched student news media");
