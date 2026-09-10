const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf-8');

const regexBubbleMode = /\{isBubbleMode \? \([\s\S]*?\) : \(\s*<>\s*/;
code = code.replace(regexBubbleMode, '<>\n        ');

// Remove the closing `</>\n      )}` at the end of the questions list.
// There is a `</>\n      )}` right before `</div>\n      {showExitConfirm && (`

const regexEnd = /<\/>\s*\)\}\s*<\/div>\s*\{showExitConfirm/;
code = code.replace(regexEnd, '</>\n      </div>\n      {showExitConfirm');

// Now, update the question rendering logic
// Find this part:
/*
              <h3 className="text-[15px] md:text-[20px] font-bold text-white mb-5 md:mb-6 leading-relaxed pr-10 md:pr-12 overflow-x-auto">
                <span className="text-[#FEC204] mr-2">{qIndex + 1}.</span>
                <Latex>{q.text}</Latex>
              </h3>
              
              {q.imageUrl && (
                <img src={q.imageUrl} alt="Savol rasmi" className="max-w-full h-auto max-h-[300px] object-contain rounded-[14px] md:rounded-xl mb-6 border border-white/10" />
              )}
*/
const oldQuestionHeader = `<h3 className="text-[15px] md:text-[20px] font-bold text-white mb-5 md:mb-6 leading-relaxed pr-10 md:pr-12 overflow-x-auto">
                <span className="text-[#FEC204] mr-2">{qIndex + 1}.</span>
                <Latex>{q.text}</Latex>
              </h3>
              
              {q.imageUrl && (
                <img src={q.imageUrl} alt="Savol rasmi" className="max-w-full h-auto max-h-[300px] object-contain rounded-[14px] md:rounded-xl mb-6 border border-white/10" />
              )}`;

const newQuestionHeader = `<h3 className={\`font-bold text-white leading-relaxed pr-10 md:pr-12 overflow-x-auto \${isBubbleMode ? 'text-xl mb-6' : 'text-[15px] md:text-[20px] mb-5 md:mb-6'}\`}>
                <span className="text-[#FEC204] mr-2">{qIndex + 1}.</span>
                {!isBubbleMode && <Latex>{q.text}</Latex>}
              </h3>
              
              {!isBubbleMode && q.imageUrl && (
                <img src={q.imageUrl} alt="Savol rasmi" className="max-w-full h-auto max-h-[300px] object-contain rounded-[14px] md:rounded-xl mb-6 border border-white/10" />
              )}`;
code = code.replace(oldQuestionHeader, newQuestionHeader);

// And also replace the `hasOptionText` logic. If `isBubbleMode`, we treat it as if there is no option text.
const oldOptionsLogic = `const hasOptionText = q.options.some((opt: string) => opt && opt.trim() !== '');
                    return hasOptionText ? (`;

const newOptionsLogic = `const hasOptionText = !isBubbleMode && q.options.some((opt: string) => opt && opt.trim() !== '');
                    return hasOptionText ? (`;
code = code.replace(oldOptionsLogic, newOptionsLogic);

fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
