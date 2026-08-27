const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentCertificateTake.tsx', 'utf8');

const target = `  return createPortal(
    <div className="fixed inset-0 bg-[#0d0d0d] z-[9999] flex flex-col animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}`;

const replacement = `  if (resultSummary) {
    return createPortal(
      <div className="fixed inset-0 bg-[#0d0d0d] z-[9999] flex items-center justify-center animate-in fade-in duration-300">
        <div className="glass-panel p-8 max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={40} className="text-green-500" />
          </div>
          <h2 className="text-3xl font-black text-white">Test Yakunlandi!</h2>
          <p className="text-white/60">Sizning natijangiz muvaffaqiyatli saqlandi va Rasch modeli asosida hisoblanish uchun adminga yuborildi.</p>
          
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 my-6">
            <p className="text-sm text-white/50 mb-2 uppercase font-bold tracking-wider">To'g'ri javoblar</p>
            <p className="text-5xl font-black text-[#FEC204]">{resultSummary.score} <span className="text-xl text-white/40">/ {resultSummary.total}</span></p>
          </div>
          
          <button onClick={onClose} className="w-full bg-[#FEC204] text-black py-4 rounded-xl font-bold text-lg hover:bg-[#FEC204]/90 transition-colors">
            Asosiy menuga qaytish
          </button>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="fixed inset-0 bg-[#0d0d0d] z-[9999] flex flex-col animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}`;

code = code.replace(target, replacement);

if (!code.includes("CheckCircle2")) {
  code = code.replace("AlertTriangle, Clock, Send, ChevronLeft, ChevronRight", "AlertTriangle, Clock, Send, ChevronLeft, ChevronRight, CheckCircle2");
}

fs.writeFileSync('src/pages/student/StudentCertificateTake.tsx', code);
console.log("Patched render");
