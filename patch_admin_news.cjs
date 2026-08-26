const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminNews.tsx', 'utf8');

// 1. Add imports
code = code.replace("import { Plus, X, Edit2, Trash2, Megaphone } from 'lucide-react';", 
                    "import { Plus, X, Edit2, Trash2, Megaphone, Heart, MessageCircle, Send, Check } from 'lucide-react';");

// 2. Add states for editing comments
const statesToAdd = `  const [editingComment, setEditingComment] = useState<{ newsId: string, commentId: string, text: string } | null>(null);

  const handleDeleteComment = async (newsId: string, commentId: string, comments: any[]) => {
    if (await confirm({ title: 'Diqqat', message: "Fikrni o'chirishni tasdiqlaysizmi?" })) {
      try {
        const updatedComments = comments.filter(c => c.id !== commentId);
        await updateDoc(doc(db, 'news', newsId), { comments: updatedComments });
        toast.success("Fikr o'chirildi");
      } catch (error) {
        toast.error("Xatolik");
      }
    }
  };

  const handleSaveComment = async (newsId: string, comments: any[]) => {
    if (!editingComment || !editingComment.text.trim()) return;
    try {
      const updatedComments = comments.map(c => 
        c.id === editingComment.commentId ? { ...c, text: editingComment.text.trim() } : c
      );
      await updateDoc(doc(db, 'news', newsId), { comments: updatedComments });
      setEditingComment(null);
      toast.success("Fikr yangilandi");
    } catch (error) {
      toast.error("Xatolik");
    }
  };
`;
code = code.replace("const [formData, setFormData] = useState({", statesToAdd + "\n  const [formData, setFormData] = useState({");

// 3. Add the UI for likes and comments
const uiToReplace = `              <p className="text-[13px] text-white/60 leading-relaxed line-clamp-3">
                {item.description}
              </p>
            </div>`;

const uiReplacement = `              <p className="text-[13px] text-white/60 leading-relaxed">
                {item.description}
              </p>
              
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-white/60 group">
                    <Heart size={16} className={item.likes?.length ? 'fill-red-500 text-red-500' : ''} />
                    <span className="text-[12px] font-bold">{item.likes?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <MessageCircle size={16} />
                    <span className="text-[12px] font-bold">{item.comments?.length || 0}</span>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              {item.comments && item.comments.length > 0 && (
                <div className="mt-4 bg-black/20 rounded-xl p-4">
                  <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {item.comments.map(c => (
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
                    ))}
                  </div>
                </div>
              )}
            </div>`;

code = code.replace(uiToReplace, uiReplacement);
fs.writeFileSync('src/pages/admin/AdminNews.tsx', code);
console.log("Patched successfully");
