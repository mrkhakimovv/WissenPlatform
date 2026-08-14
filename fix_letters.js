import fs from 'fs';
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf8');

const oldRadio = `<div className={\`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 \${
                      answers[currentQuestion] === oIdx ? 'border-[#FEC204] bg-[#FEC204]' : 'border-white/20'
                    }\`}>
                      {answers[currentQuestion] === oIdx && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
                    </div>`;

const newRadio = `<div className={\`w-7 h-7 rounded border flex items-center justify-center shrink-0 mt-0 text-[13px] font-bold \${
                      answers[currentQuestion] === oIdx ? 'border-[#FEC204] bg-[#FEC204] text-black' : 'border-white/20 text-white/50'
                    }\`}>
                      {String.fromCharCode(65 + oIdx)}
                    </div>`;

if (code.includes(oldRadio)) {
  code = code.replace(oldRadio, newRadio);
  fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
  console.log("Success");
} else {
  console.log("Not found");
}
