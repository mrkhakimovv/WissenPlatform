const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf-8');
if (!code.includes('export const app = initializeApp(firebaseConfig);')) {
  code = code.replace('const app = initializeApp(firebaseConfig);', 'export const app = initializeApp(firebaseConfig);');
  code = code.replace('export const firebaseConfig = {', 'export const firebaseConfig = {'); // just in case
  if (!code.includes('export const firebaseConfig =')) {
     code = code.replace('const firebaseConfig = {', 'export const firebaseConfig = {');
  }
  fs.writeFileSync('src/lib/firebase.ts', code);
}
