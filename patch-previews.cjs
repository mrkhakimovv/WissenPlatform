const fs = require('fs');

const files = [
  'src/pages/admin/AdminSATBuilder.tsx',
  'src/pages/admin/AdminTestBuilder.tsx',
  'src/pages/admin/AdminCertificateBuilder.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf-8');

  // We are looking for:
  //                    {currentQ.isOpenEnded ? (
  //                       <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
  //                          <span className="font-bold text-gray-500 mb-2 block">To'g'ri javob:</span>
  //                          <div className="bg-gray-100 p-3 rounded text-sm text-gray-600">
  //                             <Latex>{currentQ.correctAnswerText ? \`$$\${currentQ.correctAnswerText}$$\` : 'Kiritilmagan'}</Latex>
  //                          </div>
  //                       </div>
  //                    ) : (

  const oldRegex = /\{currentQ\.isOpenEnded \? \([\s\S]*?border-dashed[\s\S]*?To'g'ri javob:[\s\S]*?Latex>[\s\S]*?<\/div>\s*<\/div>\s*\) : \(/;

  const replacement = `{currentQ.isOpenEnded ? (
                       <div className="w-full text-left p-3 md:p-4 rounded-[14px] md:rounded-xl border transition-all border-gray-300 bg-gray-50">
                          <p className="text-gray-500 text-sm mb-3">O'z javobingizni kiriting:</p>
                          <div className="w-full bg-white p-4 rounded-lg border border-gray-300 text-gray-400 font-bold">
                             Javobingizni shu yerga yozing...
                          </div>
                       </div>
                    ) : (`;

  if (oldRegex.test(code)) {
    code = code.replace(oldRegex, replacement);
    fs.writeFileSync(file, code);
    console.log(`Patched ${file}`);
  } else {
    console.log(`Could not find target in ${file}`);
    
    // Check for another variation where there is a To'g'ri javob block (like in AdminCertificateBuilder)
    const altRegex = /\{currentQ\.isOpenEnded \? \([\s\S]*?To'g'ri javob:[\s\S]*?Latex>[\s\S]*?<\/div>\s*<\/div>\s*\) : \(/;
    if (altRegex.test(code)) {
        code = code.replace(altRegex, replacement);
        fs.writeFileSync(file, code);
        console.log(`Patched ${file} with altRegex`);
    } else {
        console.log(`Still could not patch ${file}`);
    }
  }
}
