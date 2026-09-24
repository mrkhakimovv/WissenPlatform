import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TestData } from '../types';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import toast from 'react-hot-toast';
import {
  Award,
  CheckCircle2,
  XCircle,
  Send,
  User,
  ArrowRight,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Share2,
  Check
} from 'lucide-react';
import Latex from 'react-latex-next';
import { useAuth } from '../contexts/AuthContext';
import MathAnswerField, { answersEqual } from '../components/MathAnswerField';
import { computeRaschWithReference, RaschResult } from '../lib/rasch';
import { generateSyntheticMatrix, itemDifficultiesFromMatrix, seedFromString } from '../lib/synthetic';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export default function SpecialTestTake() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [testData, setTestData] = useState<TestData | null>(null);

  // Stages: 'name_input' | 'taking' | 'result'
  const [stage, setStage] = useState<'name_input' | 'taking' | 'result'>('name_input');
  const [studentName, setStudentName] = useState(user?.fullName || '');
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Result state
  const [myResult, setMyResult] = useState<{
    studentName: string;
    score: number;
    total: number;
    ball: number;
    grade: string;
    percentile?: number;
    rank?: number;
    items: number[];
  } | null>(null);

  const [showDetailedAnswers, setShowDetailedAnswers] = useState(false);
  const [isShared, setIsShared] = useState(false);

  // Fetch test details
  useEffect(() => {
    const fetchTest = async () => {
      if (!testId) {
        toast.error("Test identifikatori topilmadi");
        setLoading(false);
        return;
      }

      try {
        // First try direct Firestore
        const docRef = doc(db, 'tests', testId);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          setTestData({ id: snap.id, ...snap.data() } as TestData);
        } else {
          // Fallback to server API
          const res = await fetch(`/api/special-test-full/${testId}`);
          if (res.ok) {
            const data = await res.json();
            setTestData(data);
          } else {
            toast.error("Maxsus test topilmadi");
          }
        }
      } catch (err: any) {
        console.error("Test yuklash xatosi:", err);
        // Fallback to server API
        try {
          const res = await fetch(`/api/special-test-full/${testId}`);
          if (res.ok) {
            const data = await res.json();
            setTestData(data);
          } else {
            toast.error("Testni yuklashda xatolik yuz berdi");
          }
        } catch {
          toast.error("Testni yuklashda xatolik yuz berdi");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [testId]);

  // Set default student name if user changes
  useEffect(() => {
    if (user?.fullName && !studentName) {
      setStudentName(user.fullName);
    }
  }, [user]);

  const handleSelectOption = (qId: string, optIndex: number) => {
    setUserAnswers(prev => ({ ...prev, [qId]: optIndex }));
  };

  const handleOpenAnswer = (qId: string, partIndex: number, val: string) => {
    setUserAnswers(prev => ({ ...prev, [`${qId}_${partIndex}`]: val }));
  };

  const countAnswered = () => {
    if (!testData?.questions) return 0;
    let count = 0;
    testData.questions.forEach((q) => {
      if (q.isOpenEnded) {
        const a0 = userAnswers[`${q.id}_0`];
        const a1 = userAnswers[`${q.id}_1`];
        if ((a0 !== undefined && a0.trim() !== '') || (a1 !== undefined && a1.trim() !== '')) {
          count++;
        }
      } else {
        if (userAnswers[q.id] !== undefined) {
          count++;
        }
      }
    });
    return count;
  };

  const handleStartTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      toast.error("Iltimos, ism va familiyangizni kiriting!");
      return;
    }
    setStage('taking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!testData || !testData.questions) return;
    setIsSubmitting(true);

    try {
      const raschItems: number[] = [];
      let totalCorrect = 0;

      const checkOpen = async (studentVal: string, correctVal: string): Promise<number> => {
        const s = (studentVal || '').trim();
        const c = (correctVal || '').trim();
        if (!s || !c) return 0;
        try {
          return (await answersEqual(s, c)) ? 1 : 0;
        } catch (err) {
          return s.replace(/\s/g, '').toLowerCase() === c.replace(/\s/g, '').toLowerCase() ? 1 : 0;
        }
      };

      for (const q of testData.questions) {
        if (q.isOpenEnded) {
          const isA = await checkOpen(userAnswers[`${q.id}_0`], q.subAnswers?.[0]?.correctAnswerText || '');
          raschItems.push(isA);
          totalCorrect += isA;

          const isB = await checkOpen(userAnswers[`${q.id}_1`], q.subAnswers?.[1]?.correctAnswerText || '');
          raschItems.push(isB);
          totalCorrect += isB;
        } else {
          const ans = userAnswers[q.id];
          const isC = ans === q.correctOptionIndex ? 1 : 0;
          raschItems.push(isC);
          totalCorrect += isC;
        }
      }

      const totalItems = raschItems.length || 55;

      // 1. Fetch previous submissions for this test to build matrix
      let existingCohort: { studentId: string; studentName: string; items: number[] }[] = [];
      try {
        const snap = await getDocs(query(collection(db, 'special_test_results'), where('testId', '==', testData.id)));
        existingCohort = snap.docs.map(d => {
          const data = d.data();
          return {
            studentId: d.id,
            studentName: data.studentName || 'O\'quvchi',
            items: Array.isArray(data.items) ? data.items : []
          };
        }).filter(row => row.items.length === totalItems);
      } catch (e) {
        console.warn("Direct firestore cohort fetch error:", e);
        try {
          const res = await fetch(`/api/special-test-results/${testData.id}`);
          if (res.ok) {
            const data = await res.json();
            existingCohort = (data.results || []).map((r: any) => ({
              studentId: r.id,
              studentName: r.studentName,
              items: r.items
            })).filter((r: any) => Array.isArray(r.items) && r.items.length === totalItems);
          }
        } catch (err2) {
          console.warn("API cohort fetch error:", err2);
        }
      }

      // 2. Add current student to matrix
      const myId = `current_${Date.now()}`;
      const matrix = [
        ...existingCohort,
        {
          studentId: myId,
          studentName: studentName.trim(),
          items: raschItems
        }
      ];

      // 3. Compute Rasch Model using reference synthetic cohort (10,000 reference students)
      const difficulties = itemDifficultiesFromMatrix(matrix);
      const synthetic = generateSyntheticMatrix(difficulties, {
        count: 10000,
        seed: seedFromString(testData.id || 'special_test')
      });
      const report = computeRaschWithReference(matrix, synthetic);

      const computedUser = report.results.find(r => r.studentId === myId) || {
        ball: Math.round((totalCorrect / totalItems) * 75 * 10) / 10,
        grade: totalCorrect >= 45 ? 'A+' : totalCorrect >= 40 ? 'A' : totalCorrect >= 35 ? 'B+' : totalCorrect >= 30 ? 'B' : totalCorrect >= 25 ? 'C+' : totalCorrect >= 20 ? 'C' : 'NC',
        theta: 0,
        percentile: 50,
        rank: 1
      } as RaschResult;

      const submissionPayload = {
        testId: testData.id,
        testTitle: testData.title,
        studentName: studentName.trim(),
        score: totalCorrect,
        total: totalItems,
        ball: computedUser.ball,
        grade: computedUser.grade,
        theta: computedUser.theta,
        percentile: computedUser.percentile ?? 0,
        rank: computedUser.rank ?? 1,
        items: raschItems,
        answers: userAnswers,
        submittedAt: new Date().toISOString()
      };

      // 4. Save to Firestore and server API
      try {
        await addDoc(collection(db, 'special_test_results'), submissionPayload);
      } catch (err) {
        console.warn("Direct save failed, using server API:", err);
      }

      try {
        await fetch('/api/submit-special-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submissionPayload)
        });
      } catch (err) {
        console.warn("API save error:", err);
      }

      setMyResult({
        studentName: studentName.trim(),
        score: totalCorrect,
        total: totalItems,
        ball: computedUser.ball,
        grade: computedUser.grade,
        percentile: computedUser.percentile,
        rank: computedUser.rank,
        items: raschItems
      });

      setStage('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast.success("Test muvaffaqiyatli topshirildi va Rasch modeli asosida baholandi!");
    } catch (err: any) {
      console.error("Submission error:", err);
      toast.error("Xatolik yuz berdi: " + (err.message || String(err)));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShareResult = () => {
    if (!myResult) return;
    const text = `🎯 Milliy Sertifikat Testi Natijasi:\n👤 O'quvchi: ${myResult.studentName}\n📊 Rasch Balli: ${myResult.ball} ball\n🏆 Daraja: ${myResult.grade}\n✅ To'g'ri javoblar: ${myResult.score}/${myResult.total}`;
    navigator.clipboard.writeText(text);
    setIsShared(true);
    toast.success("Natija matni nusxalandi!");
    setTimeout(() => setIsShared(false), 2500);
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
      case 'A': return 'text-green-400 border-green-500/40 bg-green-500/10';
      case 'B+': return 'text-blue-400 border-blue-500/40 bg-blue-500/10';
      case 'B': return 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10';
      case 'C+': return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
      case 'C': return 'text-orange-400 border-orange-500/40 bg-orange-500/10';
      default: return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-30 bg-[#0d0d0d] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#FEC204] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white/60 font-medium">Test yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!testData) {
    return (
      <div className="fixed inset-0 z-30 bg-[#0d0d0d] flex items-center justify-center p-4">
        <div className="glass-panel p-8 max-w-md w-full text-center space-y-4 rounded-2xl border border-white/10">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <XCircle size={36} />
          </div>
          <h2 className="text-2xl font-bold text-white">Test topilmadi</h2>
          <p className="text-white/60 text-sm">
            Havola noto'g'ri bo'lishi yoki test o'qituvchi tomonidan o'chirilgan bo'lishi mumkin.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors"
          >
            Bosh sahifaga qaytish
          </button>
        </div>
      </div>
    );
  }

  // STAGE 1: ENTER NAME & SURNAME
  if (stage === 'name_input') {
    return (
      <div className="fixed inset-0 z-30 overflow-y-auto overscroll-contain bg-[#0d0d0d] flex items-center justify-center p-4 py-8">
        <div className="max-w-lg w-full space-y-6">
          {/* Header Branding */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FEC204]/10 border border-[#FEC204]/30 text-[#FEC204] text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} /> Maxsus Sertifikat Testi
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{testData.title}</h1>
            <p className="text-white/50 text-sm">Milliy Sertifikat • Rasch modeli asosida tekshirish</p>
          </div>

          {/* Form Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-[#161616]/90 shadow-2xl space-y-6">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-xs text-white/50 block">Savollar soni</span>
                <span className="text-lg font-black text-white">45 ta</span>
                <span className="text-[11px] text-[#FEC204] block">(55 birlik)</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-xs text-white/50 block">Baholash tizimi</span>
                <span className="text-lg font-black text-[#FEC204]">Rasch</span>
                <span className="text-[11px] text-white/50 block">A+, A, B+, B, C+, C</span>
              </div>
            </div>

            <form onSubmit={handleStartTest} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-white/80 mb-2">
                  To'liq ism va familiyangiz: <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Masalan: Sardor Aliyev"
                    className="w-full bg-white/5 border border-white/10 focus:border-[#FEC204] rounded-2xl pl-12 pr-4 py-3.5 text-white font-medium placeholder-white/30 focus:outline-none transition-colors"
                  />
                </div>
                <p className="text-[12px] text-white/40 mt-1.5">
                  Ushbu ism-familiya test yakunidagi Rasch sertifikati natijasida qayd etiladi.
                </p>
              </div>

              <button
                type="submit"
                disabled={!studentName.trim()}
                className="w-full bg-[#FEC204] hover:bg-[#FEC204]/90 disabled:opacity-50 text-black py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#FEC204]/20 active:scale-[0.99]"
              >
                <span>Testni boshlash</span>
                <ArrowRight size={20} />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // STAGE 3: RESULT SCREEN (RASCH EVALUATION COMPLETED)
  if (stage === 'result' && myResult) {
    return (
      <div className="fixed inset-0 z-30 overflow-y-auto overscroll-contain bg-[#0a0a0a] text-white p-4 sm:p-6 md:p-10 flex flex-col items-center">
        <div className="max-w-2xl w-full space-y-6 animate-in fade-in zoom-in-95 duration-300 pb-16">
          {/* Main Certificate Card */}
          <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/10 bg-[#161616]/95 text-center relative overflow-hidden shadow-2xl">
            {/* Top decorative glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-[#FEC204]/10 blur-3xl pointer-events-none rounded-full"></div>

            <div className="w-16 h-16 bg-[#FEC204]/20 text-[#FEC204] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#FEC204]/30 shadow-lg">
              <Award size={36} />
            </div>

            <span className="text-xs uppercase tracking-widest text-[#FEC204] font-black">
              Rasch Modeli Asosidagi Natija
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1 mb-1">{testData.title}</h1>
            <p className="text-white/60 text-sm font-medium">
              Ishtirokchi: <span className="text-white font-bold">{myResult.studentName}</span>
            </p>

            {/* Score & Grade Display */}
            <div className="my-8 p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-around gap-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-white/40 font-bold mb-1">Rasch Balli</p>
                <div className="text-5xl sm:text-6xl font-black text-[#FEC204]">
                  {myResult.ball}
                  <span className="text-lg text-white/40 font-normal"> / 75+</span>
                </div>
              </div>

              <div className="h-12 w-px bg-white/10 hidden sm:block"></div>

              <div>
                <p className="text-xs uppercase tracking-wider text-white/40 font-bold mb-1">Daraja</p>
                <div className={`px-6 py-2 rounded-2xl border-2 text-3xl sm:text-4xl font-black ${getGradeColor(myResult.grade)}`}>
                  {myResult.grade}
                </div>
              </div>
            </div>

            {/* Sub Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-xs text-white/50 block mb-1">To'g'ri javoblar</span>
                <span className="text-2xl font-black text-emerald-400">{myResult.score}</span>
                <span className="text-xs text-white/40"> / {myResult.total} birlik</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-xs text-white/50 block mb-1">Xato javoblar</span>
                <span className="text-2xl font-black text-rose-400">{myResult.total - myResult.score}</span>
                <span className="text-xs text-white/40"> / {myResult.total} birlik</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 col-span-2 sm:col-span-1">
                <span className="text-xs text-white/50 block mb-1">Samaradorlik</span>
                <span className="text-2xl font-black text-cyan-400">
                  {Math.round((myResult.score / myResult.total) * 100)}%
                </span>
                <span className="text-xs text-white/40 block">foiz</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleShareResult}
                className="flex-1 py-3.5 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                {isShared ? <Check size={18} className="text-emerald-400" /> : <Share2 size={18} />}
                <span>{isShared ? "Nusxalandi!" : "Natijani ulashish"}</span>
              </button>

              <button
                onClick={() => {
                  setUserAnswers({});
                  setMyResult(null);
                  setStage('taking');
                }}
                className="flex-1 py-3.5 px-6 rounded-xl bg-[#FEC204] hover:bg-[#FEC204]/90 text-black font-bold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw size={18} />
                <span>Qayta ishlash</span>
              </button>
            </div>
          </div>

          {/* Collapsible Question Breakdown */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-[#161616]/90">
            <button
              onClick={() => setShowDetailedAnswers(!showDetailedAnswers)}
              className="w-full flex items-center justify-between font-bold text-white hover:text-[#FEC204] transition-colors"
            >
              <span className="text-base sm:text-lg flex items-center gap-2">
                <Sparkles size={18} className="text-[#FEC204]" /> Savollar bo'yicha to'liq tahlil
              </span>
              {showDetailedAnswers ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {showDetailedAnswers && (
              <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                {testData.questions.map((q, idx) => {
                  if (q.isOpenEnded) {
                    const ansA = userAnswers[`${q.id}_0`] || '-';
                    const correctA = q.subAnswers?.[0]?.correctAnswerText || '';
                    const ansB = userAnswers[`${q.id}_1`] || '-';
                    const correctB = q.subAnswers?.[1]?.correctAnswerText || '';

                    return (
                      <div key={q.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#FEC204]">{idx + 1}-savol (Ochiq savol):</span>
                          <span className="text-xs text-white/40">2 qism</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-xs text-white/50 block font-bold mb-1">a) qism:</span>
                            <div className="text-white/80">
                              Javobingiz: <span className="font-mono text-white font-bold"><Latex>{ansA}</Latex></span>
                            </div>
                            <div className="text-white/50 text-xs mt-1">
                              To'g'ri kalit: <span className="font-mono text-emerald-400 font-bold"><Latex>{correctA}</Latex></span>
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-xs text-white/50 block font-bold mb-1">b) qism:</span>
                            <div className="text-white/80">
                              Javobingiz: <span className="font-mono text-white font-bold"><Latex>{ansB}</Latex></span>
                            </div>
                            <div className="text-white/50 text-xs mt-1">
                              To'g'ri kalit: <span className="font-mono text-emerald-400 font-bold"><Latex>{correctB}</Latex></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  const selected = userAnswers[q.id];
                  const isCorrect = selected === q.correctOptionIndex;

                  return (
                    <div
                      key={q.id}
                      className={`p-3 sm:p-4 rounded-xl border flex items-center justify-between gap-3 ${
                        isCorrect
                          ? 'border-emerald-500/30 bg-emerald-500/5'
                          : selected !== undefined
                          ? 'border-rose-500/30 bg-rose-500/5'
                          : 'border-white/5 bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-white/70 w-8">{idx + 1}.</span>
                        <div className="text-sm">
                          <span className="text-white/50">Tanlangan: </span>
                          <span className={`font-bold ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {selected !== undefined ? ALPHABET[selected] : 'Belgilanmagan'}
                          </span>
                          {!isCorrect && q.correctOptionIndex !== undefined && q.correctOptionIndex >= 0 && (
                            <span className="text-xs text-white/40 ml-2">
                              (To'g'ri: <strong className="text-emerald-400">{ALPHABET[q.correctOptionIndex]}</strong>)
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        {isCorrect ? (
                          <CheckCircle2 size={18} className="text-emerald-400" />
                        ) : (
                          <XCircle size={18} className="text-rose-400" />
                        )}
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

  // STAGE 2: TAKING THE TEST (ANSWER SHEET)
  const answeredCount = countAnswered();
  const totalQuestions = testData.questions?.length || 45;

  return (
    <div className="fixed inset-0 z-30 overflow-y-auto overscroll-contain bg-[#0a0a0a] text-white flex flex-col">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-40 bg-[#141414]/95 backdrop-blur-md border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-white truncate">{testData.title}</h1>
            <p className="text-xs text-white/50 truncate">
              O'quvchi: <span className="text-[#FEC204] font-semibold">{studentName}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white/80">
              <span>Belgilandi:</span>
              <span className="text-[#FEC204]">{answeredCount}</span>
              <span className="text-white/40">/ {totalQuestions}</span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 sm:px-6 sm:py-2.5 bg-[#FEC204] hover:bg-[#FEC204]/90 disabled:opacity-50 text-black text-sm font-black rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-[#FEC204]/10"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Baholanmoqda...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Javoblarni yuborish</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content: Answers Sheet Grid */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        {/* Helper instructions banner */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-white/70">
          <div>
            <strong className="text-white block font-bold mb-0.5">Javoblar varaqasi</strong>
            Savollar uchun to'g'ri javobni tanlang yoki ochiq savollarga javobingizni yozing.
          </div>
          <div className="sm:hidden font-bold text-xs text-[#FEC204]">
            Belgilandi: {answeredCount} / {totalQuestions}
          </div>
        </div>

        {/* Answer items grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {testData.questions.map((q, i) => (
            <div
              key={q.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-3 relative ${
                q.isOpenEnded
                  ? (userAnswers[`${q.id}_0`] || userAnswers[`${q.id}_1`])
                    ? 'border-[#FEC204]/40 bg-[#FEC204]/5'
                    : 'border-white/10 bg-white/5'
                  : userAnswers[q.id] !== undefined
                  ? 'border-[#FEC204]/40 bg-[#FEC204]/5'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-white/80 text-base">{i + 1}-savol</span>
                {q.isOpenEnded && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300">
                    Ochiq
                  </span>
                )}
              </div>

              {q.isOpenEnded ? (
                <div className="flex flex-col gap-2.5 w-full">
                  <div className="flex items-center gap-2">
                    <span className="text-[#FEC204] font-bold text-sm">a)</span>
                    <div className="flex-1 min-w-0">
                      <MathAnswerField
                        value={userAnswers[`${q.id}_0`] || ''}
                        onChange={(val) => handleOpenAnswer(q.id, 0, val)}
                        placeholder="a) javob..."
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#FEC204] font-bold text-sm">b)</span>
                    <div className="flex-1 min-w-0">
                      <MathAnswerField
                        value={userAnswers[`${q.id}_1`] || ''}
                        onChange={(val) => handleOpenAnswer(q.id, 1, val)}
                        placeholder="b) javob..."
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-2 w-full py-1">
                  {q.options.map((_, optIndex) => {
                    const isSelected = userAnswers[q.id] === optIndex;
                    return (
                      <button
                        type="button"
                        key={optIndex}
                        onClick={() => handleSelectOption(q.id, optIndex)}
                        className={`w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#FEC204] text-black font-black scale-105 shadow-md shadow-[#FEC204]/30'
                            : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                        }`}
                      >
                        {ALPHABET[optIndex]}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Submit Action */}
        <div className="pt-6 pb-12 flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full max-w-md py-4 px-6 bg-[#FEC204] hover:bg-[#FEC204]/90 disabled:opacity-50 text-black text-lg font-black rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#FEC204]/20 active:scale-[0.99]"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                <span>Natija Rasch modeli bo'yicha hisoblanmoqda...</span>
              </>
            ) : (
              <>
                <Send size={20} />
                <span>Javoblarni yuborish va natijani ko'rish</span>
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
