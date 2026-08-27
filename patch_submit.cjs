const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentCertificateTake.tsx', 'utf8');

const submitLogic = `  const handleManualSubmit = async () => {
    let answeredCount = 0;
    testData.questions.forEach((q) => {
      if (q.isOpenEnded) {
        if ((userAnswers[\`\${q.id}_0\`]?.trim() !== '' && userAnswers[\`\${q.id}_0\`] !== undefined) ||
            (userAnswers[\`\${q.id}_1\`]?.trim() !== '' && userAnswers[\`\${q.id}_1\`] !== undefined)) {
          answeredCount++;
        }
      } else {
        if (userAnswers[q.id] !== undefined) {
          answeredCount++;
        }
      }
    });

    const totalCount = testData.questions.length;
    let title = "Testni yakunlash";
    let message = "Imtihonni yakunlamoqchimisiz? Barcha javoblaringiz saqlanadi.";
    
    if (answeredCount < totalCount) {
      title = "Diqqat: Chala qolgan test!";
      message = \`Siz \${totalCount} ta savoldan faqat \${answeredCount} tasiga javob berdingiz. Chindan ham testni yakunlamoqchimisiz?\`;
    }

    if (await confirm({ title, message })) {
      handleSubmit();
    }
  };`;

const target = `  const handleManualSubmit = async () => {
    if (await confirm({ title: "Diqqat", message: "Imtihonni yakunlamoqchimisiz? Barcha javoblar saqlanadi." })) {
      handleSubmit();
    }
  };`;

if(code.includes(target)) {
  code = code.replace(target, submitLogic);
  fs.writeFileSync('src/pages/student/StudentCertificateTake.tsx', code);
  console.log("Patched Manual Submit logic");
} else {
  console.log("Target not found");
}
