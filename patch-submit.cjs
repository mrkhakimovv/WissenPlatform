const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentCertificateTake.tsx', 'utf-8');

code = code.replace(
  /const handleSubmit = async \(\) => \{/g,
  `const handleSubmit = async () => {
    console.log("SUBMIT START");`
);

code = code.replace(
  /setIsSubmitting\(true\);/g,
  `setIsSubmitting(true);
    console.log("IS SUBMITTING SET TO TRUE");`
);

code = code.replace(
  /const checkOpen = async/g,
  `console.log("checkOpen defined"); const checkOpen = async`
);

code = code.replace(
  /await checkOpen\(userAnswers/g,
  `console.log("Checking answer for q", q.id); await checkOpen(userAnswers`
);

code = code.replace(
  /await addDoc\(collection/g,
  `console.log("Adding doc to exam_results", { totalCorrect, raschItemsCount: raschItems.length }); await addDoc(collection`
);

code = code.replace(
  /toast\.success\("Imtihon topshirildi!"\);/g,
  `console.log("Submit success"); toast.success("Imtihon topshirildi!");`
);

code = code.replace(
  /catch \(e\) \{/g,
  `catch (e) {
      console.error("SUBMIT ERROR:", e);`
);

fs.writeFileSync('src/pages/student/StudentCertificateTake.tsx', code);
