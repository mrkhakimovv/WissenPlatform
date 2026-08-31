const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminCertificateResults.tsx', 'utf-8');

// We need to inject useConfirm and a delete function
// Also import doc, deleteDoc, updateDoc if not present

if (!code.includes('useConfirm')) {
  code = code.replace("import { createPortal } from 'react-dom';", "import { createPortal } from 'react-dom';\nimport { useConfirm } from '../../contexts/ConfirmContext';\nimport { doc, deleteDoc } from 'firebase/firestore';");
}

if (!code.includes('const { confirm } = useConfirm();')) {
  code = code.replace("const [showOnlyReal, setShowOnlyReal] = useState(false);", "const [showOnlyReal, setShowOnlyReal] = useState(false);\n  const { confirm } = useConfirm();");
}

if (!code.includes('handleDeleteResult')) {
  const deleteFunc = `
  const handleDeleteResult = async (studentId: string, synthetic?: boolean) => {
    if (synthetic) return; // Cannot delete synthetic base students
    if (await confirm("Haqiqatan ham bu o'quvchining natijasini o'chirib yubormoqchimisiz? O'chirilgach natijalar boshqadan hisoblanadi.")) {
      setLoading(true);
      try {
        const snap = await getDocs(query(collection(db, 'exam_results'), where('examId', '==', exam.id), where('studentId', '==', studentId)));
        for (const d of snap.docs) {
          await deleteDoc(doc(db, 'exam_results', d.id));
        }
        
        // Reload and recalculate
        const newSnap = await getDocs(query(collection(db, 'exam_results'), where('examId', '==', exam.id)));
        const all = newSnap.docs.map(d => d.data());
        const bestPerStudent = dedupeBestAttempts(
          all.filter(r => Array.isArray(r.raschItems) && r.raschItems.length > 0)
        );
        
        if (bestPerStudent.length > 0) {
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
              const syntheticData = generateSyntheticMatrix(difficulties, {
                count: synCount,
                seed: seedFromString(exam.id),
              });
              setReport(computeRaschWithReference(matrix, syntheticData, true));
            } else {
              setReport(computeRaschReport(matrix));
            }
          } else {
            setReport(null);
          }
        } else {
          setReport(null);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };
`;
  code = code.replace("const loadResults = async () => {", deleteFunc + "\n\n    const loadResults = async () => {");
}

if (!code.includes('Trash2 size={16}')) {
  // Add another column for actions
  code = code.replace('<th className="p-4 font-bold text-center">Daraja</th>', '<th className="p-4 font-bold text-center">Daraja</th>\n                      <th className="p-4 font-bold text-center">Amallar</th>');
  
  code = code.replace(
    '</span>\n                        </td>\n                      </tr>', 
    '</span>\n                        </td>\n                        <td className="p-4 text-center">\n                          {!r.synthetic && <button onClick={() => handleDeleteResult(r.studentId, r.synthetic)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors" title="Natijani o\'chirish"><Trash2 size={16} /></button>}\n                        </td>\n                      </tr>'
  );
}

if (!code.includes('Trash2')) {
   code = code.replace('import { X, Download, Search } from', 'import { X, Download, Search, Trash2 } from');
}

fs.writeFileSync('src/pages/admin/AdminCertificateResults.tsx', code);
