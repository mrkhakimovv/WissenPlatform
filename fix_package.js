const fs = require('fs');

let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const packagesToMove = [
  'esbuild',
  'tailwindcss',
  'autoprefixer',
  'vite-plugin-pwa'
];

// Ensure vite is in dependencies (it's already there but just in case)
if (pkg.devDependencies.vite) {
  pkg.dependencies.vite = pkg.devDependencies.vite;
  delete pkg.devDependencies.vite;
}

for (const p of packagesToMove) {
  if (pkg.devDependencies[p]) {
    pkg.dependencies[p] = pkg.devDependencies[p];
    delete pkg.devDependencies[p];
  }
}

// Sort dependencies
pkg.dependencies = Object.keys(pkg.dependencies).sort().reduce(
  (obj, key) => { 
    obj[key] = pkg.dependencies[key]; 
    return obj;
  }, 
  {}
);

pkg.devDependencies = Object.keys(pkg.devDependencies).sort().reduce(
  (obj, key) => { 
    obj[key] = pkg.devDependencies[key]; 
    return obj;
  }, 
  {}
);

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
