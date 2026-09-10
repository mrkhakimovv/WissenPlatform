const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf-8');

// 1. Define isBubbleMode at the top of the component, just below the useState hooks
const regexHook = /const containerRef = React.useRef<HTMLDivElement>\(null\);\s*const handleSubmitRef = React.useRef<any>\(null\);/;
code = code.replace(regexHook, `const containerRef = React.useRef<HTMLDivElement>(null);
  const handleSubmitRef = React.useRef<any>(null);
  const isBubbleMode = testData?.satType === "SAT Homework" || testData?.satType === "SAT practice";`);

// 2. Remove the old definition of isBubbleMode
const regexOldBubble = /\s*const isBubbleMode = testData\.satType === "SAT Homework" \|\| testData\.satType === "SAT practice";/;
code = code.replace(regexOldBubble, '');

// 3. Update the useEffect for event listeners to check for isBubbleMode
const regexEffect = /if \(hasStarted && !submitted\) {/g;
code = code.replace(regexEffect, `if (hasStarted && !submitted && !isBubbleMode) {`);

// 4. Update handleStart to skip fullscreen if isBubbleMode
const regexHandleStart = /const handleStart = async \(\) => {[\s\S]*?setHasStarted\(true\);\s*};/;
code = code.replace(regexHandleStart, `const handleStart = async () => {
    if (!isBubbleMode) {
      try {
        if (containerRef.current) await containerRef.current.requestFullscreen(); else await document.documentElement.requestFullscreen();
      } catch (e) {
        console.warn("Fullscreen request failed", e);
      }
    }
    setHasStarted(true);
  };`);

// 5. Update the "Imtihonga tayyormisiz?" text to hide the anti-cheat text for bubble mode
const regexText = /<p className="text-\[14px\] md:text-\[16px\] text-white\/60 mb-6">Test davomida to'liq ekran rejimidan chiqish, nusxa olish yoki skrinshot qilish mumkin emas\. Agar oyna yopilsa, test avtomatik yakunlanadi\.<\/p>/;
code = code.replace(regexText, `{!isBubbleMode && (
            <p className="text-[14px] md:text-[16px] text-white/60 mb-6">Test davomida to'liq ekran rejimidan chiqish, nusxa olish yoki skrinshot qilish mumkin emas. Agar oyna yopilsa, test avtomatik yakunlanadi.</p>
          )}`);

fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
