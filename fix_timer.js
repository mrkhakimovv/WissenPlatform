import fs from 'fs';
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf8');

code = code.replace(
  '  }, [loading, submitted]);',
  '  }, [loading, submitted, hasStarted]);'
);

fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
