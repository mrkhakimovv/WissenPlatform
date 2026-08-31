const fs = require('fs');

const bottomPart = fs.readFileSync('src/pages/admin/AdminCertificateResults.tsx', 'utf-8').split('  const exportPDF = async () => {')[1];

const fixedHead = `import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx-js-style';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import autoTable from 'jspdf-autotable';
import { Exam } from '../../types';
import { collection, query, where, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { computeRaschReport, dedupeBestAttempts, RaschResult, RaschReport, computeRaschWithReference } from '../../lib/rasch';
import { generateSyntheticMatrix, itemDifficultiesFromMatrix, seedFromString } from '../../lib/synthetic';
import { X, Download, Search, Trash2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useConfirm } from '../../contexts/ConfirmContext';
import RaschStatsPanel from '../../components/RaschStatsPanel';

interface Props {
  exam: Exam;
  onClose: () => void;
}

export default function AdminCertificateResults({ exam, onClose }: Props) {
  const [report, setReport] = useState<RaschReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyReal, setShowOnlyReal] = useState(false);
  const { confirm } = useConfirm();
  const isFrozen = exam.status === 'ended' && !!exam.raschReport;

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
              const newRep = computeRaschWithReference(matrix, syntheticData, true);
              setReport(newRep);
              await updateDoc(doc(db, "exams", exam.id), { raschReport: computeRaschWithReference(matrix, syntheticData, false) });
            } else {
              const newRep = computeRaschReport(matrix);
              setReport(newRep);
              await updateDoc(doc(db, "exams", exam.id), { raschReport: newRep });
            }
          } else {
            setReport(null);
            await updateDoc(doc(db, "exams", exam.id), { raschReport: null });
          }
        } else {
          setReport(null);
          await updateDoc(doc(db, "exams", exam.id), { raschReport: null });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const loadResults = async () => {
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
    };
    
    loadResults();
  }, [exam]);

  const results: RaschResult[] = report?.results ?? [];

  const filteredResults = results.filter(r => {
    if (showOnlyReal && r.synthetic) return false;
    if (searchQuery && !r.studentName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const exportPDF = async () => {`;

fs.writeFileSync('src/pages/admin/AdminCertificateResults.tsx', fixedHead + bottomPart);
