const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentNews.tsx', 'utf8');

if (!code.includes('useConfirm')) {
  code = code.replace("import { useAuth }", "import { useConfirm } from '../../contexts/ConfirmContext';\nimport { useAuth }");
}

if (!code.includes('Trash2')) {
  code = code.replace("Eye } from 'lucide-react'", "Eye, Trash2 } from 'lucide-react'");
}

const hookTarget = `const { user } = useAuth();`;
if (!code.includes('const { confirm } = useConfirm();')) {
  code = code.replace(hookTarget, `const { confirm } = useConfirm();\n  const { user } = useAuth();`);
}

const deleteFn = `  const handleDeleteComment = async (newsId: string, commentId: string, comments: Comment[]) => {
    if (await confirm({ title: 'Diqqat', message: "Fikrni o'chirishni tasdiqlaysizmi?" })) {
      try {
        const updatedComments = comments.filter(c => c.id !== commentId);
        await updateDoc(doc(db, 'news', newsId), { comments: updatedComments });
        toast.success("Fikr o'chirildi");
      } catch (error) {
        toast.error("Xatolik yuz berdi");
      }
    }
  };`;

if (!code.includes('handleDeleteComment')) {
  code = code.replace("const handleComment", deleteFn + "\n\n  const handleComment");
}

const mapTarget = `{comments.map(c => {
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

const newMap = `{comments.map(c => {
                          const isMe = c.userId === user?.uid;
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

code = code.replace(mapTarget, newMap);

fs.writeFileSync('src/pages/student/StudentNews.tsx', code);
console.log("StudentNews patched.");
