const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentNews.tsx', 'utf8');

code = code.replace(
  "import { collection, query, where, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';",
  "import { collection, query, where, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove, getDocs, writeBatch } from 'firebase/firestore';"
);

code = code.replace(
  "import { Megaphone, Calendar, Heart, MessageCircle, Send } from 'lucide-react';",
  "import { Megaphone, Calendar, Heart, MessageCircle, Send, Eye } from 'lucide-react';"
);

code = code.replace(
  "  comments?: Comment[];\n}",
  "  comments?: Comment[];\n  viewedBy?: string[];\n}"
);

const newEffect = `  useEffect(() => {
    if (!user) return;
    const markAsViewed = async () => {
      try {
        const q = query(collection(db, 'news'), where('active', '==', true));
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);
        let hasUpdates = false;
        snapshot.docs.forEach(docSnap => {
          const data = docSnap.data();
          const viewedBy = data.viewedBy || [];
          if (!viewedBy.includes(user.id)) {
            batch.update(docSnap.ref, { viewedBy: arrayUnion(user.id) });
            hasUpdates = true;
          }
        });
        if (hasUpdates) {
          await batch.commit();
        }
      } catch (e) {
        console.error("Error updating views", e);
      }
    };
    markAsViewed();
  }, [user]);`;

// Add new effect before the existing useEffect
code = code.replace("  useEffect(() => {\n    const q = query(", newEffect + "\n\n  useEffect(() => {\n    const q = query(");

// Now update the UI
const uiToReplace = `                      <MessageCircle size={20} />
                      <span className="text-[13px] font-bold">{comments.length}</span>
                    </button>
                  </div>`;
const uiReplacement = `                      <MessageCircle size={20} />
                      <span className="text-[13px] font-bold">{comments.length}</span>
                    </button>
                    
                    <div className="flex items-center gap-2 text-white/40 ml-2">
                      <Eye size={20} />
                      <span className="text-[13px] font-bold">{item.viewedBy?.length || 0}</span>
                    </div>
                  </div>`;
code = code.replace(uiToReplace, uiReplacement);

fs.writeFileSync('src/pages/student/StudentNews.tsx', code);
console.log("Patched student news");
