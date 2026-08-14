import fs from 'fs';
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf8');

// 1. Add AlertTriangle to lucide-react
if (!code.includes('AlertTriangle')) {
  code = code.replace(
    "import { X, CheckCircle, ChevronRight, ChevronLeft, Bookmark } from 'lucide-react';",
    "import { X, CheckCircle, ChevronRight, ChevronLeft, Bookmark, AlertTriangle } from 'lucide-react';"
  );
}

// 2. Add showExitConfirm state
if (!code.includes('const [showExitConfirm, setShowExitConfirm] = useState(false);')) {
  code = code.replace(
    "const [marked, setMarked] = useState<Record<number, boolean>>({});",
    "const [marked, setMarked] = useState<Record<number, boolean>>({});\n  const [showExitConfirm, setShowExitConfirm] = useState(false);"
  );
}

// 3. Update handleFullscreenChange
const oldHandleFullscreen = `    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && hasStarted && !submitted) {
        toast.error("To'liq ekrandan chiqdingiz. Test avtomatik yakunlandi!");
        if (handleSubmitRef.current) handleSubmitRef.current();
      }
    };`;

const newHandleFullscreen = `    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && hasStarted && !submitted) {
        setShowExitConfirm(true);
      }
    };`;

code = code.replace(oldHandleFullscreen, newHandleFullscreen);

// 4. Update the X button
const oldXButton = `onClick={() => { if(window.confirm("Agar oyna yopilsa test avtomatik tugatiladi va joriy belgilangan javoblar hisoblanadi. Yopmoqchimisiz?")) { handleSubmit(); if(document.fullscreenElement) document.exitFullscreen().catch(()=>{}); setTimeout(() => onClose(), 2000); } }}`;

const newXButton = `onClick={() => setShowExitConfirm(true)}`;

code = code.replace(oldXButton, newXButton);

// 5. Inject the modal UI just before `return <>{createPortal(` at the end of the file.
const modalCode = `
      {showExitConfirm && (
        <div className="fixed inset-0 bg-[#0d0d0d]/90 z-[999999] flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1a1a1a] rounded-[24px] w-full max-w-md p-8 border border-red-500/20 text-center shadow-2xl shadow-red-500/10"
          >
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Testdan chiqmoqchimisiz?</h2>
            <p className="text-white/70 mb-8 leading-relaxed">
              Siz test jarayonidan chiqmoqchisiz. Agar ushbu oynadan chiqib ketsangiz test avtomatik yakunlanadi va joriy belgilangan javoblar hisoblanadi.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => {
                  setShowExitConfirm(false);
                  handleSubmit();
                  if(document.fullscreenElement) document.exitFullscreen().catch(()=>{});
                }}
                className="flex-1 py-4 px-6 rounded-xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 transition-colors"
              >
                Chiqaman
              </button>
              <button 
                onClick={() => {
                  setShowExitConfirm(false);
                  if (!document.fullscreenElement) {
                    if (containerRef.current) containerRef.current.requestFullscreen().catch(()=>{});
                    else document.documentElement.requestFullscreen().catch(()=>{});
                  }
                }}
                className="flex-1 py-4 px-6 rounded-xl bg-[#FEC204] text-black font-bold hover:bg-[#FEC204]/90 transition-colors"
              >
                Davom etaman
              </button>
            </div>
          </motion.div>
        </div>
      )}
`;

// we need to insert it right before the last closing div of the main returned component.
// The main component returns createPortal(<div ref={containerRef} ...> ... </div>, document.body).
// Let's find: `</div>,` right before `document.body`
const portalEnd = `      </div>,
      document.body`;

code = code.replace(portalEnd, modalCode + portalEnd);

fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
console.log("Replaced successfully!");
