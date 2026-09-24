import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { 
  X, Search, Trash2, Award, Copy, Check, ExternalLink, RefreshCw, 
  Sparkles, FileSpreadsheet, Bot, Globe, Info, Send, Smartphone, 
  Monitor, AlertTriangle, ShieldCheck, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirm } from '../../contexts/ConfirmContext';
import * as XLSX from 'xlsx-js-style';
import { computeRaschWithReference } from '../../lib/rasch';
import { itemDifficultiesFromMatrix, generateSyntheticMatrix, seedFromString } from '../../lib/synthetic';

interface Props {
  testId: string;
  testTitle: string;
  onClose: () => void;
}

export default function AdminSpecialTestResultsModal({ testId, testTitle, onClose }: Props) {
  const { confirm } = useConfirm();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [search, setSearch] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeCardStudentId, setActiveCardStudentId] = useState<string | null>(null);
  const [platformFilter, setPlatformFilter] = useState<'all' | 'tg_bot' | 'web'>('all');

  // Close card when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.student-info-card-container')) {
        setActiveCardStudentId(null);
      }
    };
    if (activeCardStudentId) {
      window.addEventListener('click', handleOutsideClick);
      return () => {
        window.removeEventListener('click', handleOutsideClick);
      };
    }
  }, [activeCardStudentId]);

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

  // Recalculate Rasch model for all participants
  const handleRecalculateRasch = async () => {
    if (results.length === 0) {
      toast.error("Hisoblash uchun topshirilgan natijalar yo'q");
      return;
    }

    setIsRecalculating(true);
    const toastId = toast.loading("Rasch modeli bo'yicha barcha natijalar tekshirilmoqda...");

    try {
      // 1. Try server API recalculate
      const res = await fetch(`/api/recalculate-special-test/${testId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.results) {
          setResults(data.results);
          toast.success("Rasch modeli bo'yicha ballar va darajalar muvaffaqiyatli shakllantirildi!", { id: toastId });
          return;
        }
      }

      // 2. Fallback client-side calculation
      const totalItems = results[0]?.items?.length || 55;
      const matrix = results
        .filter((d: any) => Array.isArray(d.items) && d.items.length === totalItems)
        .map((d: any) => ({
          studentId: d.id,
          studentName: d.studentName || "O'quvchi",
          items: d.items
        }));

      if (matrix.length > 0) {
        const difficulties = itemDifficultiesFromMatrix(matrix);
        const synthetic = generateSyntheticMatrix(difficulties, {
          count: 10000,
          seed: seedFromString(testId)
        });

        const report = computeRaschWithReference(matrix, synthetic);
        const batch = writeBatch(db);

        for (const r of report.results) {
          const docRef = doc(db, 'special_test_results', r.studentId);
          batch.update(docRef, {
            ball: r.ball,
            grade: r.grade,
            theta: r.theta,
            score: r.correct,
            rank: r.rank || 0,
            percentile: r.percentile || 0
          });
        }
        await batch.commit();

        // Update local state
        const updatedList = results.map(item => {
          const rep = report.results.find(r => r.studentId === item.id);
          if (rep) {
            return {
              ...item,
              ball: rep.ball,
              grade: rep.grade,
              theta: rep.theta,
              score: rep.correct,
              rank: rep.rank,
              percentile: rep.percentile
            };
          }
          return item;
        });
        updatedList.sort((a, b) => (b.ball ?? 0) - (a.ball ?? 0));
        setResults(updatedList);
        toast.success("Rasch modeli bo'yicha ballar va darajalar muvaffaqiyatli shakllantirildi!", { id: toastId });
      }
    } catch (err: any) {
      console.error("Recalculate error:", err);
      toast.error("Rasch hisoblashda xatolik: " + (err.message || String(err)), { id: toastId });
    } finally {
      setIsRecalculating(false);
    }
  };

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
      const fillTg = { fgColor: { rgb: 'E0F2FE' } }; // Light blue for TG

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
        v: `Topshirganlar: ${results.length} ta (Telegram: ${tgCount} ta, Veb: ${webCount} ta) | O'rtacha Rasch ball: ${avgBall} | Eng yuqori ball: ${maxBall} | Sana: ${new Date().toLocaleDateString('uz-UZ')}`,
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
        'Manba (Platforma)',
        'Telegram Akkaunt',
        'Telegram Username',
        'Telegram ID',
        'Qurilma / Brauzer',
        'IP Manzil',
        'Topshirilgan sana va vaqt'
      ];
      for (let q = 1; q <= TOTAL_QUESTIONS; q++) {
        headers1.push(`${q}-savol`);
      }

      headers1.forEach((h, colIdx) => {
        const cell = XLSX.utils.encode_cell({ r: 2, c: colIdx });
        const isHighlight = colIdx === 2 || colIdx === 3;
        const isTgCol = colIdx >= 7 && colIdx <= 10;
        ws1[cell] = {
          t: 's',
          v: h,
          s: {
            font: fontHeader,
            fill: isHighlight ? fillHighlight : isTgCol ? fillTg : fillHeader,
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
        const isTg = student.platform === 'tg_bot' || Boolean(student.telegramUserId || student.tgChatId);
        const platformText = isTg ? 'Telegram Bot (Mini App)' : 'Veb-brauzer';
        const tgAccount = student.tgAccountName || (student.tgUser?.first_name ? `${student.tgUser.first_name} ${student.tgUser.last_name || ''}`.trim() : '');
        const tgUser = student.tgUsername || (student.tgUser?.username ? `@${student.tgUser.username}` : '');
        const tgId = student.telegramUserId || student.tgChatId || '';
        const deviceInfo = student.browserInfo?.browser 
          ? `${student.browserInfo.browser} (${student.browserInfo.os || ''})` 
          : student.deviceInfo?.browser || student.userAgent || '';
        const ip = student.ip || '';
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
          platformText,
          tgAccount,
          tgUser,
          tgId,
          deviceInfo,
          ip,
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
                horizontal: colIdx === 1 || colIdx === 8 ? 'left' : 'center',
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
        { wch: 10 }, // Foiz
        { wch: 24 }, // Manba
        { wch: 26 }, // Telegram Akkaunt
        { wch: 22 }, // Telegram Username
        { wch: 18 }, // Telegram ID
        { wch: 30 }, // Qurilma
        { wch: 16 }, // IP
        { wch: 22 }, // Topshirilgan vaqt
        ...Array(TOTAL_QUESTIONS).fill({ wch: 8 })
      ];

      XLSX.utils.book_append_sheet(wb, ws1, 'Umumiy Natijalar');

      // ==========================================
      // SHEET 2: 1-55 SAVOLLAR MATRITSASI
      // ==========================================
      const ws2: any = {};
      ws2['A1'] = {
        t: 's',
        v: `${testTitle || 'Maxsus Test'} - 1-55 Savollar Birlik Matritsasi (1 = To'g'ri, 0 = Noto'g'ri)`,
        s: { font: fontTitle }
      };

      const headers2 = ['№', 'F.I.O. (O\'quvchi)', 'Rasch balli', 'Daraja', 'To\'g\'risi', 'Jami'];
      for (let q = 1; q <= TOTAL_QUESTIONS; q++) {
        headers2.push(`${q}`);
      }

      headers2.forEach((h, colIdx) => {
        const cell = XLSX.utils.encode_cell({ r: 2, c: colIdx });
        ws2[cell] = {
          t: 's',
          v: h,
          s: {
            font: fontHeader,
            fill: fillHeader,
            border: borderStyle,
            alignment: { horizontal: 'center', vertical: 'center' }
          }
        };
      });

      results.forEach((student, idx) => {
        const rowIdx = idx + 3;
        const itemsArr = Array.isArray(student.items) ? student.items : [];
        const score = typeof student.score === 'number'
          ? student.score
          : itemsArr.filter((x: any) => x === 1).length;
        const total = typeof student.total === 'number' && student.total > 0 ? student.total : TOTAL_QUESTIONS;
        const ball = typeof student.ball === 'number' ? student.ball : parseFloat(student.ball || 0) || 0;
        const grade = student.grade || 'NC';

        const rowValues2: any[] = [
          idx + 1,
          student.studentName || '',
          ball,
          grade,
          score,
          total
        ];

        for (let q = 0; q < TOTAL_QUESTIONS; q++) {
          rowValues2.push(itemsArr[q] === 1 ? 1 : 0);
        }

        rowValues2.forEach((val, colIdx) => {
          const cell = XLSX.utils.encode_cell({ r: rowIdx, c: colIdx });
          const isNum = typeof val === 'number';
          const isCorrect = colIdx >= 6 && val === 1;
          const isWrong = colIdx >= 6 && val === 0;

          ws2[cell] = {
            t: isNum ? 'n' : 's',
            v: val,
            s: {
              font: fontData,
              fill: isCorrect ? { fgColor: { rgb: 'DCFCE7' } } : isWrong ? { fgColor: { rgb: 'FEE2E2' } } : undefined,
              border: borderStyle,
              alignment: {
                horizontal: colIdx === 1 ? 'left' : 'center',
                vertical: 'center'
              }
            }
          };
        });
      });

      const lastColLetter2 = XLSX.utils.encode_col(headers2.length - 1);
      ws2['!ref'] = `A1:${lastColLetter2}${results.length + 3}`;
      ws2['!cols'] = [
        { wch: 6 },
        { wch: 28 },
        { wch: 12 },
        { wch: 10 },
        { wch: 10 },
        { wch: 8 },
        ...Array(TOTAL_QUESTIONS).fill({ wch: 5 })
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

  const isStudentTelegram = (item: any) => {
    return item.platform === 'tg_bot' || Boolean(item.telegramUserId || item.tgChatId);
  };

  const totalCount = results.length;
  const tgCount = results.filter(isStudentTelegram).length;
  const webCount = results.filter(r => !isStudentTelegram(r)).length;

  const filtered = results.filter(r => {
    const isTg = isStudentTelegram(r);
    if (platformFilter === 'tg_bot' && !isTg) return false;
    if (platformFilter === 'web' && isTg) return false;

    if (!search.trim()) return true;

    const s = search.toLowerCase();
    const nameMatch = (r.studentName || '').toLowerCase().includes(s);
    const tgAccMatch = (r.tgAccountName || '').toLowerCase().includes(s);
    const tgUserMatch = (r.tgUsername || '').toLowerCase().includes(s);
    const tgIdMatch = String(r.telegramUserId || r.tgChatId || '').includes(s);
    const ipMatch = String(r.ip || '').includes(s);

    return nameMatch || tgAccMatch || tgUserMatch || tgIdMatch || ipMatch;
  });

  const avgBall = results.length > 0
    ? (results.reduce((acc, r) => acc + (parseFloat(r.ball) || 0), 0) / results.length).toFixed(1)
    : '0';

  const maxBall = results.length > 0
    ? Math.max(...results.map(r => parseFloat(r.ball) || 0)).toFixed(1)
    : '0';

  const certifiedCount = results.filter(r => r.grade && r.grade !== 'NC').length;
  const certifiedPct = results.length > 0
    ? Math.round((certifiedCount / results.length) * 100)
    : 0;

  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case 'A+':
        return 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/20';
      case 'A':
        return 'bg-green-500/25 text-green-300 border-green-500/50 shadow-sm shadow-green-500/20';
      case 'B+':
        return 'bg-blue-500/25 text-blue-300 border-blue-500/50 shadow-sm shadow-blue-500/20';
      case 'B':
        return 'bg-cyan-500/25 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/20';
      case 'C+':
        return 'bg-amber-500/25 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/20';
      case 'C':
        return 'bg-orange-500/25 text-orange-300 border-orange-500/50 shadow-sm shadow-orange-500/20';
      default:
        return 'bg-white/10 text-white/50 border-white/15';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[99999] flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border border-white/10 bg-[#141414] shadow-2xl overflow-hidden relative">
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
              onClick={handleRecalculateRasch}
              disabled={isRecalculating || results.length === 0}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-black text-xs font-black rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50"
              title="Barcha o'quvchilar javoblar matritsasi (1-55 birlik) asosida Rasch ballari va darajalarni qayta hisoblash"
            >
              <RefreshCw size={14} className={isRecalculating ? "animate-spin" : ""} />
              <span>{isRecalculating ? "Hisoblanmoqda..." : "Rasch bo'yicha hisoblash"}</span>
            </button>

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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-5 bg-white/[0.02] border-b border-white/5 shrink-0">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
            <span className="text-xs text-white/50 block mb-0.5">Topshirganlar</span>
            <span className="text-lg sm:text-2xl font-black text-white">{results.length} ta</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
            <span className="text-xs text-white/50 block mb-0.5">O'rtacha Rasch ball</span>
            <span className="text-lg sm:text-2xl font-black text-[#FEC204]">{avgBall}</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
            <span className="text-xs text-white/50 block mb-0.5">Eng yuqori ball</span>
            <span className="text-lg sm:text-2xl font-black text-emerald-400">{maxBall}</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
            <span className="text-xs text-white/50 block mb-0.5">Sertifikat olganlar</span>
            <span className="text-lg sm:text-2xl font-black text-cyan-400">
              {certifiedCount} ta <span className="text-xs text-white/50 font-normal">({certifiedPct}%)</span>
            </span>
          </div>
        </div>

        {/* Rasch Model Criteria Info Bar */}
        <div className="px-4 py-2.5 bg-[#FEC204]/5 border-b border-white/10 flex flex-wrap items-center justify-between text-xs text-white/80 gap-2 shrink-0">
          <div className="flex items-center gap-1.5 font-bold text-[#FEC204]">
            <Award size={15} />
            <span>Rasch modeli darajalari:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">A+ ≥70</span>
            <span className="px-2 py-0.5 rounded-md bg-green-500/20 text-green-300 font-bold border border-green-500/30">A ≥65</span>
            <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">B+ ≥60</span>
            <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">B ≥55</span>
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">C+ ≥50</span>
            <span className="px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-300 font-bold border border-orange-500/30">C ≥46</span>
            <span className="px-2 py-0.5 rounded-md bg-zinc-700/40 text-zinc-400 font-bold border border-zinc-600/30">NC &lt;46</span>
          </div>
        </div>

        {/* Search & Platform Filter Tabs */}
        <div className="p-4 border-b border-white/10 shrink-0 space-y-3">
          {/* Platform Tabs */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-white/40 mr-1 font-medium">Manba bo'yicha filter:</span>
            <button
              onClick={() => setPlatformFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                platformFilter === 'all'
                  ? 'bg-white/15 text-white border border-white/20 shadow-sm'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>Barchasi</span>
              <span className="px-1.5 py-0.2 rounded-md bg-white/10 text-[10px]">{totalCount}</span>
            </button>
            <button
              onClick={() => setPlatformFilter('tg_bot')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                platformFilter === 'tg_bot'
                  ? 'bg-[#0088cc]/25 text-[#38bdf8] border border-[#0088cc]/50 shadow-sm shadow-[#0088cc]/20'
                  : 'bg-[#0088cc]/10 text-[#38bdf8]/70 hover:text-[#38bdf8] hover:bg-[#0088cc]/20 border border-[#0088cc]/20'
              }`}
            >
              <Bot size={13} />
              <span>Telegram Bot</span>
              <span className="px-1.5 py-0.2 rounded-md bg-[#0088cc]/20 text-[10px]">{tgCount}</span>
            </button>
            <button
              onClick={() => setPlatformFilter('web')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                platformFilter === 'web'
                  ? 'bg-purple-500/25 text-purple-300 border border-purple-500/50 shadow-sm shadow-purple-500/20'
                  : 'bg-purple-500/10 text-purple-300/70 hover:text-purple-300 hover:bg-purple-500/20 border border-purple-500/20'
              }`}
            >
              <Globe size={13} />
              <span>Veb-brauzer</span>
              <span className="px-1.5 py-0.2 rounded-md bg-purple-500/20 text-[10px]">{webCount}</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="O'quvchi ismi, Telegram username (@...), akkaunt nomi yoki TG ID bo'yicha qidirish..."
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
                : "Tanlangan filter yoki qidiruv bo'yicha natija topilmadi."}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((item, idx) => {
                const isTg = isStudentTelegram(item);
                const isOpen = activeCardStudentId === item.id;
                const tgAccountName = item.tgAccountName || (item.tgUser?.first_name ? `${item.tgUser.first_name} ${item.tgUser.last_name || ''}`.trim() : null);
                const tgUsername = item.tgUsername || (item.tgUser?.username ? `@${item.tgUser.username}` : null);
                const tgId = item.telegramUserId || item.tgChatId;
                const hasNameMismatch = isTg && tgAccountName && item.studentName && 
                  tgAccountName.trim().toLowerCase() !== item.studentName.trim().toLowerCase();

                // If the item is among the last 3 items, position card above so it does not get cut off
                const isNearBottom = idx >= filtered.length - 2 && filtered.length > 3;

                return (
                  <div
                    key={item.id}
                    className="relative p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-3 hover:border-white/20 transition-all hover:bg-white/[0.07]"
                  >
                    {/* Left: Rank, Name, Platform Badge & Info */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-xs font-bold text-white/40 w-6 shrink-0">{idx + 1}.</span>
                      
                      <div className="relative min-w-0 student-info-card-container">
                        {/* Name and Origin Badge - Clicking opens the info card */}
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveCardStudentId(prev => prev === item.id ? null : item.id);
                          }}
                          className="flex items-center gap-2 flex-wrap cursor-pointer group select-none"
                          title="Ma'lumotnomani ochish / yopish uchun bosing"
                        >
                          <h4 className="font-bold text-white text-sm sm:text-base truncate group-hover:text-[#FEC204] transition-colors underline-offset-4 decoration-white/20 group-hover:underline">
                            {item.studentName}
                          </h4>

                          {/* Source Origin Badge */}
                          {isTg ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0088cc]/20 text-[#38bdf8] border border-[#0088cc]/35 shrink-0 shadow-sm shadow-[#0088cc]/10">
                              <Bot size={11} /> Telegram Bot
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/35 shrink-0 shadow-sm shadow-purple-500/10">
                              <Globe size={11} /> Veb-brauzer
                            </span>
                          )}

                          <span className="p-1 rounded-md text-white/30 group-hover:text-[#FEC204] transition-colors">
                            <Info size={13} />
                          </span>
                        </div>

                        {/* Metadata Row: Date, Account preview */}
                        <div className="flex items-center gap-2 flex-wrap text-xs text-white/40 mt-1">
                          <span>{item.submittedAt ? new Date(item.submittedAt).toLocaleString('uz-UZ') : ''}</span>
                          
                          {isTg && (
                            <>
                              <span className="text-white/20">•</span>
                              <span className="text-white/70 truncate max-w-[200px] flex items-center gap-1">
                                Akkaunt: <strong className="text-white font-medium">{tgAccountName || item.studentName}</strong>
                              </span>
                              {tgUsername && (
                                <span className="text-[#38bdf8] font-mono text-[11px] truncate">
                                  {tgUsername}
                                </span>
                              )}
                              {hasNameMismatch && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                                  ⚠️ Ism farq qiladi
                                </span>
                              )}
                            </>
                          )}

                          {!isTg && (
                            <>
                              <span className="text-white/20">•</span>
                              <span className="text-purple-300/80 text-[11px] flex items-center gap-1">
                                <Monitor size={11} /> {item.browserInfo?.browser || item.deviceInfo?.browser || 'Brauzer'}
                                {item.browserInfo?.os ? ` (${item.browserInfo.os})` : ''}
                              </span>
                            </>
                          )}
                        </div>

                        {/* ---------------- CLICK-ACTIVATED FLOATING CARD ---------------- */}
                        {isOpen && (
                          <div 
                            className={`absolute left-0 ${isNearBottom ? 'bottom-full mb-2' : 'top-full mt-2'} z-50 pointer-events-auto animate-in fade-in zoom-in-95 duration-150 shadow-2xl`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {isTg ? (
                              <div className="p-4 rounded-2xl bg-[#0b1329] border border-[#0088cc]/50 shadow-2xl text-left w-80 text-xs backdrop-blur-xl ring-1 ring-white/10">
                                <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-3">
                                  <div className="flex items-center gap-1.5 text-[#38bdf8] font-bold">
                                    <Bot size={16} />
                                    <span>Telegram Bot orqali yuborilgan</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="px-1.5 py-0.5 rounded bg-[#0088cc]/20 text-[#38bdf8] text-[10px] font-mono">TG Mini App</span>
                                    <button
                                      type="button"
                                      onClick={() => setActiveCardStudentId(null)}
                                      className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                                      title="Yopish"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                </div>

                                <div className="space-y-2.5">
                                  <div>
                                    <span className="text-white/40 block text-[10px] uppercase font-bold tracking-wider">Telegram Akkaunt nomi:</span>
                                    <span className="text-white font-bold text-sm block mt-0.5">
                                      {tgAccountName || item.studentName}
                                    </span>
                                  </div>

                                  {hasNameMismatch && (
                                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] leading-tight">
                                      <strong>⚠️ Eslatma:</strong> O'quvchi kiritgan ism «<strong>{item.studentName}</strong>», lekin Telegram akkaunt egasi «<strong>{tgAccountName}</strong>»!
                                    </div>
                                  )}

                                  <div>
                                    <span className="text-white/40 block text-[10px] uppercase font-bold tracking-wider">Telegram Username:</span>
                                    {tgUsername ? (
                                      <a
                                        href={`https://t.me/${tgUsername.replace('@', '')}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[#38bdf8] hover:underline font-mono font-bold flex items-center gap-1 mt-0.5"
                                      >
                                        {tgUsername}
                                        <ExternalLink size={11} />
                                      </a>
                                    ) : (
                                      <span className="text-white/40 italic font-mono text-[11px]">Mavjud emas (username qo'yilmagan)</span>
                                    )}
                                  </div>

                                  <div>
                                    <span className="text-white/40 block text-[10px] uppercase font-bold tracking-wider">Telegram ID:</span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <code className="text-[#FEC204] font-mono font-bold text-xs bg-black/50 px-2 py-0.5 rounded-lg border border-white/10">
                                        {tgId || 'Aniqlanmagan'}
                                      </code>
                                      {tgId && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            navigator.clipboard.writeText(String(tgId));
                                            toast.success("Telegram ID nusxalandi!");
                                          }}
                                          className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white"
                                          title="ID dan nusxa olish"
                                        >
                                          <Copy size={12} />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
                                    <span>Topshirgan vaqti:</span>
                                    <span className="text-white/80 font-mono">{item.submittedAt ? new Date(item.submittedAt).toLocaleTimeString('uz-UZ') : ''}</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="p-4 rounded-2xl bg-[#140c26] border border-purple-500/50 shadow-2xl text-left w-80 text-xs backdrop-blur-xl ring-1 ring-white/10">
                                <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-3">
                                  <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                                    <Globe size={16} />
                                    <span>Veb-brauzer orqali yuborilgan</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-mono">Web Havola</span>
                                    <button
                                      type="button"
                                      onClick={() => setActiveCardStudentId(null)}
                                      className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                                      title="Yopish"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                </div>

                                <div className="space-y-2.5">
                                  <div>
                                    <span className="text-white/40 block text-[10px] uppercase font-bold tracking-wider">Brauzer:</span>
                                    <span className="text-white font-bold text-sm block mt-0.5">
                                      {item.browserInfo?.browser || item.deviceInfo?.browser || 'Google Chrome / Safari'}
                                    </span>
                                  </div>

                                  <div>
                                    <span className="text-white/40 block text-[10px] uppercase font-bold tracking-wider">Operatsion tizim / Qurilma:</span>
                                    <span className="text-white/90 font-medium block mt-0.5">
                                      {item.browserInfo?.os || item.deviceInfo?.os || 'Windows / Android'} 
                                      {' • '}
                                      <span className="text-purple-300">
                                        {item.browserInfo?.deviceType || (item.userAgent?.includes('Mobile') ? 'Mobil telefon' : 'Kompyuter / Desktop')}
                                      </span>
                                    </span>
                                  </div>

                                  {item.ip && (
                                    <div>
                                      <span className="text-white/40 block text-[10px] uppercase font-bold tracking-wider">IP Manzil:</span>
                                      <code className="text-emerald-400 font-mono text-xs bg-black/50 px-2 py-0.5 rounded-lg border border-white/10 inline-block mt-0.5">
                                        {item.ip}
                                      </code>
                                    </div>
                                  )}

                                  {(item.browserInfo?.screen || item.deviceInfo?.screen) && (
                                    <div className="flex items-center justify-between text-[11px]">
                                      <span className="text-white/40">Ekran o'lchami:</span>
                                      <span className="text-white/80 font-mono">{item.browserInfo?.screen || item.deviceInfo?.screen}</span>
                                    </div>
                                  )}

                                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
                                    <span>Topshirgan vaqti:</span>
                                    <span className="text-white/80 font-mono">{item.submittedAt ? new Date(item.submittedAt).toLocaleTimeString('uz-UZ') : ''}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Scores, Grade badge & Delete */}
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
                          {typeof item.ball === 'number' ? item.ball.toFixed(1) : item.ball}
                        </span>
                      </div>

                      <div className="w-14 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-xl text-xs font-black border uppercase tracking-wider ${getGradeBadge(item.grade || 'NC')}`}>
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
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
