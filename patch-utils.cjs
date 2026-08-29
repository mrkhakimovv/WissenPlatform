const fs = require('fs');
let code = fs.readFileSync('src/lib/utils.ts', 'utf-8');

const newFunc = `
export function formatDateTimeUz(iso: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  const months = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentyabr", "oktyabr", "noyabr", "dekabr"];
  
  const d = date.getDate();
  const m = months[date.getMonth()];
  const y = date.getFullYear();
  
  const hh = date.getHours().toString().padStart(2, '0');
  const mm = date.getMinutes().toString().padStart(2, '0');
  
  return \`\${d}-\${m}, \${y} \${hh}:\${mm}\`;
}
`;

if (!code.includes('formatDateTimeUz')) {
  fs.writeFileSync('src/lib/utils.ts', code + '\\n' + newFunc);
}
