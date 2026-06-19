import fs from 'fs';

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
  let changed = false;

  // Re-map mockFirebase back to firebase implementation from src/lib/firebase (we exported all needed functions there)
  if (content.includes('../lib/mockFirebase')) {
    content = content.replace(/from\s+['"]\.\.\/lib\/mockFirebase['"]/g, "from '../lib/firebase'");
    changed = true;
  }
  if (content.includes('../../lib/mockFirebase')) {
    content = content.replace(/from\s+['"]\.\.\/\.\.\/lib\/mockFirebase['"]/g, "from '../../lib/firebase'");
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
