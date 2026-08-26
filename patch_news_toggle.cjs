const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminNews.tsx', 'utf8');

// Add state
const stateToInsert = `  const [editingComment, setEditingComment] = useState<{ newsId: string, commentId: string, text: string } | null>(null);
  const [openComments, setOpenComments] = useState<{ [key: string]: boolean }>({});

  const toggleComments = (id: string) => {
    setOpenComments(prev => ({ ...prev, [id]: !prev[id] }));
  };`;

code = code.replace("  const [editingComment, setEditingComment] = useState<{ newsId: string, commentId: string, text: string } | null>(null);", stateToInsert);


// Replace comment icon div with button
const uiToReplace1 = `                  <div className="flex items-center gap-2 text-white/60">
                    <MessageCircle size={16} />
                    <span className="text-[12px] font-bold">{item.comments?.length || 0}</span>
                  </div>`;
const uiReplacement1 = `                  <button onClick={() => toggleComments(item.id)} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                    <MessageCircle size={16} />
                    <span className="text-[12px] font-bold">{item.comments?.length || 0}</span>
                  </button>`;

code = code.replace(uiToReplace1, uiReplacement1);

// Replace comment section condition
const uiToReplace2 = `{item.comments && item.comments.length > 0 && (`;
const uiReplacement2 = `{openComments[item.id] && item.comments && item.comments.length > 0 && (`;

code = code.replace(uiToReplace2, uiReplacement2);

fs.writeFileSync('src/pages/admin/AdminNews.tsx', code);
console.log("Patched correctly");
