import fs from 'fs';
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf8');

// 1. Add useRef for container and for handleSubmit
if (!code.includes("const containerRef = useRef<HTMLDivElement>(null);")) {
  code = code.replace(
    "const [hasStarted, setHasStarted] = useState(false);",
    "const [hasStarted, setHasStarted] = useState(false);\n  const containerRef = useRef<HTMLDivElement>(null);\n  const handleSubmitRef = useRef<() => void>();\n  \n  useEffect(() => {\n    handleSubmitRef.current = handleSubmit;\n  });"
  );
}

// 2. Change handleFullscreenChange to use handleSubmitRef
const oldFullscreenChange = `    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && hasStarted && !submitted) {
        if (window.confirm("To'liq ekrandan chiqdingiz. Testni yakunlaysizmi? (Agar bekor qilsangiz, test davom etadi va to'liq ekranga qaytishingiz kerak bo'ladi)")) {
          handleSubmit();
        } else {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      }
    };`;

const newFullscreenChange = `    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && hasStarted && !submitted) {
        toast.error("To'liq ekrandan chiqdingiz. Test avtomatik yakunlandi!");
        if (handleSubmitRef.current) handleSubmitRef.current();
      }
    };`;

code = code.replace(oldFullscreenChange, newFullscreenChange);

// 3. Change handleBeforeUnload to just trigger handleSubmit directly if possible, though beforeunload can't await. We rely on fullscreenchange which triggers first when they exit. Actually beforeunload doesn't fire when they just press escape.

// 4. Change requestFullscreen target
const oldHandleStart = `  const handleStart = async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch (e) {
      console.warn("Fullscreen request failed", e);
    }
    setHasStarted(true);
  };`;

const newHandleStart = `  const handleStart = async () => {
    try {
      if (containerRef.current) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch (e) {
      console.warn("Fullscreen request failed", e);
    }
    setHasStarted(true);
  };`;

code = code.replace(oldHandleStart, newHandleStart);

// 5. Apply containerRef to the main wrapper
code = code.replace(
  '<div className="fixed inset-0 bg-[#0d0d0d] z-[200] flex flex-col select-none">',
  '<div ref={containerRef} className="fixed inset-0 bg-[#0d0d0d] z-[99999] flex flex-col select-none">'
);

// 6. Also make sure the start overlay has the ref? No, the start overlay is completely replaced by the main wrapper. 
// Wait, if the main wrapper has the ref, and we call requestFullscreen on it inside handleStart, the DOM element must exist BEFORE handleStart is called!
// But wait! If !hasStarted is true, the main wrapper is NOT RENDERED!
