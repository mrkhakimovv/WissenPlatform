const fs = require('fs');
let code = fs.readFileSync('src/components/AdminLayout.tsx', 'utf8');

if (!code.includes('PullToRefresh')) {
  code = code.replace("import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';", "import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';\nimport { PullToRefresh } from './PullToRefresh';");
}

const regex = /<main className="flex-1 overflow-y-auto overscroll-y-contain p-5 md:p-8 scroll-smooth  w-full max-w-7xl mx-auto">[\s\S]*?<\/main>/;
const match = code.match(regex);
if (match) {
  const replacement = match[0].replace('<main', '<PullToRefresh').replace('</main>', '</PullToRefresh>');
  code = code.replace(match[0], replacement);
  fs.writeFileSync('src/components/AdminLayout.tsx', code);
  console.log("AdminLayout Patched via regex successfully");
} else {
  console.log("Not found via regex.");
}
