import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Replace text-white and text-black with semantic classes
  content = content.replace(/\btext-white\b/g, 'text-[color:var(--theme-text-primary)]');
  content = content.replace(/\btext-white\//g, 'text-[color:var(--theme-text-primary)]/');
  
  content = content.replace(/\btext-\[\#0d0d0d\]\b/g, 'text-[color:var(--theme-text-inverse)]');

  // Replace some bg-white/x with standard glass variables if not already done
  // Wait, let's just make sure text is legible everywhere
  
  content = content.replace(/border-white\/10/g, 'border-[color:var(--glass-border)]');
  content = content.replace(/border-white\/20/g, 'border-[color:var(--glass-border)]');

  fs.writeFileSync(file, content);
});

console.log("Done refactoring text colors.");
