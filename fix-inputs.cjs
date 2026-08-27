const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminCertificateBuilder.tsx', 'utf-8');

// Add import
if (!code.includes('import MathAnswerField')) {
  code = code.replace(
    "import toast from 'react-hot-toast';",
    "import toast from 'react-hot-toast';\nimport MathAnswerField from '../../components/MathAnswerField';"
  );
}

// 1. Replace input in fast mode
code = code.replace(
  /<input \s*type="text" \s*placeholder="Javob\.\.\." \s*value=\{q\.subAnswers\?\.\[0\]\?\.correctAnswerText \|\| ''\}\s*onChange=\{\(e\) => updateSubAnswer\(i, 0, e\.target\.value\)\}\s*className="flex-1 bg-white\/5 p-2 rounded-lg outline-none text-white text-sm"\s*\/>/g,
  `<div className="flex-1 min-w-0">
                          <MathAnswerField
                            value={q.subAnswers?.[0]?.correctAnswerText || ''}
                            onChange={(val) => updateSubAnswer(i, 0, val)}
                            placeholder="Javob..."
                          />
                        </div>`
);

code = code.replace(
  /<input \s*type="text" \s*placeholder="Javob\.\.\." \s*value=\{q\.subAnswers\?\.\[1\]\?\.correctAnswerText \|\| ''\}\s*onChange=\{\(e\) => updateSubAnswer\(i, 1, e\.target\.value\)\}\s*className="flex-1 bg-white\/5 p-2 rounded-lg outline-none text-white text-sm"\s*\/>/g,
  `<div className="flex-1 min-w-0">
                          <MathAnswerField
                            value={q.subAnswers?.[1]?.correctAnswerText || ''}
                            onChange={(val) => updateSubAnswer(i, 1, val)}
                            placeholder="Javob..."
                          />
                        </div>`
);

fs.writeFileSync('src/pages/admin/AdminCertificateBuilder.tsx', code);
