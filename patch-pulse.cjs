const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf-8');

const regex = /\{stats\.hasUnassignedStudents && \([\s\S]*?\)\s*\}\s*<div onClick=\{\(\) => navigate\('\/admin\/students'/;

const match = code.match(regex);
if (match) {
    const replacement = `<div onClick={() => navigate('/admin/students', { replace: true })} className="relative glass-panel p-4 md:p-6 border-l-4 border-[#FEC204] hover:scale-[1.02] transition-transform cursor-pointer">
          {stats.hasUnassignedStudents && (
             <div className="absolute inset-0 rounded-[1.5rem] border-2 border-[#FEC204] shadow-[0_0_15px_rgba(254,194,4,0.5)] animate-pulse pointer-events-none z-10"></div>
          )}
`;
    // Find the original full tag
    const fullOriginalRegex = /\{stats\.hasUnassignedStudents && \([\s\S]*?\)\s*\}\s*<div onClick=\{\(\) => navigate\('\/admin\/students', \{ replace: true \}\)\} className="relative glass-panel p-4 md:p-6 border-l-4 border-\[#FEC204\] hover:scale-\[1\.02\] transition-transform cursor-pointer">/;
    
    code = code.replace(fullOriginalRegex, replacement);
    fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', code);
    console.log("Success");
} else {
    console.log("Match not found");
}

