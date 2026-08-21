const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminMore.tsx', 'utf-8');

const stateTarget = `  const [activeTab, setActiveTab] = useState<'menu'|'teachers'|'subjects'|'schedules'>('menu');`;
const newState = `  const [activeTab, setActiveTab] = useState<'menu'|'teachers'|'subjects'|'schedules'|'notifications'>('menu');`;
code = code.replace(stateTarget, newState);

const tabTarget = `      {activeTab === 'schedules' && <SchedulesTab onBack={() => setActiveTab('menu')} />}`;
const newTab = `      {activeTab === 'schedules' && <SchedulesTab onBack={() => setActiveTab('menu')} />}
      {activeTab === 'notifications' && <NotificationsTab onBack={() => setActiveTab('menu')} />}`;
code = code.replace(tabTarget, newTab);

const menuTarget = `          <ActionRow 
            icon={<CalendarIcon size={20} className="text-pink-500" />} 
            iconBg="bg-pink-500/10" 
            label="Dars jadvali" 
            sub="O'quv kunlari va soatlarini belgilash" 
            onClick={() => onTab('schedules')} 
          />`;
const newMenu = `          <ActionRow 
            icon={<CalendarIcon size={20} className="text-pink-500" />} 
            iconBg="bg-pink-500/10" 
            label="Dars jadvali" 
            sub="O'quv kunlari va soatlarini belgilash" 
            onClick={() => onTab('schedules')} 
          />
          <ActionRow 
            icon={<div className="text-orange-500 text-xl font-bold">🔔</div>} 
            iconBg="bg-orange-500/10" 
            label="Xabarnomalar (Push)" 
            sub="O'quvchilarga bildirishnoma yuborish" 
            onClick={() => onTab('notifications')} 
          />`;
code = code.replace(menuTarget, newMenu);

const notificationsTab = `
import { Bell, Send } from 'lucide-react';
import { auth } from '../../lib/firebase';

function NotificationsTab({ onBack }: { onBack: () => void }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [link, setLink] = useState('');
  const [target, setTarget] = useState('all');
  const [targetId, setTargetId] = useState('');
  const [groups, setGroups] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const unsubG = onSnapshot(collection(db, 'groups'), snap => setGroups(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubS = onSnapshot(query(collection(db, 'users'), where('role', '==', 'student')), snap => setStudents(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    
    // Notif history
    // Since we don't have indexes, just fetch and sort client side
    const unsubN = onSnapshot(collection(db, 'notifications'), snap => {
      const all = snap.docs.map(d => ({id: d.id, ...d.data()}));
      all.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setHistory(all.slice(0, 20));
    });
    
    return () => { unsubG(); unsubS(); unsubN(); };
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    try {
      setLoading(true);
      const idToken = await auth.currentUser.getIdToken(true);
      
      const res = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${idToken}\`
        },
        body: JSON.stringify({
          title, body, link, target, targetId: target === 'all' ? undefined : targetId
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success(\`Yuborildi! (Muvaffaqiyatli: \${data.sent || 0} ta)\`);
      setTitle(''); setBody(''); setLink('');
    } catch(err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 h-full flex flex-col">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-[18px] font-black text-white leading-tight">Xabarnomalar (Push)</h2>
          <p className="text-[12px] text-white/50">O'quvchilarga bildirishnoma yuborish</p>
        </div>
      </div>

      <div className="glass-panel p-5">
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest block mb-1">Sarlavha *</label>
            <input required value={title} onChange={e=>setTitle(e.target.value)} className="w-full glass-panel p-3 text-[14px] text-white outline-none focus:border-[#FEC204]" placeholder="Masalan: Yangi test qo'shildi!" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest block mb-1">Matn *</label>
            <textarea required value={body} onChange={e=>setBody(e.target.value)} className="w-full glass-panel p-3 text-[14px] text-white outline-none focus:border-[#FEC204] h-24 resize-none" placeholder="Xabar matni..." />
          </div>
          <div>
            <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest block mb-1">Havola (link) - Ixtiyoriy</label>
            <input value={link} onChange={e=>setLink(e.target.value)} className="w-full glass-panel p-3 text-[14px] text-white outline-none focus:border-[#FEC204]" placeholder="Masalan: /student/exams" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest block mb-1">Qabul qiluvchi</label>
            <select value={target} onChange={e=>{setTarget(e.target.value); setTargetId('');}} className="w-full glass-panel p-3 text-[14px] text-white outline-none focus:border-[#FEC204] appearance-none" style={{ colorScheme: "dark" }}>
              <option value="all">Barcha o'quvchilar</option>
              <option value="group">Guruh bo'yicha</option>
              <option value="user">Shaxsiy (Bitta o'quvchi)</option>
            </select>
          </div>
          {target === 'group' && (
            <div>
              <select required value={targetId} onChange={e=>setTargetId(e.target.value)} className="w-full glass-panel p-3 text-[14px] text-white outline-none focus:border-[#FEC204] appearance-none" style={{ colorScheme: "dark" }}>
                <option value="" disabled>Guruhni tanlang</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
          )}
          {target === 'user' && (
            <div>
              <select required value={targetId} onChange={e=>setTargetId(e.target.value)} className="w-full glass-panel p-3 text-[14px] text-white outline-none focus:border-[#FEC204] appearance-none" style={{ colorScheme: "dark" }}>
                <option value="" disabled>O'quvchini tanlang</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
              </select>
            </div>
          )}
          
          <button disabled={loading} type="submit" className="w-full py-3 bg-[#FEC204] text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#FEC204]/90 transition-colors mt-2">
            <Send size={18} /> {loading ? 'Yuborilmoqda...' : 'Yuborish'}
          </button>
        </form>
      </div>
      
      <div className="mt-8">
        <h3 className="text-[14px] font-bold text-white mb-4">Oxirgi yuborilganlar</h3>
        <div className="space-y-3">
          {history.length === 0 ? (
            <p className="text-[12px] text-white/40">Tarix bo'sh</p>
          ) : history.map(h => (
            <div key={h.id} className="glass-panel p-3">
              <h4 className="text-[13px] font-bold text-white">{h.title}</h4>
              <p className="text-[12px] text-white/60 mt-1">{h.body}</p>
              <div className="text-[10px] text-white/40 mt-2 flex justify-between">
                <span>{new Date(h.createdAt).toLocaleString()}</span>
                <span className="uppercase">{h.target}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
`;

code = code.replace("import { ScheduleItem } from '../../types';", "import { ScheduleItem } from '../../types';\n" + notificationsTab);

fs.writeFileSync('src/pages/admin/AdminMore.tsx', code);
