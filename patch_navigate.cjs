const fs = require('fs');

function patchFile(filename) {
    let code = fs.readFileSync(filename, 'utf-8');
    
    // Replace navigate('/path') with navigate('/path', { replace: true })
    // Careful with regex to catch exact patterns
    code = code.replace(/navigate\('([^']+)'\)/g, "navigate('$1', { replace: true })");
    code = code.replace(/navigate\("([^"]+)"\)/g, 'navigate("$1", { replace: true })');
    
    fs.writeFileSync(filename, code);
}

patchFile('src/pages/admin/AdminDashboard.tsx');
patchFile('src/pages/StudentRegistration.tsx');
patchFile('src/pages/TeacherRegistration.tsx');
patchFile('src/components/StudentLayout.tsx');
patchFile('src/components/AdminLayout.tsx');

