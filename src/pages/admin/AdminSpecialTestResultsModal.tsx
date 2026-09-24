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
      // Direct Firestore
      const q = query(
        collection(db, 'special_test_results'),
        where('testId', '==', testId)
      );
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a: any, b: any) => (b.ball ?? 0) - (a.ball ?? 0));
      setResults(list);
    } catch (err) {
      console.warn("Firestore fetch error, trying API:", err);
      try {
        const res = await fetch(`/api/special-test-results/${testId}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        } else {
          toast.error("Natijalarni yuklab bo'lmadi");
        }
      } catch {
        toast.error("Natijalarni yuklashda xatolik");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [testId]);

  const handleDelete = async (id: string, name: string) => {
    if (await confirm({
      title: "Natijani o'chirish",
      message: `Haqiqatan ham ${name}ning natijasini o'chirmoqchimisiz?`
    })) {
      try {
        await deleteDoc(doc(db, 'special_test_results', id));
        setResults(prev => prev.filter(r => r.id !== id));
        toast.success("Natija o'chirildi");
      } catch (e) {
        toast.error("O'chirishda xatolik");
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
    try {
      const TOTAL_QUESTIONS = 55; // 55 items (D to BF)
      const LAST_COL = 'BF';
      const MIN_ROWS = Math.max(results.length, 25);

      const wb = XLSX.utils.book_new();
      const ws: any = {};

      const borderStyle = {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
      };

      const fontHeader = { name: 'Times New Roman', sz: 11, bold: true };
      const fontData = { name: 'Times New Roman', sz: 11 };

      // Row 2 (Header Row)
      ws['A2'] = {
        t: 's',
        v: '№',
        s: { font: fontHeader, alignment: { horizontal: 'center', vertical: 'center' }, border: borderStyle }
      };
      ws['B2'] = {
        t: 's',
        v: 'F.I.O.',
        s: { font: fontHeader, alignment: { horizontal: 'center', vertical: 'center' }, border: borderStyle }
      };
      ws['C2'] = {
        t: 's',
        v: "To'g'risi",
        s: { font: fontHeader, alignment: { horizontal: 'center', vertical: 'center' }, border: borderStyle }
      };

      // Question columns 1 to 55 (Col D to BF)
      for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
        const colLetter = XLSX.utils.encode_col(i + 2); // 3 is D
        ws[`${colLetter}2`] = {
          t: 'n',
          v: i,
          s: { font: fontHeader, alignment: { horizontal: 'center', vertical: 'center' }, border: borderStyle }
        };
      }

      // Fill student rows
      for (let idx = 0; idx < MIN_ROWS; idx++) {
        const rowNum = idx + 3; // 1-indexed row in Excel
        const student = results[idx];

        // Column A: №
        ws[`A${rowNum}`] = {
          t: 'n',
          v: idx + 1,
          s: { font: fontData, alignment: { horizontal: 'center', vertical: 'center' }, border: borderStyle }
        };

        if (student) {
          // Column B: F.I.O.
          ws[`B${rowNum}`] = {
            t: 's',
            v: student.studentName || '',
            s: { font: fontData, alignment: { horizontal: 'left', vertical: 'center' }, border: borderStyle }
          };

          const itemsArr = Array.isArray(student.items) ? student.items : [];
          const correctCount = typeof student.score === 'number'
            ? student.score
            : itemsArr.filter((x: any) => x === 1).length;

          // Column C: To'g'risi (Formula: SUM(D{row}:BF{row}))
          ws[`C${rowNum}`] = {
            t: 'n',
            v: correctCount,
            f: `SUM(D${rowNum}:${LAST_COL}${rowNum})`,
            s: { font: fontHeader, alignment: { horizontal: 'center', vertical: 'center' }, border: borderStyle }
          };

          // Question columns D to BF: 1 if correct, 0 if incorrect
          for (let q = 0; q < TOTAL_QUESTIONS; q++) {
            const colLetter = XLSX.utils.encode_col(q + 3);
            const val = itemsArr[q] === 1 ? 1 : 0;
            ws[`${colLetter}${rowNum}`] = {
              t: 'n',
              v: val,
              s: { font: fontData, alignment: { horizontal: 'center', vertical: 'center' }, border: borderStyle }
            };
          }
        } else {
          // Empty template row (as in sample screenshot rows 4 to 25)
          ws[`B${rowNum}`] = {
            t: 's',
            v: '',
            s: { font: fontData, alignment: { horizontal: 'left', vertical: 'center' }, border: borderStyle }
          };

          ws[`C${rowNum}`] = {
            t: 'n',
            v: 0,
            f: `SUM(D${rowNum}:${LAST_COL}${rowNum})`,
            s: { font: fontHeader, alignment: { horizontal: 'center', vertical: 'center' }, border: borderStyle }
          };

          for (let q = 0; q < TOTAL_QUESTIONS; q++) {
            const colLetter = XLSX.utils.encode_col(q + 3);
            ws[`${colLetter}${rowNum}`] = {
              t: 's',
              v: '',
              s: { font: fontData, alignment: { horizontal: 'center', vertical: 'center' }, border: borderStyle }
            };
          }
        }
      }

      const totalRows = MIN_ROWS + 2;
      ws['!ref'] = `A1:${LAST_COL}${totalRows}`;

      // Column widths
      const colWidths = [
        { wch: 6 },  // A: №
        { wch: 32 }, // B: F.I.O.
        { wch: 10 }, // C: To'g'risi
        ...Array(TOTAL_QUESTIONS).fill({ wch: 4 }) // D to BF: 1..55
      ];
      ws['!cols'] = colWidths;

      // Row heights
      const rowHeights = [
        { hpt: 15 }, // Row 1
        { hpt: 26 }, // Row 2 (Header)
        ...Array(MIN_ROWS).fill({ hpt: 20 }) // Data rows
      ];
      ws['!rows'] = rowHeights;

      XLSX.utils.book_append_sheet(wb, ws, 'Natijalar');

      const safeTitle = (testTitle || 'Maxsus_test').replace(/[/\\?%*:|"<>]/g, '_').trim();
      XLSX.writeFile(wb, `${safeTitle}_natijalari.xlsx`);
      toast.success("Excel (.xlsx) fayli muvaffaqiyatli yuklandi!");
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
                      className="p-2 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded-lg transition-colors"
                      title="O'chirish"
                    >
                      <Trash2 size={16} />
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
