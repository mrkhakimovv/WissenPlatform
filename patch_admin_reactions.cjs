const fs = require('fs');

let code = fs.readFileSync('src/pages/admin/AdminNews.tsx', 'utf8');

// Add Smile icon
if (!code.includes('Smile')) {
  code = code.replace(
    "UploadCloud } from 'lucide-react'",
    "UploadCloud, Smile } from 'lucide-react'"
  );
}

// Define stickers array
const STICKERS = "['👍', '❤️', '😂', '🔥', '🎉', '😢', '👏', '🙌']";
const stickersVar = `const STICKERS = ${STICKERS};\n`;

if (!code.includes('const STICKERS')) {
  code = code.replace("export default function AdminNews() {", stickersVar + "\nexport default function AdminNews() {");
}

// State for emoji pickers
const statesToAdd = `
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
`;
if (!code.includes('setShowEmojiPicker')) {
  code = code.replace("const [commentText, setCommentText] = useState<{ [key: string]: string }>({});", "const [commentText, setCommentText] = useState<{ [key: string]: string }>({});" + statesToAdd);
}

// Add handleReact function
const handleReactFn = `
  const handleReact = async (newsId: string, commentId: string, emoji: string, comments: any[]) => {
    if (!user) return;
    try {
      const updatedComments = comments.map(c => {
        if (c.id === commentId) {
          const reactions = c.reactions || {};
          const usersWithEmoji = reactions[emoji] || [];
          const hasReacted = usersWithEmoji.includes(user.id);
          
          if (hasReacted) {
            reactions[emoji] = usersWithEmoji.filter(id => id !== user.id);
            if (reactions[emoji].length === 0) delete reactions[emoji];
          } else {
            reactions[emoji] = [...usersWithEmoji, user.id];
          }
          
          return { ...c, reactions };
        }
        return c;
      });
      await updateDoc(doc(db, 'news', newsId), { comments: updatedComments });
      setShowReactionPicker(null);
    } catch (err) {
      console.error(err);
    }
  };
`;

if (!code.includes('handleReact')) {
  code = code.replace("const handleComment", handleReactFn + "\n  const handleComment");
}

const mapTargetStart = "{item.comments.map((c, index) => {";
const mapTargetRegex = /\{item\.comments\.map\(\(c, index\) => \{[\s\S]*?<\/React\.Fragment>\s*\);\s*\}\)\}/g;

const newMapStr = `{item.comments.map((c, index) => {
                      const isMe = c.userId === user?.id;
                      const currentCommentDate = new Date(c.createdAt).toDateString();
                      const prevCommentDate = index > 0 && item.comments ? new Date(item.comments[index - 1].createdAt).toDateString() : null;
                      const showDateSeparator = currentCommentDate !== prevCommentDate;
                      
                      const reactionsList = Object.entries(c.reactions || {}).filter(([_, users]) => users.length > 0);
                      
                      return (
                      <React.Fragment key={c.id}>
                        {showDateSeparator && (
                          <div className="w-full flex justify-center my-3">
                            <span className="bg-black/30 text-white/50 text-[10px] px-3 py-1 rounded-full font-medium">
                              {formatDateSeparator(c.createdAt)}
                            </span>
                          </div>
                        )}
                        <div className={\`flex w-full group relative \${isMe ? 'justify-end' : 'justify-start'} \${showDateSeparator ? 'mt-1' : ''} mb-2\`}>
                          <div className={\`max-w-[85%] rounded-2xl px-4 py-2.5 relative \${
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
                            
                            <div className={\`absolute top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity \${isMe ? '-left-8' : '-right-8'}\`}>
                              <div className="relative">
                                <button onClick={() => setShowReactionPicker(showReactionPicker === c.id ? null : c.id)} className="p-1.5 text-white/40 hover:text-[#FEC204] rounded-full hover:bg-white/5">
                                  <Smile size={14} />
                                </button>
                                {showReactionPicker === c.id && (
                                  <div className={\`absolute top-full \${isMe ? 'right-0' : 'left-0'} mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl p-2 flex gap-1 z-10 shadow-xl\`}>
                                    {STICKERS.map(emoji => (
                                      <button 
                                        key={emoji}
                                        onClick={() => handleReact(item.id, c.id, emoji, item.comments || [])}
                                        className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded text-[16px] transition-colors"
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </div>
                                )}
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
                            
                            {reactionsList.length > 0 && (
                              <div className={\`absolute -bottom-3 \${isMe ? 'right-2' : 'left-2'} flex items-center gap-1 bg-[#1a1a1a] border border-white/10 rounded-full px-1.5 py-0.5 shadow-sm\`}>
                                {reactionsList.map(([emoji, users]) => (
                                  <button 
                                    key={emoji}
                                    onClick={() => handleReact(item.id, c.id, emoji, item.comments || [])}
                                    className={\`flex items-center gap-1 text-[11px] \${users.includes(user?.id || '') ? 'text-[#FEC204] bg-[#FEC204]/10' : 'text-white/70'} hover:bg-white/5 px-1 rounded-full transition-colors\`}
                                  >
                                    <span>{emoji}</span>
                                    <span className="font-medium text-[10px]">{users.length}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </React.Fragment>
                    );})}`;

code = code.replace(mapTargetRegex, newMapStr);

// Now update comment input
const inputRegex = /\{\/\* Comment Input \*\/\}([\s\S]*?)<\/div>\s*<\/div>\s*\)\}\s*<\/div>\s*<\/div>\s*\);\s*\}\)\}\s*<\/div>/;

const newInput = `{/* Comment Input */}
                    <div className="relative mt-2">
                      <textarea
                        value={commentText[item.id] || ''}
                        onChange={(e) => setCommentText(prev => ({ ...prev, [item.id]: e.target.value }))}
                        placeholder="Fikringizni yozing..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-24 py-3 text-[13px] text-white placeholder-white/30 focus:outline-none focus:border-[#FEC204]/50 focus:bg-white/10 transition-all resize-none min-h-[44px] max-h-[120px]"
                        rows={1}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleComment(item.id);
                          }
                        }}
                      />
                      <div className="absolute right-2 bottom-2 flex items-center gap-1">
                        <div className="relative">
                          <button 
                            onClick={() => setShowEmojiPicker(showEmojiPicker === item.id ? null : item.id)}
                            className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white rounded-lg transition-colors"
                          >
                            <Smile size={18} />
                          </button>
                          {showEmojiPicker === item.id && (
                            <div className="absolute bottom-full right-0 mb-2 bg-[#1a1a1a] border border-white/10 rounded-xl p-2 grid grid-cols-4 gap-1 z-10 shadow-xl w-[160px]">
                              {STICKERS.map(emoji => (
                                <button 
                                  key={emoji}
                                  onClick={() => {
                                    setCommentText(prev => ({ ...prev, [item.id]: (prev[item.id] || '') + emoji }));
                                    setShowEmojiPicker(null);
                                  }}
                                  className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded text-[16px] transition-colors"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <button 
                          onClick={() => handleComment(item.id)}
                          disabled={!commentText[item.id]?.trim()}
                          className="w-8 h-8 flex items-center justify-center bg-[#FEC204] text-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#ffcf33] transition-colors"
                        >
                          <Send size={14} className="ml-0.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>`;

code = code.replace(inputRegex, newInput);

fs.writeFileSync('src/pages/admin/AdminNews.tsx', code);
console.log("Patched AdminNews reactions");
