const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentCertificateTake.tsx', 'utf8');

const targetSidebar = `{/* Sidebar Nav */}
        <div className="w-80 bg-[#121212] border-l border-white/10 p-4 flex flex-col h-full">
          <h3 className="font-bold text-white/50 mb-4">Savollar ({testData.questions.length})</h3>`;

const newSidebar = `{/* Sidebar Nav (Responsive) */}
        <div className={\`
          absolute lg:static inset-y-0 right-0 z-50
          w-[280px] lg:w-80 bg-[#121212] border-l border-white/10 p-4 flex flex-col h-full shrink-0 transition-transform duration-300
          \${isMobileSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        \`}>
          <div className="flex justify-between items-center mb-4 lg:hidden">
            <h3 className="font-bold text-white/50">Savollar ({testData.questions.length})</h3>
            <button onClick={() => setIsMobileSidebarOpen(false)} className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white">
              <X size={20} />
            </button>
          </div>
          <h3 className="font-bold text-white/50 mb-4 hidden lg:block">Savollar ({testData.questions.length})</h3>`;

if (code.includes(targetSidebar)) {
    code = code.replace(targetSidebar, newSidebar);
    fs.writeFileSync('src/pages/student/StudentCertificateTake.tsx', code);
    console.log("Patched responsive sidebar");
} else {
    console.log("Could not find sidebar target block");
}
