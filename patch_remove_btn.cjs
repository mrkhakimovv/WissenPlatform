const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminStudents.tsx', 'utf-8');

const targetStr = `      <div className="fixed bottom-[100px] left-0 w-full max-w-[430px] px-6 mx-auto right-0 sm:absolute z-20">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FEC204] to-[#f59e0b] text-[#0d0d0d] font-bold shadow-lg shadow-[#FEC204]/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <span className="text-xl leading-none">+</span> O'quvchi Qo'shish
        </button>
      </div>`;

code = code.replace(targetStr, '');

fs.writeFileSync('src/pages/admin/AdminStudents.tsx', code);
