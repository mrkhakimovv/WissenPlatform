const fs = require('fs');

function patchFile(filename) {
    let code = fs.readFileSync(filename, 'utf-8');
    // Replace <NavLink to={item.to} end={item.to === '.'} ... with <NavLink to={item.to} end={item.to === '.'} replace ...
    code = code.replace(/<NavLink\n              key=\{item.to\}\n              to=\{item.to\}\n              end=\{item.to === '.'\}/g,
                        `<NavLink
              key={item.to}
              to={item.to}
              replace
              end={item.to === '.'}`);
    fs.writeFileSync(filename, code);
}

patchFile('src/components/StudentLayout.tsx');
patchFile('src/components/AdminLayout.tsx');

