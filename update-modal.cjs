const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminMilliySertifikat.tsx', 'utf-8');

const modalHTML = `
      {isCreationModeModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Test kiritish usuli</h3>
                <button onClick={() => setIsCreationModeModalOpen(false)} className="text-white/50 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <button onClick={() => handleStartCreation(false)} className="w-full text-left p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors group relative overflow-hidden">
                  <div className="font-bold text-white text-lg mb-1 group-hover:text-[#FEC204] transition-colors">To'liq (Savol + Javob)</div>
                  <div className="text-sm text-white/50">Testning to'liq savol va javoblarini kiritish orqali haqiqiy onlayn test varaqasini yaratish.</div>
                </button>
                <button onClick={() => handleStartCreation(true)} className="w-full text-left p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors group relative overflow-hidden">
                  <div className="font-bold text-white text-lg mb-1 group-hover:text-[#FEC204] transition-colors">Faqat javoblar (Tezkor)</div>
                  <div className="text-sm text-white/50">Javoblar varaqasi shaklida faqat to'g'ri kalitlarni va matnlarni kiritish. O'quvchilar javoblarini tekshirish uchun.</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}`;

code = code.replace('{/* Assign Modal */}', modalHTML);
fs.writeFileSync('src/pages/admin/AdminMilliySertifikat.tsx', code);
