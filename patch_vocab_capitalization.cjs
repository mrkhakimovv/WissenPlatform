const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentVocabModal.tsx', 'utf-8');

// Function to capitalize first letter
const capFirstFunc = `
function capitalizeFirstLetter(string: string) {
  if (!string) return string;
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function shuffleArray<T>(array: T[]): T[] {
`;

code = code.replace(`function shuffleArray<T>(array: T[]): T[] {`, capFirstFunc);

// Update pair generation to capitalize all English and Uzbek words
const oldPairsMemo = `  const pairs = useMemo(() => {
    const p = [];
    const maxLen = Math.max(engs.length, uzs.length);
    for (let i = 0; i < maxLen; i++) {
      if (engs[i] && uzs[i]) {
        p.push({ eng: engs[i], uz: uzs[i] });
      }
    }
    return p;
  }, [engs, uzs]);`;

const newPairsMemo = `  const pairs = useMemo(() => {
    const p = [];
    const maxLen = Math.max(engs.length, uzs.length);
    for (let i = 0; i < maxLen; i++) {
      if (engs[i] && uzs[i]) {
        p.push({ 
          eng: capitalizeFirstLetter(engs[i]), 
          uz: capitalizeFirstLetter(uzs[i]) 
        });
      }
    }
    return p;
  }, [engs, uzs]);`;

code = code.replace(oldPairsMemo, newPairsMemo);

fs.writeFileSync('src/pages/student/StudentVocabModal.tsx', code);
