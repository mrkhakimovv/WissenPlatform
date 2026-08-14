import fs from 'fs';
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf8');

if (!code.includes('const containerRef')) {
  code = code.replace(
    'const [hasStarted, setHasStarted] = useState(false);',
    'const [hasStarted, setHasStarted] = useState(false);\n  const containerRef = React.useRef<HTMLDivElement>(null);\n  const handleSubmitRef = React.useRef<any>(null);'
  );
}

if (!code.includes('handleSubmitRef.current = handleSubmit;')) {
  code = code.replace(
    'useEffect(() => {\n    const preventCopy = (e: ClipboardEvent) => {',
    'useEffect(() => {\n    handleSubmitRef.current = handleSubmit;\n  });\n\n  useEffect(() => {\n    const preventCopy = (e: ClipboardEvent) => {'
  );
}

code = code.replace(
  'if (window.confirm("To\'liq ekrandan chiqdingiz. Testni yakunlaysizmi? (Agar bekor qilsangiz, test davom etadi va to\'liq ekranga qaytishingiz kerak bo\'ladi)")) {\n          handleSubmit();\n        } else {\n          document.documentElement.requestFullscreen().catch(() => {});\n        }',
  'toast.error("To\'liq ekrandan chiqdingiz. Test avtomatik yakunlandi!");\n        if (handleSubmitRef.current) handleSubmitRef.current();'
);

code = code.replace(
  'import { createPortal } from \'react-dom\';',
  'import React from \'react\';\nimport { createPortal } from \'react-dom\';'
);

// We must apply the ref to the root div of the final return
code = code.replace(
  'return createPortal(\n    <div className="fixed inset-0 bg-[#0d0d0d] z-[200] flex flex-col select-none">',
  'return createPortal(\n    <div ref={containerRef} className="fixed inset-0 bg-[#0d0d0d] z-[99999] flex flex-col select-none">'
);

fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
