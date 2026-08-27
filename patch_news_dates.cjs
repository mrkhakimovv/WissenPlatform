const fs = require('fs');

const dateHelper = `const formatDateSeparator = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Bugun';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Kecha';
  } else {
    return date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' });
  }
};`;

// Patch StudentNews.tsx
let studentCode = fs.readFileSync('src/pages/student/StudentNews.tsx', 'utf8');

if (!studentCode.includes('formatDateSeparator')) {
  studentCode = studentCode.replace("export default function StudentNews() {", dateHelper + "\n\nexport default function StudentNews() {");
}

const oldStudentMap = `{comments.map(c => {
                          const isMe = c.userId === user?.id;
                          return (
                            <div key={c.id} className={\`flex w-full group relative \${isMe ? 'justify-end' : 'justify-start'}\`}>
                              <div className={\`max-w-[85%] rounded-2xl px-4 py-2.5 relative \${
                                isMe 
                                  ? 'bg-[#FEC204] text-black rounded-tr-sm' 
                                  : 'bg-white/10 text-white rounded-tl-sm'
                              }\`}>
                                {!isMe && (
                                  <div className="text-[11px] font-bold opacity-70 mb-1">
                                    {c.userName}
                                  </div>
                                )}
                                
                                {isMe && (
                                  <button onClick={() => handleDeleteComment(item.id, c.id, comments)} className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-white/40 hover:text-red-500">
                                    <Trash2 size={14} />
                                  </button>
                                )}
                                
                                <p className="text-[13px] leading-relaxed break-words">{c.text}</p>
                                <div className={\`text-[10px] mt-1 text-right \${isMe ? 'opacity-60' : 'opacity-40'}\`}>
                                  {new Date(c.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>
                          );
                        })}`;

const newStudentMap = `{comments.map((c, index) => {
                          const isMe = c.userId === user?.id;
                          const currentCommentDate = new Date(c.createdAt).toDateString();
                          const prevCommentDate = index > 0 ? new Date(comments[index - 1].createdAt).toDateString() : null;
                          const showDateSeparator = currentCommentDate !== prevCommentDate;
                          
                          return (
                            <React.Fragment key={c.id}>
                              {showDateSeparator && (
                                <div className="w-full flex justify-center my-3">
                                  <span className="bg-black/30 text-white/50 text-[10px] px-3 py-1 rounded-full font-medium">
                                    {formatDateSeparator(c.createdAt)}
                                  </span>
                                </div>
                              )}
                              <div className={\`flex w-full group relative \${isMe ? 'justify-end' : 'justify-start'} \${showDateSeparator ? 'mt-1' : ''}\`}>
                                <div className={\`max-w-[85%] rounded-2xl px-4 py-2.5 relative \${
                                  isMe 
                                    ? 'bg-[#FEC204] text-black rounded-tr-sm' 
                                    : 'bg-white/10 text-white rounded-tl-sm'
                                }\`}>
                                  {!isMe && (
                                    <div className="text-[11px] font-bold opacity-70 mb-1">
                                      {c.userName}
                                    </div>
                                  )}
                                  
                                  {isMe && (
                                    <button onClick={() => handleDeleteComment(item.id, c.id, comments)} className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-white/40 hover:text-red-500">
                                      <Trash2 size={14} />
                                    </button>
                                  )}
                                  
                                  <p className="text-[13px] leading-relaxed break-words">{c.text}</p>
                                  <div className={\`text-[10px] mt-1 text-right \${isMe ? 'opacity-60' : 'opacity-40'}\`}>
                                    {new Date(c.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                              </div>
                            </React.Fragment>
                          );
                        })}`;

studentCode = studentCode.replace(oldStudentMap, newStudentMap);
fs.writeFileSync('src/pages/student/StudentNews.tsx', studentCode);


// Patch AdminNews.tsx
let adminCode = fs.readFileSync('src/pages/admin/AdminNews.tsx', 'utf8');

if (!adminCode.includes('formatDateSeparator')) {
  adminCode = adminCode.replace("export default function AdminNews() {", dateHelper + "\n\nexport default function AdminNews() {");
}

const oldAdminMap = `{item.comments.map(c => {
                      const isMe = c.userId === user?.id;
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

const newAdminMap = `{item.comments.map((c, index) => {
                      const isMe = c.userId === user?.id;
                      const currentCommentDate = new Date(c.createdAt).toDateString();
                      const prevCommentDate = index > 0 && item.comments ? new Date(item.comments[index - 1].createdAt).toDateString() : null;
                      const showDateSeparator = currentCommentDate !== prevCommentDate;
                      
                      return (
                      <React.Fragment key={c.id}>
                        {showDateSeparator && (
                          <div className="w-full flex justify-center my-3">
                            <span className="bg-black/30 text-white/50 text-[10px] px-3 py-1 rounded-full font-medium">
                              {formatDateSeparator(c.createdAt)}
                            </span>
                          </div>
                        )}
                        <div className={\`flex w-full group relative \${isMe ? 'justify-end' : 'justify-start'} \${showDateSeparator ? 'mt-1' : ''}\`}>
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
                      </React.Fragment>
                    );})}`;

adminCode = adminCode.replace(oldAdminMap, newAdminMap);
fs.writeFileSync('src/pages/admin/AdminNews.tsx', adminCode);

console.log("Patched both news files.");
