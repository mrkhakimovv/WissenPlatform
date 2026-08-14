import fs from 'fs';
let code = fs.readFileSync('src/pages/admin/AdminTestsDatabase.tsx', 'utf8');

// replace imports
code = code.replace(
  "import { collection, doc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';",
  "import { collection, doc, deleteDoc, addDoc, onSnapshot, query, orderBy, getDocs } from 'firebase/firestore';"
);

code = code.replace(
  "import { TestData } from '../../types';",
  "import { TestData, Group } from '../../types';"
);

// replace state and logic
const searchFor = "  const [tests, setTests] = useState<TestData[]>([]);";
const newStates = `  const [tests, setTests] = useState<TestData[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningTest, setAssigningTest] = useState<TestData | null>(null);
  const [assignForm, setAssignForm] = useState({ groupId: '', date: '', startTime: '', duration: '60' });

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const snap = await getDocs(collection(db, 'groups'));
        const g: Group[] = [];
        snap.forEach(d => g.push({ id: d.id, ...d.data() } as Group));
        setGroups(g);
      } catch (err) {
        console.error('Groups fetch error:', err);
      }
    };
    fetchGroups();
  }, []);

  const handleAssignClick = (t: TestData) => {
    setAssigningTest(t);
    setAssignForm({ groupId: '', date: '', startTime: '', duration: '60' });
    setIsAssignModalOpen(true);
  };

  const handleAssignSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningTest || !assignForm.groupId || !assignForm.date || !assignForm.startTime || !assignForm.duration) {
      toast.error("Barcha maydonlarni to'ldiring");
      return;
    }
    
    try {
      await addDoc(collection(db, 'exams'), {
        title: assigningTest.title,
        subject: assigningTest.testType || 'Online Test',
        groupId: assignForm.groupId,
        date: assignForm.date,
        startTime: assignForm.startTime,
        duration: Number(assignForm.duration),
        location: 'Online',
        description: assigningTest.title + ' (Online)',
        testId: assigningTest.id,
        isOnline: true,
        createdAt: new Date().toISOString()
      });
      toast.success("Online test guruhga biriktirildi!");
      setIsAssignModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Xatolik yuz berdi");
    }
  };
`;
code = code.replace(searchFor, newStates);

// replace card buttons
const oldButtons = `<div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(t)} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors" title="Tahrirlash">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(t.id!)} className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors" title="O'chirish">
                  <Trash2 size={14} />
                </button>
              </div>`;
const newButtons = `<div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleAssignClick(t)} className="h-8 px-3 rounded-lg bg-[rgba(254,194,4,0.15)] text-[#FEC204] hover:bg-[rgba(254,194,4,0.25)] flex items-center gap-1.5 transition-colors font-bold text-xs" title="Online test olish">
                  <FileText size={14} />
                  <span>Test olish</span>
                </button>
                <button onClick={() => handleEdit(t)} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors" title="Tahrirlash">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(t.id!)} className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors" title="O'chirish">
                  <Trash2 size={14} />
                </button>
              </div>`;
code = code.replace(oldButtons, newButtons);

// add modal
const modalCode = `
      {isAssignModalOpen && assigningTest && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setIsAssignModalOpen(false)}>
          <div className="bg-[#1a1a1a] rounded-[24px] w-full max-w-md border border-white/10 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-[18px] font-black text-white">Online test biriktirish</h2>
              <button onClick={() => setIsAssignModalOpen(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAssignSave} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-white/60 uppercase tracking-wider mb-2">Guruhni tanlang *</label>
                <select
                  required
                  value={assignForm.groupId}
                  onChange={e => setAssignForm({ ...assignForm, groupId: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-[14px] outline-none focus:border-[#FEC204] transition-colors appearance-none"
                >
                  <option value="" className="bg-[#1a1a1a]">Tanlang</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id} className="bg-[#1a1a1a]">{g.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-white/60 uppercase tracking-wider mb-2">Sana *</label>
                  <input
                    required
                    type="date"
                    value={assignForm.date}
                    onChange={e => setAssignForm({ ...assignForm, date: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-[14px] outline-none focus:border-[#FEC204] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-white/60 uppercase tracking-wider mb-2">Vaqt *</label>
                  <input
                    required
                    type="time"
                    value={assignForm.startTime}
                    onChange={e => setAssignForm({ ...assignForm, startTime: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-[14px] outline-none focus:border-[#FEC204] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-bold text-white/60 uppercase tracking-wider mb-2">Davomiyligi (daqiqa) *</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={assignForm.duration}
                  onChange={e => setAssignForm({ ...assignForm, duration: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-[14px] outline-none focus:border-[#FEC204] transition-colors"
                />
              </div>
              
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsAssignModalOpen(false)} className="flex-1 py-3 px-4 rounded-xl font-bold text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                  Bekor qilish
                </button>
                <button type="submit" className="flex-1 py-3 px-4 rounded-xl font-bold bg-[#FEC204] text-black hover:bg-[#e5ae03] transition-colors shadow-[0_0_20px_rgba(254,194,4,0.3)]">
                  Biriktirish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
`;

if (!code.includes("setIsAssignModalOpen(true)")) {
  code = code.replace(
    "{isTestBuilderOpen && testConfig && (",
    modalCode + "\n      {isTestBuilderOpen && testConfig && ("
  );
}

if (!code.includes("import { X,")) {
  code = code.replace("import { Trash2, Edit2, Copy, FileText }", "import { Trash2, Edit2, Copy, FileText, X }");
}

fs.writeFileSync('src/pages/admin/AdminTestsDatabase.tsx', code);
