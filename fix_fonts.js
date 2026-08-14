import fs from 'fs';
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf8');

const oldQuestionText = `<h3 className="text-[18px] md:text-[20px] font-bold text-white mb-5 md:mb-6 leading-relaxed pr-10 md:pr-12">`;
const newQuestionText = `<h3 className="text-[15px] md:text-[20px] font-bold text-white mb-5 md:mb-6 leading-relaxed pr-10 md:pr-12 overflow-x-auto">`;

const oldOptionText = `<span className="text-[14px] md:text-[15px] leading-snug"><Latex>{opt}</Latex></span>`;
const newOptionText = `<span className="text-[13px] md:text-[15px] leading-snug overflow-x-auto"><Latex>{opt}</Latex></span>`;

code = code.replace(oldQuestionText, newQuestionText);
code = code.replace(oldOptionText, newOptionText);

fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
console.log("Updated fonts");
