const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminCertificateBuilder.tsx', 'utf-8');

code = code.replace(
  /<input\s*type="text"\s*value=\{sub.correctAnswerText\}\s*onChange=\{\(e\) => updateSubAnswer\(activeQuestion, subIndex, e.target.value\)\}\s*className="w-full glass-panel p-3 outline-none focus:border-\[#FEC204\]\/50 text-sm"\s*placeholder=\{`Masalan: 42`\}\s*\/>/g,
  `<MathAnswerField
                                value={sub.correctAnswerText}
                                onChange={(val) => updateSubAnswer(activeQuestion, subIndex, val)}
                                placeholder="Masalan: 42"
                              />`
);

fs.writeFileSync('src/pages/admin/AdminCertificateBuilder.tsx', code);
