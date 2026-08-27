const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentCertificateTake.tsx', 'utf-8');

if (!code.includes('createPortal')) {
  code = code.replace(
    "import React, { useState, useEffect } from 'react';",
    "import React, { useState, useEffect } from 'react';\nimport { createPortal } from 'react-dom';"
  );
  
  code = code.replace(
    /return \(\s*<div className="fixed inset-0/,
    'return createPortal(\n    <div className="fixed inset-0'
  );
  
  // Need to close createPortal
  code = code.replace(
    /<\/div>\s*\);\s*\}\s*$/,
    '</div>,\n    document.body\n  );\n}\n'
  );

  fs.writeFileSync('src/pages/student/StudentCertificateTake.tsx', code);
}
