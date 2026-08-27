const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentCertificateTake.tsx', 'utf8');

// Add Menu and X to lucide-react imports
if (code.includes('import { AlertTriangle') && !code.includes('Menu, X')) {
    code = code.replace("CheckCircle2}", "CheckCircle2, Menu, X}");
}

// Add state for mobile sidebar
if (!code.includes('isMobileSidebarOpen')) {
    code = code.replace(
        "const [activeQ, setActiveQ] = useState(0);",
        "const [activeQ, setActiveQ] = useState(0);\n  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);"
    );
}

// Replace the return block for the test UI
const targetReturn = `return createPortal(
    <div className="fixed inset-0 bg-[#0d0d0d] z-[9999] flex flex-col animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="bg-[#1a1a1a] p-4 flex items-center justify-between border-b border-white/10 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-white">{exam.title}</h2>
          <p className="text-white/50 text-sm">Milliy Sertifikat (Rasch) • {testData.questions.length} savol</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#FEC204]/20 text-[#FEC204] px-4 py-2 rounded-xl font-bold border border-[#FEC204]/30">
            <Clock size={20} />
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
          <button onClick={handleManualSubmit} disabled={isSubmitting} className="bg-[#FEC204] text-black px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:opacity-90">
            {isSubmitting ? 'Yuborilmoqda...' : <><Send size={18} /> Yakunlash</>}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Area */}
        <div className="flex-1 flex flex-col p-6 overflow-y-auto custom-scrollbar" id="questions-container">`;

const newReturn = `return createPortal(
    <div className="fixed inset-0 bg-[#0d0d0d] z-[99999] flex flex-col animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="bg-[#1a1a1a] p-3 md:p-4 flex flex-col md:flex-row items-start md:items-center justify-between border-b border-white/10 shrink-0 gap-3 md:gap-0">
        <div className="flex justify-between items-center w-full md:w-auto">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-white line-clamp-1">{exam.title}</h2>
            <p className="text-white/50 text-xs md:text-sm">Milliy Sertifikat (Rasch) • {testData.questions.length} savol</p>
          </div>
          <button 
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="lg:hidden p-2 bg-white/5 rounded-lg text-white/70 hover:text-white"
          >
            <Menu size={20} />
          </button>
        </div>
        <div className="flex items-center justify-between w-full md:w-auto gap-2 md:gap-4">
          <div className="flex items-center gap-2 bg-[#FEC204]/20 text-[#FEC204] px-3 py-1.5 md:px-4 md:py-2 rounded-xl font-bold border border-[#FEC204]/30 text-sm md:text-base">
            <Clock size={16} className="md:w-5 md:h-5" />
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
          <button onClick={handleManualSubmit} disabled={isSubmitting} className="bg-[#FEC204] text-black px-4 py-1.5 md:px-6 md:py-2 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 text-sm md:text-base">
            {isSubmitting ? 'Yuborilmoqda...' : <><Send size={16} className="md:w-[18px] md:h-[18px]" /> Yakunlash</>}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Area */}
        <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto custom-scrollbar" id="questions-container">`;

if (code.includes(targetReturn)) {
    code = code.replace(targetReturn, newReturn);
} else {
    console.log("Could not find first target block");
}

const targetSidebar = `</div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Area */}
        <div className="flex-1 flex flex-col p-6 overflow-y-auto custom-scrollbar" id="questions-container">
          <div className="max-w-4xl w-full mx-auto space-y-12">`;

const targetSidebar2 = `</div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-[#1a1a1a] border-l border-white/10 flex flex-col p-4 shrink-0">
          <h3 className="font-bold text-white/50 mb-4">Savollar ({testData.questions.length})</h3>`;

const newSidebar2 = `</div>
        </div>

        {/* Right Sidebar (Responsive) */}
        <div className={\`
          absolute lg:static inset-y-0 right-0 z-50
          w-[280px] md:w-80 bg-[#1a1a1a] border-l border-white/10 flex flex-col p-4 shrink-0 transition-transform duration-300
          \${isMobileSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        \`}>
          <div className="flex justify-between items-center mb-4 lg:hidden">
            <h3 className="font-bold text-white/50">Savollar ({testData.questions.length})</h3>
            <button onClick={() => setIsMobileSidebarOpen(false)} className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white">
              <X size={20} />
            </button>
          </div>
          <h3 className="font-bold text-white/50 mb-4 hidden lg:block">Savollar ({testData.questions.length})</h3>`;

if (code.includes(targetSidebar2)) {
    code = code.replace(targetSidebar2, newSidebar2);
} else {
    console.log("Could not find second target block");
}

const targetEnd = `              );
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}`;

const newEnd = `              );
            })}
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}
      </div>
    </div>,
    document.body
  );
}`;

if (code.includes(targetEnd)) {
    code = code.replace(targetEnd, newEnd);
} else {
    console.log("Could not find third target block");
}

fs.writeFileSync('src/pages/student/StudentCertificateTake.tsx', code);
console.log("Patched responsive layout");
