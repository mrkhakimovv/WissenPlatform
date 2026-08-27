import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx-js-style';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Exam } from '../../types';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { computeRaschReport, dedupeBestAttempts, RaschResult, RaschReport } from '../../lib/rasch';
import { X, Download } from 'lucide-react';
import { createPortal } from 'react-dom';
import RaschStatsPanel from '../../components/RaschStatsPanel';

interface Props {
  exam: Exam;
  onClose: () => void;
}

export default function AdminCertificateResults({ exam, onClose }: Props) {
  const [report, setReport] = useState<RaschReport | null>(null);
  const [loading, setLoading] = useState(true);
  const isFrozen = exam.status === 'ended' && !!exam.raschReport;

  useEffect(() => {
    const loadResults = async () => {
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
    };
    loadResults();
  }, [exam]);

  const results: RaschResult[] = report?.results ?? [];

  const exportPDF = () => {
    const numItems = report?.stats?.numItems || 45;
    
    const doc = new jsPDF();
    
    // Attempt to set Times New Roman if available, fallback to times
    doc.setFont("times", "normal");
    
    doc.setFontSize(16);
    doc.text(`${exam.title} - Rasch Natijalari`, 14, 20);
    doc.setFontSize(12);
    doc.text(`${exam.subject} • ${exam.date}`, 14, 28);
    
    const tableData = results.map((r, i) => {
      const xato = numItems - r.correct;
      const foiz = ((r.correct / numItems) * 100).toFixed(1);
      return [
        i + 1,
        r.studentName,
        numItems,
        r.correct,
        xato,
        foiz,
        parseFloat(r.theta.toFixed(3)),
        r.ball,
        r.grade
      ];
    });

    autoTable(doc, {
      startY: 35,
      head: [["O'rin", "F.I.SH.", "Umumiy", "To'g'ri", "Noto'g'ri", "Foiz (%)", "Qobiliyat (θ)", "Ball", "Daraja"]],
      body: tableData,
      theme: 'grid',
      styles: {
        font: 'times',
        fontSize: 10,
        halign: 'center',
        valign: 'middle',
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
        textColor: [0, 0, 0]
      },
      headStyles: {
        fillColor: [234, 234, 234],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        1: { halign: 'left' }
      }
    });

    doc.save(`sertifikat_${exam.title.replace(/\s+/g, '_')}_natijalar.pdf`);
  };

  const exportExcel = () => {
    const numItems = report?.stats?.numItems || 45; // Default to 45 if not found
    
    const data = results.map((r, i) => {
      const xato = numItems - r.correct;
      const foiz = ((r.correct / numItems) * 100).toFixed(1);
      
      return {
        "O'rin": i + 1,
        "F.I.SH.": r.studentName,
        "Umumiy savollar": numItems,
        "To'g'ri": r.correct,
        "Noto'g'ri": xato,
        "Foiz (%)": parseFloat(foiz),
        "Qobiliyat (θ)": parseFloat(r.theta.toFixed(3)),
        "Ball (T-shkala)": r.ball,
        "Daraja": r.grade
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Apply styles to all cells
    const range = XLSX.utils.decode_range(worksheet['!ref'] || "A1:I1");
    
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!worksheet[cellAddress]) continue;
        
        const isHeader = R === 0;
        
        worksheet[cellAddress].s = {
          font: { 
            name: "Times New Roman", 
            sz: 12,
            bold: isHeader
          },
          alignment: { 
            vertical: "center", 
            horizontal: isHeader ? "center" : (C === 1 ? "left" : "center")
          },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        };
        
        if (isHeader) {
           worksheet[cellAddress].s.fill = {
             fgColor: { rgb: "EAEAEA" }
           };
        }
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Natijalar");
    
    worksheet['!cols'] = [
      { wch: 8 },  // O'rin
      { wch: 35 }, // F.I.SH.
      { wch: 18 }, // Umumiy
      { wch: 12 }, // To'g'ri
      { wch: 12 }, // Noto'g'ri
      { wch: 12 }, // Foiz
      { wch: 15 }, // Qobiliyat
      { wch: 18 }, // Ball
      { wch: 12 }, // Daraja
    ];

    XLSX.writeFile(workbook, `sertifikat_${exam.title.replace(/\s+/g, '_')}_natijalar.xlsx`);
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-[#0d0d0d] rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-white/10 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">{exam.title} - Rasch Natijalari</h2>
            <p className="text-white/50 text-sm mt-1">{exam.subject} • {exam.date}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={exportPDF} disabled={results.length === 0} className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50">
              <Download size={16} /> PDF Export
            </button>
            <button onClick={exportExcel} disabled={results.length === 0} className="px-4 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50">
              <Download size={16} /> Excel Export
            </button>
            <button onClick={onClose} className="p-2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex justify-center items-center h-40 text-[#FEC204] font-bold">Yuklanmoqda...</div>
          ) : results.length === 0 ? (
            <div className="text-center text-white/50 py-10 bg-white/5 rounded-xl border border-white/10">
              Hech qanday natija topilmadi (Topshirganlar yo'q yoki test formatiga to'g'ri kelmaydi).
              
            </div>
          ) : (
            <div className="space-y-6">
              <div className={`text-xs font-bold px-3 py-2 rounded-lg border ${isFrozen ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-[#FEC204]/10 text-[#FEC204] border-[#FEC204]/20'}`}>
                {isFrozen
                  ? '✓ Yakunlangan — natijalar muzlatilgan (o\'zgarmaydi).'
                  : '⏳ Jonli hisob (ko\'rib chiqish). Yakuniy natija imtihonni "Yakunlash" tugmasi bilan muzlatiladi.'}
              </div>

              {report && <RaschStatsPanel report={report} />}

              <h3 className="text-white font-bold pt-2">Reyting jadvali</h3>
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-left text-sm text-white/80">
                  <thead className="bg-[#1a1a1a] text-white/50 border-b border-white/10">
                    <tr>
                      <th className="p-4 font-bold">O'rin</th>
                      <th className="p-4 font-bold">F.I.SH.</th>
                      <th className="p-4 font-bold">To'g'ri (55)</th>
                      <th className="p-4 font-bold">Qobiliyat (θ)</th>
                      <th className="p-4 font-bold">Ball (T-shkala)</th>
                      <th className="p-4 font-bold text-center">Daraja</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {results.map((r, i) => (
                      <tr key={r.studentId} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-bold text-white/50">{i + 1}</td>
                        <td className="p-4 font-bold text-white">{r.studentName}</td>
                        <td className="p-4">{r.correct} / 55</td>
                        <td className="p-4 font-mono text-[#FEC204]">{r.theta.toFixed(3)}</td>
                        <td className="p-4 font-black text-white text-lg">{r.ball.toFixed(1)}</td>
                        <td className="p-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-black ${
                            ['A+', 'A', 'B+'].includes(r.grade) ? 'bg-green-500/20 text-green-400' :
                            r.grade === 'NC' ? 'bg-red-500/20 text-red-400' : 'bg-[#FEC204]/20 text-[#FEC204]'
                          }`}>
                            {r.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}