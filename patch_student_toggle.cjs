const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentNews.tsx', 'utf8');

const stateToInsert = `  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
  const [openComments, setOpenComments] = useState<{ [key: string]: boolean }>({});

  const toggleComments = (id: string) => {
    setOpenComments(prev => ({ ...prev, [id]: !prev[id] }));
  };`;

code = code.replace("  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});", stateToInsert);

const uiToReplace1 = `                    <div className="flex items-center gap-2 text-white/60">
                      <MessageCircle size={20} />
                      <span className="text-[13px] font-bold">{comments.length}</span>
                    </div>`;

const uiReplacement1 = `                    <button onClick={() => toggleComments(item.id)} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                      <MessageCircle size={20} />
                      <span className="text-[13px] font-bold">{comments.length}</span>
                    </button>`;
code = code.replace(uiToReplace1, uiReplacement1);

const uiToReplace2 = `{/* Comments Section */}
                  <div className="bg-black/20 rounded-xl p-4">`;

const uiReplacement2 = `{/* Comments Section */}
                  {openComments[item.id] && (
                  <div className="bg-black/20 rounded-xl p-4 mt-4">`;

code = code.replace(uiToReplace2, uiReplacement2);

const uiToReplace3 = `                      </button>
                    </div>
                  </div>
                </div>`;

const uiReplacement3 = `                      </button>
                    </div>
                  </div>
                  )}
                </div>`;

code = code.replace(uiToReplace3, uiReplacement3);

fs.writeFileSync('src/pages/student/StudentNews.tsx', code);
console.log("Patched correctly for student");
