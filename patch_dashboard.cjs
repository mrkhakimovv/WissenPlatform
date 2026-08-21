const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentDashboard.tsx', 'utf-8');

const importTarget = `import { NewsItem, ScheduleItem, Group, Exam } from '../../types';`;
const newImport = `import { NewsItem, ScheduleItem, Group, Exam } from '../../types';
import { requestNotificationPermission } from '../../lib/messaging';
import { Bell, X } from 'lucide-react';`;
code = code.replace(importTarget, newImport);

const stateTarget = `  const [groups, setGroups] = useState<Group[]>([]);`;
const newState = `  const [groups, setGroups] = useState<Group[]>([]);
  const [showNotifPrompt, setShowNotifPrompt] = useState(false);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      const timer = setTimeout(() => setShowNotifPrompt(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleEnableNotif = async () => {
    setShowNotifPrompt(false);
    await requestNotificationPermission();
  };`;
code = code.replace(stateTarget, newState);

const returnTarget = `  return (
    <div className="space-y-6 pb-6">`;
const newReturn = `  return (
    <div className="space-y-6 pb-6 relative">
      <AnimatePresence>
        {showNotifPrompt && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:w-80 bg-[#1a1a1a] border border-[#FEC204]/30 rounded-2xl p-4 shadow-2xl z-50 flex flex-col gap-3"
          >
            <button onClick={() => setShowNotifPrompt(false)} className="absolute top-2 right-2 text-white/50 hover:text-white"><X size={16}/></button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FEC204]/20 flex items-center justify-center text-[#FEC204]">
                <Bell size={20} />
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-white">Xabarnomalarni yoqish</h3>
                <p className="text-[11px] text-white/60 leading-tight mt-0.5">Yangi testlar va e'lonlardan birinchi bo'lib xabardor bo'ling!</p>
              </div>
            </div>
            <button onClick={handleEnableNotif} className="w-full py-2.5 bg-[#FEC204] text-black font-bold text-[13px] rounded-xl hover:bg-[#FEC204]/90 transition-colors">
              Yoqish
            </button>
          </motion.div>
        )}
      </AnimatePresence>
`;
code = code.replace(returnTarget, newReturn);

fs.writeFileSync('src/pages/student/StudentDashboard.tsx', code);
