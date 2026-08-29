const fs = require('fs');

// 1. Revert AdminMilliySertifikat.tsx so we don't save synthetic to DB
let adminCode = fs.readFileSync('src/pages/admin/AdminMilliySertifikat.tsx', 'utf8');
adminCode = adminCode.replace(
  `report = computeRaschWithReference(matrix, synthetic, true); // True = sintetiklarni ham qaytarish`,
  `report = computeRaschWithReference(matrix, synthetic); // DB ga faqat real o'quvchilar saqlanadi`
);
fs.writeFileSync('src/pages/admin/AdminMilliySertifikat.tsx', adminCode);


// 2. Update AdminCertificateResults.tsx to generate synthetic on the fly
let resultsCode = fs.readFileSync('src/pages/admin/AdminCertificateResults.tsx', 'utf8');

// We need to import generateSyntheticMatrix and itemDifficultiesFromMatrix (or we can just use the itemLogit directly)
const importTarget = `import { computeRaschReport, dedupeBestAttempts, RaschResult, RaschReport } from '../../lib/rasch';`;
const importReplacement = `import { computeRaschReport, dedupeBestAttempts, RaschResult, RaschReport, computeRaschWithReference } from '../../lib/rasch';\nimport { generateSyntheticMatrix, itemDifficultiesFromMatrix, seedFromString } from '../../lib/synthetic';`;

if(resultsCode.includes(importTarget)) {
    resultsCode = resultsCode.replace(importTarget, importReplacement);
}

// Now replace the loadResults logic
const logicTarget = `        if (isFrozen) {
          setReport(exam.raschReport as RaschReport);
          return;
        }`;

// If it's frozen, we STILL want to show synthetic if requested. 
// But wait, it's easier to just fetch all docs and compute on the fly ALWAYS in this modal? 
// No, fetching all docs is slow.
// If frozen, we have `exam.raschReport`. We can just generate synthetic students based on `itemLogit`. 
// Wait, `calculateRasch` needs the 0/1 matrix. 

const logicReplacement = `        if (isFrozen) {
          const frozenReport = exam.raschReport as RaschReport;
          // Agar tayanch o'quvchilar bo'lsa, ularni on-the-fly yaratamiz (DB ga sig'masligi uchun saqlanmagan)
          const synCount = exam.syntheticEnabled ? Math.max(0, Math.floor(exam.syntheticCount || 0)) : 0;
          if (synCount > 0 && frozenReport.stats.itemLogit) {
             const synthetic = generateSyntheticMatrix(frozenReport.stats.itemLogit, {
               count: synCount,
               seed: seedFromString(exam.id),
             });
             // Bizga matrix kerak... lekns frozen holatda real o'quvchilarning faqat javoblari kerak.
             // Bizda frozenReport.results bor. Lekin u yerda items array yo'q.
             // Demak on-the-fly uchun bizga baribir raw docs kerak.
          }
          // Yoki oddiygina: har doim on-the-fly qayta hisoblaymiz, hatto frozen bo'lsa ham! 
          // Chunki results modalida bizga hamma tayanch o'quvchilar kerak.
        }
        
        // Aslida har doim raw docslarni olib compute qilganimiz yaxshi, modal ichida tayanch o'quvchilarni ko'rish uchun.
`;

// Let's just change the entire loadResults function
const fullLogicTarget = `    const loadResults = async () => {
      try {
        if (isFrozen) {
          setReport(exam.raschReport as RaschReport);
          return;
        }
        const snap = await getDocs(query(collection(db, 'exam_results'), where('examId', '==', exam.id)));
        const all = snap.docs.map(d => d.data());
        const bestPerStudent = dedupeBestAttempts(
          all.filter(r => Array.isArray(r.raschItems) && r.raschItems.length > 0)
        );
        
        if (bestPerStudent.length > 0) {
          // Use the number of items from the first valid result to filter others
          const numItems = bestPerStudent[0].raschItems.length;
          const validResults = bestPerStudent.filter(r => r.raschItems.length === numItems);

          const matrix = validResults.map(r => ({
            studentId: r.studentId,
            studentName: r.studentName,
            items: r.raschItems
          }));

          if (matrix.length > 0) {
            setReport(computeRaschReport(matrix));
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };`;

const fullLogicReplacement = `    const loadResults = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'exam_results'), where('examId', '==', exam.id)));
        const all = snap.docs.map(d => d.data());
        const bestPerStudent = dedupeBestAttempts(
          all.filter(r => Array.isArray(r.raschItems) && r.raschItems.length > 0)
        );
        
        if (bestPerStudent.length > 0) {
          // Use the number of items from the first valid result to filter others
          const numItems = bestPerStudent[0].raschItems.length;
          const validResults = bestPerStudent.filter(r => r.raschItems.length === numItems);

          const matrix = validResults.map(r => ({
            studentId: r.studentId,
            studentName: r.studentName,
            items: r.raschItems
          }));

          if (matrix.length > 0) {
            const synCount = exam.syntheticEnabled ? Math.max(0, Math.floor(exam.syntheticCount || 0)) : 0;
            if (synCount > 0) {
              const difficulties = itemDifficultiesFromMatrix(matrix);
              const synthetic = generateSyntheticMatrix(difficulties, {
                count: synCount,
                seed: seedFromString(exam.id),
              });
              // Modal uchun syntheticlarni ham qaytaramiz (true parametr)
              setReport(computeRaschWithReference(matrix, synthetic, true));
            } else {
              setReport(computeRaschReport(matrix));
            }
          }
        } else if (isFrozen) {
           // Fallback to frozen if no docs found for some reason
           setReport(exam.raschReport as RaschReport);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };`;

if(resultsCode.includes(fullLogicTarget)) {
    resultsCode = resultsCode.replace(fullLogicTarget, fullLogicReplacement);
    fs.writeFileSync('src/pages/admin/AdminCertificateResults.tsx', resultsCode);
    console.log("Updated loadResults logic in AdminCertificateResults.tsx");
} else {
    console.log("Could not find fullLogicTarget");
}

