const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSATDatabase.tsx', 'utf-8');

const emptyStateOld = `              {satTests.length === 0 ? (
        <div className="glass-panel p-6 flex flex-col items-center justify-center opacity-70 border-dashed border-2 px-12 py-16">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <span className="text-[24px]">📝</span>
          </div>
          <h3 className="text-[18px] font-bold text-white mb-2">Hali SAT bazada testlar yo'q</h3>
          <p className="text-[13px] text-white/40 text-center max-w-sm font-medium">Yangi test bazasini yaratish uchun tepadan qo'shish tugmasini bosing</p>
        </div>
      ) : (`;

const splitStr = `           </>\n        )}`;
const splitParts = code.split(splitStr);

if (splitParts.length >= 2) {
  // Let's replace the top conditional logic inside the JSX part
  code = code.replace(`        ) : ( \n           <>\n              <div className="mb-4">`, `        ) : activeTab === 'base' ? ( \n           <>\n              <div className="mb-4">`);
  
  const lessonUI = `        ) : (
           <>
              <div className="mb-4">
                 <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">Markaz SAT darsliklari va videokurslari</p>
              </div>
              <div className="glass-panel p-6 flex flex-col items-center justify-center opacity-70 border-dashed border-2 px-12 py-16">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <span className="text-[24px]">🎥</span>
                </div>
                <h3 className="text-[18px] font-bold text-white mb-2">Hali darslar qo'shilmagan</h3>
                <p className="text-[13px] text-white/40 text-center max-w-sm font-medium">Bu yerda siz o'quvchilaringiz uchun onlayn SAT darslari, videolar, va qo'shimcha materiallar yuklashingiz mumkin bo'ladi.</p>
              </div>
           </>
        )}`;
  
  code = code.replace(splitStr, `           </>\n${lessonUI}`);
  fs.writeFileSync('src/pages/admin/AdminSATDatabase.tsx', code);
  console.log('Successfully patched AdminSATDatabase.tsx!');
} else {
  console.log('Failed to find split string');
}

