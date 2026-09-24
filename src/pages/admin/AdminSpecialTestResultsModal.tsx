import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { X, Search, Trash2, Award, Copy, Check, ExternalLink, RefreshCw, Sparkles, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirm } from '../../contexts/ConfirmContext';
import * as XLSX from 'xlsx-js-style';

interface Props {
  testId: string;
  testTitle: string;
  onClose: () => void;
}

export default function AdminSpecialTestResultsModal({ testId, testTitle, onClose }: Props) {
  const { confirm } = useConfirm();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchResults = async () => {
    setLoading(true);
    try {
      // 1. Try server API first (authoritative with adminDb)
      try {
        const res = await fetch(`/api/special-test-results/${testId}`);
        if (res.ok) {
          const data = await res.json();
          const list = data.results || [];
          list.sort((a: any, b: any) => (b.ball ?? 0) - (a.ball ?? 0));
          setResults(list);
          return;
        }
      } catch (apiErr) {
        console.warn("API fetch error, trying direct Firestore:", apiErr);
      }

      // 2. Direct Firestore fallback
      const q = query(
        collection(db, 'special_test_results'),
        where('testId', '==', testId)
      );
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a: any, b: any) => (b.ball ?? 0) - (a.ball ?? 0));
      setResults(list);
    } catch (err) {
      console.error("Firestore fetch error:", err);
      toast.error("Natijalarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [testId]);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (await confirm({
      title: "Natijani o'chirish",
      message: `Haqiqatan ham ${name || "o'quvchi"}ning natijasini o'chirmoqchimisiz?`
    })) {
      try {
        setDeletingId(id);
        const res = await fetch(`/api/special-test-results/${id}`, {
          method: 'DELETE'
        });
        
        if (res.ok) {
          setResults(prev => prev.filter(r => r.id !== id));
          toast.success(`${name || "O'quvchi"} natijasi muvaffaqiyatli o'chirildi`);
        } else {
          // Fallback to client SDK delete
          await deleteDoc(doc(db, 'special_test_results', id));
          setResults(prev => prev.filter(r => r.id !== id));
          toast.success(`${name || "O'quvchi"} natijasi muvaffaqiyatli o'chirildi`);
        }
      } catch (e: any) {
        console.error("Delete error:", e);
        try {
          await deleteDoc(doc(db, 'special_test_results', id));
          setResults(prev => prev.filter(r => r.id !== id));
          toast.success(`${name || "O'quvchi"} natijasi o'chirildi`);
        } catch (clientErr) {
          toast.error("Natijani o'chirishda xatolik yuz berdi");
        }
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/maxsus-test/${testId}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    toast.success("Maxsus test havolasi nusxalandi!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleExportExcel = () => {
    if (!results || results.length === 0) {
      toast.error("Eksport qilish uchun hech qanday natijalar mavjud emas");
      return;
    }

    try {
      const TOTAL_QUESTIONS = 55;
      const wb = XLSX.utils.book_new();

      const borderStyle = {
        top: { style: 'thin', color: { rgb: 'D0D5DD' } },
        bottom: { style: 'thin', color: { rgb: 'D0D5DD' } },
        left: { style: 'thin', color: { rgb: 'D0D5DD' } },
        right: { style: 'thin', color: { rgb: 'D0D5DD' } }
      };

      const fontTitle = { name: 'Times New Roman', sz: 14, bold: true, color: { rgb: '000000' } };
      const fontHeader = { name: 'Times New Roman', sz: 11, bold: true, color: { rgb: '000000' } };
      const fontData = { name: 'Times New Roman', sz: 11, color: { rgb: '000000' } };
      const fillHeader = { fgColor: { rgb: 'F2F4F7' } };
      const fillHighlight = { fgColor: { rgb: 'FEF08A' } }; // Gold highlight for Rasch score

      // ==========================================
      // SHEET 1: UMUMIY NATIJALAR (Barcha ma'lumotlar bilan)
      // ==========================================
      const ws1: any = {};

      // Row 1: Title
      ws1['A1'] = {
        t: 's',
        v: `${testTitle || 'Maxsus Test'} - O'quvchilar natijalari (Rasch modeli)`,
        s: { font: fontTitle }
      };

      // Row 2: Subtitle summary stats
      ws1['A2'] = {
        t: 's',
        v: `Topshirganlar: ${results.length} ta | O'rtacha Rasch ball: ${avgBall} | Eng yuqori ball: ${maxBall} | Sana: ${new Date().toLocaleDateString('uz-UZ')}`,
        s: { font: { ...fontData, italic: true } }
      };

      // Row 3: Headers
      const headers1 = [
        '№',
        'F.I.O. (O\'quvchi)',
        'Rasch balli',
        'Daraja',
        'To\'g\'risi',
        'Jami savol',
        'Foiz (%)',
        'Topshirilgan sana va vaqt'
      ];
      for (let q = 1; q <= TOTAL_QUESTIONS; q++) {
        headers1.push(`${q}-savol`);
      }

      headers1.forEach((h, colIdx) => {
        const cell = XLSX.utils.encode_cell({ r: 2, c: colIdx });
        const isHighlight = colIdx === 2 || colIdx === 3;
        ws1[cell] = {
          t: 's',
          v: h,
          s: {
            font: fontHeader,
            fill: isHighlight ? fillHighlight : fillHeader,
            border: borderStyle,
            alignment: { horizontal: 'center', vertical: 'center', wrapText: true }
          }
        };
      });

      // Fill student data rows
      results.forEach((student, idx) => {
        const rowIdx = idx + 3; // row 4 in Excel
        const itemsArr = Array.isArray(student.items) ? student.items : [];
        const score = typeof student.score === 'number'
          ? student.score
          : itemsArr.filter((x: any) => x === 1).length;
        const total = typeof student.total === 'number' && student.total > 0 ? student.total : TOTAL_QUESTIONS;
        const ball = typeof student.ball === 'number' ? student.ball : parseFloat(student.ball || 0) || 0;
        const grade = student.grade || 'NC';
        const percent = `${((score / total) * 100).toFixed(1)}%`;
        const timeStr = student.submittedAt
          ? new Date(student.submittedAt).toLocaleString('uz-UZ', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })
          : '';

        const rowValues: any[] = [
          idx + 1,
          student.studentName || '',
          ball,
          grade,
          score,
          total,
          percent,
          timeStr
        ];

        for (let q = 0; q < TOTAL_QUESTIONS; q++) {
          rowValues.push(itemsArr[q] === 1 ? 1 : 0);
        }

        rowValues.forEach((val, colIdx) => {
          const cell = XLSX.utils.encode_cell({ r: rowIdx, c: colIdx });
          const isNum = typeof val === 'number';
          ws1[cell] = {
            t: isNum ? 'n' : 's',
            v: val,
            s: {
              font: colIdx === 2 ? { ...fontData, bold: true } : fontData,
              border: borderStyle,
              alignment: {
                horizontal: colIdx === 1 ? 'left' : 'center',
                vertical: 'center'
              }
            }
          };
        });
      });

      const lastColLetter1 = XLSX.utils.encode_col(headers1.length - 1);
      ws1['!ref'] = `A1:${lastColLetter1}${results.length + 3}`;
      ws1['!cols'] = [
        { wch: 6 },  // №
        { wch: 28 }, // F.I.O.
        { wch: 14 }, // Rasch balli
        { wch: 10 }, // Daraja
        { wch: 12 }, // To'g'risi
        { wch: 12 }, // Jami
        { wch: 12 }, // Foiz
        { wch: 22 }, // Sana
        ...Array(TOTAL_QUESTIONS).fill({ wch: 8 }) // 1..55
      ];
      ws1['!rows'] = [
        { hpt: 24 }, // Title
        { hpt: 18 }, // Subtitle
        { hpt: 26 }, // Header
        ...Array(results.length).fill({ hpt: 20 })
      ];

      XLSX.utils.book_append_sheet(wb, ws1, 'Umumiy natijalar');

      // ==========================================
      // SHEET 2: RASCH MATRITSASI (1-55 Savollar)
      // ==========================================
      const ws2: any = {};
      const LAST_COL_SHABLON = 'BF'; // Col 57 (0-based)

      // Header row (Row 2 in template)
      ws2['A2'] = { t: 's', v: '№', s: { font: fontHeader, fill: fillHeader, alignment: { horizontal: 'center', vertical: 'center' }, border: borderStyle } };
      ws2['B2'] = { t: 's', v: 'F.I.O.', s: { font: fontHeader, fill: fillHeader, alignment: { horizontal: 'center', vertical: 'center' }, border: borderStyle } };
      ws2['C2'] = { t: 's', v: "To'g'risi", s: { font: fontHeader, fill: fillHeader, alignment: { horizontal: 'center', vertical: 'center' }, border: borderStyle } };

      for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
        const colLetter = XLSX.utils.encode_col(i + 2); // 3 is D
        ws2[`${colLetter}2`] = {
          t: 'n',
          v: i,
          s: { font: fontHeader, fill: fillHeader, alignment: { horizontal: 'center', vertical: 'center' }, border: borderStyle }
        };
      }

      // Extra summary columns in Sheet 2 as well
      const colRasch = XLSX.utils.encode_col(TOTAL_QUESTIONS + 3); // BG
      const colGrade = XLSX.utils.encode_col(TOTAL_QUESTIONS + 4); // BH
      const colDate = XLSX.utils.encode_col(TOTAL_QUESTIONS + 5);  // BI
      ws2[`${colRasch}2`] = { t: 's', v: 'Rasch balli', s: { font: fontHeader, fill: fillHighlight, alignment: { horizontal: 'center', vertical: 'center' }, border: borderStyle } };
      ws2[`${colGrade}2`] = { t: 's', v: 'Daraja', s: { font: fontHeader, fill: fillHighlight, alignment: { horizontal: 'center', vertical: 'center' }, border: borderStyle } };
      ws2[`${colDate}2`] = { t: 's', v: 'Topshirilgan vaqti', s: { font: fontHeader, fill: fillHeader, alignment: { horizontal: 'center', vertical: 'center' }, border: borderStyle } };

      results.forEach((student, idx) => {
        const rowNum = idx + 3;
        const itemsArr = Array.isArray(student.items) ? student.items : [];
        const score = typeof student.score === 'number'
          ? student.score
          : itemsArr.filter((x: any) => x === 1).length;
        const ball = typeof student.ball === 'number' ? student.ball : parseFloat(student.ball || 0) || 0;
        const grade = student.grade || 'NC';
        const timeStr = student.submittedAt
          ? new Date(student.submittedAt).toLocaleString('uz-UZ', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })
          : '';

        ws2[`A${rowNum}`] = { t: 'n', v: idx + 1, s: { font: fontData, alignment: { horizontal: 'center', vertical: 'center' }, border: borderStyle } };
        ws2[`B${rowNum}`] = { t: 's', v: student.studentName || '', s: { font: fontData, alignment: { horizontal: 'left', vertical: 'center' }, border: borderStyle } };
        ws2[`C${rowNum}`] = {
          t: 'n',
          v: score,
          f: `SUM(D${rowNum}:${LAST_COL_SHABLON}${rowNum})`,
          s: { font: fontHeader, alignment: { horizontal: 'center', vertical: 'center' }, border: borderStyle }
        };

        for (let q = 0; q < TOTAL_QUESTIONS; q++) {
          const colLetter = XLSX.utils.encode_col(q + 3);
          ws2[`${colLetter}${rowNum}`] = {
            t: 'n',
            v: itemsArr[q] === 1 ? 1 : 0,
            s: { font: fontData, alignment: { horizontal: 'center', vertical: 'center' }, border: borderStyle }
          };
        }

        ws2[`${colRasch}${rowNum}`] = { t: 'n', v: ball, s: { font: { ...fontData, bold: true }, alignment: { horizontal: 'center', vertical: 'center' }, border: borderStyle } };
        ws2[`${colGrade}${rowNum}`] = { t: 's', v: grade, s: { font: { ...fontData, bold: true }, alignment: { horizontal: 'center', vertical: 'center' }, border: borderStyle } };
        ws2[`${colDate}${rowNum}`] = { t: 's', v: timeStr, s: { font: fontData, alignment: { horizontal: 'center', vertical: 'center' }, border: borderStyle } };
      });

      ws2['!ref'] = `A1:${colDate}${results.length + 2}`;
      ws2['!cols'] = [
        { wch: 6 },
        { wch: 28 },
        { wch: 10 },
        ...Array(TOTAL_QUESTIONS).fill({ wch: 4 }),
        { wch: 14 },
        { wch: 10 },
        { wch: 22 }
      ];
      ws2['!rows'] = [
        { hpt: 15 },
        { hpt: 24 },
        ...Array(results.length).fill({ hpt: 20 })
      ];

      XLSX.utils.book_append_sheet(wb, ws2, '1-55 Savollar matritsasi');

      const safeTitle = (testTitle || 'Maxsus_test').replace(/[/\\?%*:|"<>]/g, '_').trim();
      XLSX.writeFile(wb, `${safeTitle}_natijalari.xlsx`);
      toast.success("Barcha natijalar Excel (.xlsx) fayliga muvaffaqiyatli yuklandi!");
    } catch (err: any) {
      console.error("Excel export error:", err);
      toast.error("Excel faylni yaratishda xatolik yuz berdi: " + (err.message || String(err)));
    }
  };

  const filtered = results.filter(r =>
    (r.studentName || '').toLowerCase().includes(search.toLowerCase())
  );

  const avgBall = results.length > 0
    ? (results.reduce((acc, r) => acc + (r.ball || 0), 0) / results.length).toFixed(1)
    : '0';

  const maxBall = results.length > 0
    ? Math.max(...results.map(r => r.ball || 0)).toFixed(1)
    : '0';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[99999] flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border border-white/10 bg-[#141414] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#FEC204]/20 text-[#FEC204] text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={12} /> Maxsus Test
              </span>
              <h2 className="text-xl font-bold text-white">{testTitle}</h2>
            </div>
            <p className="text-xs text-white/50 mt-1">Havola orqali topshirilgan o'quvchilar natijalari (Rasch modeli)</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportExcel}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95"
              title="Natijalarni Excel (.xlsx) formatida yuklab olish"
            >
              <FileSpreadsheet size={15} />
              <span>Excel (.xlsx) yuklab olish</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="px-3 py-2 bg-[#FEC204] hover:bg-[#FEC204]/90 text-black text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
            >
              {copiedLink ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedLink ? "Nusxalandi!" : "Havolani nusxalash"}</span>
            </button>

            <a
              href={`/maxsus-test/${testId}`}
              target="_blank"
              rel="noreferrer"
              className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors"
              title="Testni ochish"
            >
              <ExternalLink size={16} />
            </a>

            <button
              onClick={fetchResults}
              className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors"
              title="Yangilash"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>

            <button
              onClick={onClose}
              className="p-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 p-4 sm:p-6 bg-white/[0.02] border-b border-white/5 shrink-0">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-center">
            <span className="text-xs text-white/50 block mb-0.5">Topshirganlar</span>
            <span className="text-xl sm:text-2xl font-black text-white">{results.length} ta</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-center">
            <span className="text-xs text-white/50 block mb-0.5">O'rtacha Rasch ball</span>
            <span className="text-xl sm:text-2xl font-black text-[#FEC204]">{avgBall}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-center">
            <span className="text-xs text-white/50 block mb-0.5">Eng yuqori ball</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400">{maxBall}</span>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/10 shrink-0">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="O'quvchi ismi bo'yicha qidirish..."
              className="w-full bg-white/5 border border-white/10 focus:border-[#FEC204] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none"
            />
          </div>
        </div>

        {/* Table / List */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {loading ? (
            <div className="text-center py-12 text-[#FEC204] font-medium">Yuklanmoqda...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-white/40">
              {results.length === 0
                ? "Hozircha hech qaysi o'quvchi ushbu testni topshirmagan."
                : "Qidiruv bo'yicha natija topilmadi."}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-3 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-bold text-white/40 w-6 shrink-0">{idx + 1}.</span>
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-sm sm:text-base truncate">
                        {item.studentName}
                      </h4>
                      <p className="text-xs text-white/40">
                        {item.submittedAt ? new Date(item.submittedAt).toLocaleString() : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                    <div className="text-right hidden sm:block">
                      <span className="text-xs text-white/40 block">To'g'ri / Jami</span>
                      <span className="text-sm font-bold text-white/80">
                        {item.score} / {item.total || 55}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-white/40 block">Rasch balli</span>
                      <span className="text-base sm:text-lg font-black text-[#FEC204]">
                        {item.ball}
                      </span>
                    </div>

                    <div className="w-12 text-center">
                      <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white font-bold text-xs">
                        {item.grade || 'NC'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDelete(item.id, item.studentName)}
                      disabled={deletingId === item.id}
                      className="p-2.5 bg-red-500/10 hover:bg-red-500/25 text-red-400 hover:text-red-300 rounded-xl transition-all border border-red-500/20 active:scale-95 disabled:opacity-40 flex items-center justify-center shadow-sm"
                      title="Natijani o'chirish"
                    >
                      {deletingId === item.id ? (
                        <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
