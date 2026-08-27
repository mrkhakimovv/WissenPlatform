const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentNews.tsx', 'utf8');

const target = `{comments.map(c => (
                          <div key={c.id} className="flex flex-col">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[13px] font-bold text-white/90">{c.userName}</span>
                              <span className="text-[10px] text-white/30">{new Date(c.createdAt).toLocaleDateString('uz-UZ', { hour: '2-digit', minute: '2-digit'})}</span>
                            </div>
                            <p className="text-[13px] text-white/70">{c.text}</p>
                          </div>
                        ))}`;

const replacement = `{comments.map(c => {
                          const isMe = c.userId === user?.uid;
                          return (
                            <div key={c.id} className={\`flex w-full \${isMe ? 'justify-end' : 'justify-start'}\`}>
                              <div className={\`max-w-[85%] rounded-2xl px-4 py-2.5 \${
                                isMe 
                                  ? 'bg-[#FEC204] text-black rounded-tr-sm' 
                                  : 'bg-white/10 text-white rounded-tl-sm'
                              }\`}>
                                {!isMe && (
                                  <div className="text-[11px] font-bold opacity-70 mb-1">
                                    {c.userName}
                                  </div>
                                )}
                                <p className="text-[13px] leading-relaxed break-words">{c.text}</p>
                                <div className={\`text-[10px] mt-1 text-right \${isMe ? 'opacity-60' : 'opacity-40'}\`}>
                                  {new Date(c.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>
                          );
                        })}`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/student/StudentNews.tsx', code);
