const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentCertificateTake.tsx', 'utf8');

const targetStr = "const [isSubmitting, setIsSubmitting] = useState(false);";
const replacement = targetStr + "\n" +
  "  const handleSelectOption = (qId, optIndex) => {\n" +
  "    setUserAnswers(prev => ({ ...prev, [qId]: optIndex }));\n" +
  "  };\n" +
  "\n" +
  "  const handleOpenAnswer = (qId, part, latex) => {\n" +
  "    setUserAnswers(prev => ({ ...prev, [qId + '_' + part]: latex }));\n" +
  "  };\n";

code = code.replace(targetStr, replacement);
fs.writeFileSync('src/pages/student/StudentCertificateTake.tsx', code);
console.log("Patched");
