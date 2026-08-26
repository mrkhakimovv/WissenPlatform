const fs = require('fs');
let code = fs.readFileSync('src/components/StudentLayout.tsx', 'utf8');

if (!code.includes('PullToRefresh')) {
  code = code.replace("import { NavLink, Outlet, useLocation } from 'react-router-dom';", "import { NavLink, Outlet, useLocation } from 'react-router-dom';\nimport { PullToRefresh } from './PullToRefresh';");
}

const oldMain = `<main className={\`flex-1 overflow-y-auto overscroll-y-contain scroll-smooth relative z-10 w-full max-w-7xl mx-auto p-5 md:p-8 \${isProfile ? 'md:p-8 p-0' : ''}\`}>
          <Outlet />
        </main>`;

const newMain = `<PullToRefresh className={\`flex-1 overflow-y-auto overscroll-y-contain scroll-smooth relative z-10 w-full max-w-7xl mx-auto p-5 md:p-8 \${isProfile ? 'md:p-8 p-0' : ''}\`}>
          <Outlet />
        </PullToRefresh>`;

if (code.includes(oldMain)) {
  code = code.replace(oldMain, newMain);
  fs.writeFileSync('src/components/StudentLayout.tsx', code);
  console.log("Patched successfully");
} else {
  console.log("Could not find oldMain string. Looking for partial matches...");
  const regex = /<main className=\{`flex-1 overflow-y-auto overscroll-y-contain[^>]+>[\s\S]*?<\/main>/;
  const match = code.match(regex);
  if (match) {
    const replacement = match[0].replace('<main', '<PullToRefresh').replace('</main>', '</PullToRefresh>');
    code = code.replace(match[0], replacement);
    fs.writeFileSync('src/components/StudentLayout.tsx', code);
    console.log("Patched via regex successfully");
  } else {
    console.log("Not found via regex either.");
  }
}
