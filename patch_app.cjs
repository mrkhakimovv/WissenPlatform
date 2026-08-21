const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const importTarget = `import React from 'react';`;
const newImport = `import React, { useEffect } from 'react';
import { setupMessageListener } from './lib/messaging';`;
code = code.replace(importTarget, newImport);

const mainAppTarget = `function App() {
  return (`;
const newMainApp = `function App() {
  useEffect(() => {
    setupMessageListener();
  }, []);
  
  return (`;
code = code.replace(mainAppTarget, newMainApp);

fs.writeFileSync('src/App.tsx', code);
