import fs from 'fs';
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf8');

const overlayCode = `  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const preventCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      toast.error("Nusxa olish taqiqlangan!");
    };
    
    const preventKeys = (e: KeyboardEvent) => {
      // Prevent PrintScreen, Ctrl+P, Ctrl+S, Ctrl+C
      if (e.key === "PrintScreen") {
        navigator.clipboard.writeText("");
        toast.error("Skrinshot taqiqlangan!");
      }
      if (e.ctrlKey && (e.key === 'p' || e.key === 's' || e.key === 'c')) {
        e.preventDefault();
      }
    };
    
    const preventContext = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Testni yopmoqchimisiz? Natija avtomatik saqlanadi!";
      return e.returnValue;
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && hasStarted && !submitted) {
        if (window.confirm("To'liq ekrandan chiqdingiz. Testni yakunlaysizmi? (Agar bekor qilsangiz, test davom etadi va to'liq ekranga qaytishingiz kerak bo'ladi)")) {
          handleSubmit();
        } else {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      }
    };

    if (hasStarted && !submitted) {
      document.addEventListener('copy', preventCopy);
      document.addEventListener('keydown', preventKeys);
      document.addEventListener('contextmenu', preventContext);
      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('fullscreenchange', handleFullscreenChange);
    }
    
    return () => {
      document.removeEventListener('copy', preventCopy);
      document.removeEventListener('keydown', preventKeys);
      document.removeEventListener('contextmenu', preventContext);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [hasStarted, submitted]);

  const handleStart = async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch (e) {
      console.warn("Fullscreen request failed", e);
    }
    setHasStarted(true);
  };
`;

code = code.replace(
  "const [score, setScore] = useState(0);",
  "const [score, setScore] = useState(0);\n" + overlayCode
);

const timerCode = `  useEffect(() => {
    if (loading || submitted || !hasStarted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {`;

code = code.replace(
  "  useEffect(() => {\n    if (loading || submitted) return;\n    const timer = setInterval(() => {\n      setTimeLeft(prev => {",
  timerCode
);

const oldClose = `<button onClick={() => { if(window.confirm("Testni tugatmasdan chiqmoqchimisiz? Natija saqlanmaydi.")) onClose(); }} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10">`;
const newClose = `<button onClick={() => { if(window.confirm("Agar oyna yopilsa test avtomatik tugatiladi va joriy belgilangan javoblar hisoblanadi. Yopmoqchimisiz?")) { handleSubmit(); setTimeout(() => onClose(), 2000); } }} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10">`;

code = code.replace(oldClose, newClose);

const startOverlay = `  if (!hasStarted) {
    return (
      <div className="fixed inset-0 bg-[#0d0d0d] z-[200] flex items-center justify-center p-4">
        <div className="bg-[#1a1a1a] rounded-[24px] w-full max-w-lg p-8 flex flex-col items-center text-center border border-white/10">
          <h2 className="text-[24px] font-black text-white mb-4">Imtihonga tayyormisiz?</h2>
          <p className="text-white/60 mb-6">Test davomida to'liq ekran rejimidan chiqish, nusxa olish yoki skrinshot qilish mumkin emas. Agar oyna yopilsa, test avtomatik yakunlanadi.</p>
          <div className="flex gap-4 w-full">
            <button onClick={onClose} className="flex-1 py-4 rounded-[12px] bg-white/10 text-white font-bold hover:bg-white/20 transition-colors">
              Bekor qilish
            </button>
            <button onClick={handleStart} className="flex-1 py-4 rounded-[12px] bg-[#FEC204] text-black font-bold hover:bg-[#e5ae03] transition-colors shadow-[0_0_20px_rgba(254,194,4,0.3)]">
              Boshlash
            </button>
          </div>
        </div>
      </div>
    );
  }`;

code = code.replace(
  "  if (!testData) return null;",
  "  if (!testData) return null;\n\n" + startOverlay
);

code = code.replace(
  "<div className=\"fixed inset-0 bg-[#0d0d0d] z-[200] flex flex-col\">",
  "<div className=\"fixed inset-0 bg-[#0d0d0d] z-[200] flex flex-col select-none\">"
);

code = code.replace(
  "          <button onClick={onClose} className=\"w-full py-4 rounded-[12px] bg-white/10 text-white font-bold hover:bg-white/20 transition-colors\">",
  "          <button onClick={() => { if(document.fullscreenElement) document.exitFullscreen().catch(()=>{}); onClose(); }} className=\"w-full py-4 rounded-[12px] bg-white/10 text-white font-bold hover:bg-white/20 transition-colors\">"
);

fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
