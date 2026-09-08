const fs = require('fs');

let code = fs.readFileSync('src/pages/admin/AdminSATDatabase.tsx', 'utf-8');

code = code.replace(
  "const [activeTab, setActiveTab] = useState<'exams' | 'base'>('exams');",
  "const [activeTab, setActiveTab] = useState<'exams' | 'base' | 'lessons'>('exams');"
);

code = code.replace(
  `          <button \n            onClick={() => setActiveTab('base')}\n            className={\`px-6 py-2.5 rounded-lg font-bold text-sm transition-all \${activeTab === 'base' ? 'bg-[#FEC204] text-black shadow-[0_0_10px_rgba(254,194,4,0.3)]' : 'text-white/60 hover:text-white hover:bg-white/5'}\`}\n          >\n            SAT BASE\n          </button>`,
  `          <button \n            onClick={() => setActiveTab('base')}\n            className={\`px-6 py-2.5 rounded-lg font-bold text-sm transition-all \${activeTab === 'base' ? 'bg-[#FEC204] text-black shadow-[0_0_10px_rgba(254,194,4,0.3)]' : 'text-white/60 hover:text-white hover:bg-white/5'}\`}\n          >\n            SAT BASE\n          </button>\n          <button \n            onClick={() => setActiveTab('lessons')}\n            className={\`px-6 py-2.5 rounded-lg font-bold text-sm transition-all \${activeTab === 'lessons' ? 'bg-[#FEC204] text-black shadow-[0_0_10px_rgba(254,194,4,0.3)]' : 'text-white/60 hover:text-white hover:bg-white/5'}\`}\n          >\n            DARSLAR\n          </button>`
);

code = code.replace(
  `          {activeTab === 'base' ? (`,
  `          {activeTab === 'lessons' ? (\n             <button \n                onClick={() => {}}\n                className="bg-[#FEC204] text-black px-6 py-2.5 rounded-[12px] font-bold hover:bg-[#FEC204]/90 transition-colors shadow-[0_0_15px_rgba(254,194,4,0.3)] flex items-center gap-2 text-[14px]"\n             >\n                <span className="text-xl leading-none">+</span> Dars qo'shish\n             </button>\n          ) : activeTab === 'base' ? (`
);

const emptyState = `          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-2xl border border-white/10 mt-6">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
               <FileText className="text-white/40" size={32} />
            </div>
            <p className="text-white font-bold text-lg mb-2">Hali SAT bazada testlar yo'q</p>
            <p className="text-white/40 text-sm">Yangi test bazasini yaratish uchun tepadan qo'shish tugmasini bosing</p>
          </div>
        )}`;

const withLessons = `          </div>
        ) : activeTab === 'base' ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-2xl border border-white/10 mt-6">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
               <FileText className="text-white/40" size={32} />
            </div>
            <p className="text-white font-bold text-lg mb-2">Hali SAT bazada testlar yo'q</p>
            <p className="text-white/40 text-sm">Yangi test bazasini yaratish uchun tepadan qo'shish tugmasini bosing</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-2xl border border-white/10 mt-6">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
               <FileText className="text-white/40" size={32} />
            </div>
            <p className="text-white font-bold text-lg mb-2">Hali darslar yo'q</p>
            <p className="text-white/40 text-sm">Darslar ro'yxati shu yerda ko'rsatiladi.</p>
          </div>
        )}`;

code = code.replace(emptyState, withLessons);

fs.writeFileSync('src/pages/admin/AdminSATDatabase.tsx', code);
