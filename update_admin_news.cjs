const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminNews.tsx', 'utf8');

if (!code.includes("useAuth")) {
  code = code.replace("import { useConfirm }", "import { useAuth } from '../../contexts/AuthContext';\nimport { useConfirm }");
}

if (!code.includes("const { user } = useAuth();")) {
  code = code.replace("const { confirm } = useConfirm();", "const { confirm } = useConfirm();\n  const { user } = useAuth();");
}

const oldCommentsMap = `{item.comments.map(c => (
                      <div key={c.id} className="flex flex-col group relative">
                        <div className="flex justify-between items-start mb-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold text-white/90">{c.userName}</span>
                            <span className="text-[10px] text-white/30">{new Date(c.createdAt).toLocaleDateString('uz-UZ', { hour: '2-digit', minute: '2-digit'})}</span>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditingComment({ newsId: item.id, commentId: c.id, text: c.text })} className="text-white/40 hover:text-[#FEC204] transition-colors p-1">
                              <Edit2 size={12} />
                            </button>
                            <button onClick={() => handleDeleteComment(item.id, c.id, item.comments || [])} className="text-white/40 hover:text-red-500 transition-colors p-1">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                        {editingComment?.commentId === c.id ? (
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              value={editingComment.text}
                              onChange={(e) => setEditingComment({ ...editingComment, text: e.target.value })}
                              className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-[12px] text-white focus:outline-none focus:border-[#FEC204]/50"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveComment(item.id, item.comments || []);
                                if (e.key === 'Escape') setEditingComment(null);
                              }}
                            />
                            <button onClick={() => handleSaveComment(item.id, item.comments || [])} className="text-[#FEC204] p-1 bg-white/5 rounded hover:bg-white/10">
                              <Check size={14} />
                            </button>
                            <button onClick={() => setEditingComment(null)} className="text-red-500 p-1 bg-white/5 rounded hover:bg-white/10">
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <p className="text-[13px] text-white/70">{c.text}</p>
                        )}
                      </div>
                    ))}`;

const newCommentsMap = `{item.comments.map(c => {
                      const isMe = c.userId === user?.uid;
                      return (
                      <div key={c.id} className={\`flex w-full group relative \${isMe ? 'justify-end' : 'justify-start'}\`}>
                        <div className={\`max-w-[85%] rounded-2xl px-4 py-2.5 \${
                          isMe 
                            ? 'bg-[#FEC204] text-black rounded-tr-sm' 
                            : 'bg-white/10 text-white rounded-tl-sm'
                        }\`}>
                          <div className="flex justify-between items-start mb-1">
                            {!isMe && (
                              <div className="text-[11px] font-bold opacity-70">
                                {c.userName}
                              </div>
                            )}
                            {isMe && <div className="text-[11px] font-bold opacity-70">{c.userName}</div>}
                            
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                              <button onClick={() => setEditingComment({ newsId: item.id, commentId: c.id, text: c.text })} className={\`\${isMe ? 'text-black/50 hover:text-black' : 'text-white/40 hover:text-[#FEC204]'} transition-colors p-1\`}>
                                <Edit2 size={12} />
                              </button>
                              <button onClick={() => handleDeleteComment(item.id, c.id, item.comments || [])} className={\`\${isMe ? 'text-black/50 hover:text-red-600' : 'text-white/40 hover:text-red-500'} transition-colors p-1\`}>
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>

                          {editingComment?.commentId === c.id ? (
                            <div className="flex items-center gap-2 mt-1">
                              <input
                                value={editingComment.text}
                                onChange={(e) => setEditingComment({ ...editingComment, text: e.target.value })}
                                className={\`flex-1 border rounded px-2 py-1 text-[12px] focus:outline-none \${isMe ? 'bg-black/10 border-black/20 text-black focus:border-black/50' : 'bg-white/5 border-white/10 text-white focus:border-[#FEC204]/50'}\`}
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveComment(item.id, item.comments || []);
                                  if (e.key === 'Escape') setEditingComment(null);
                                }}
                              />
                              <button onClick={() => handleSaveComment(item.id, item.comments || [])} className={\`p-1 rounded \${isMe ? 'text-black hover:bg-black/10' : 'text-[#FEC204] hover:bg-white/10'}\`}>
                                <Check size={14} />
                              </button>
                              <button onClick={() => setEditingComment(null)} className={\`p-1 rounded \${isMe ? 'text-red-600 hover:bg-black/10' : 'text-red-500 hover:bg-white/10'}\`}>
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <p className="text-[13px] leading-relaxed break-words">{c.text}</p>
                          )}
                          
                          <div className={\`text-[10px] mt-1 text-right \${isMe ? 'opacity-60' : 'opacity-40'}\`}>
                            {new Date(c.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );})}`;

code = code.replace(oldCommentsMap, newCommentsMap);
fs.writeFileSync('src/pages/admin/AdminNews.tsx', code);
