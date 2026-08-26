const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminNews.tsx', 'utf8');

code = code.replace(
  "import { Plus, X, Edit2, Trash2, Megaphone, Heart, MessageCircle, Send, Check } from 'lucide-react';",
  "import { Plus, X, Edit2, Trash2, Megaphone, Heart, MessageCircle, Send, Check, Eye } from 'lucide-react';"
);

const uiToReplace = `                  <button onClick={() => toggleComments(item.id)} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                    <MessageCircle size={16} />
                    <span className="text-[12px] font-bold">{item.comments?.length || 0}</span>
                  </button>
                </div>`;
                
const uiReplacement = `                  <button onClick={() => toggleComments(item.id)} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                    <MessageCircle size={16} />
                    <span className="text-[12px] font-bold">{item.comments?.length || 0}</span>
                  </button>
                  <div className="flex items-center gap-2 text-white/40 ml-2">
                    <Eye size={16} />
                    <span className="text-[12px] font-bold">{item.viewedBy?.length || 0}</span>
                  </div>
                </div>`;
code = code.replace(uiToReplace, uiReplacement);

fs.writeFileSync('src/pages/admin/AdminNews.tsx', code);
console.log("Patched admin news eye");
