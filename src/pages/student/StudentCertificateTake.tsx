import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Exam, TestData } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { doc, getDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { AlertTriangle, Clock, Send, ChevronLeft, ChevronRight , CheckCircle2} from 'lucide-react';
import Latex from 'react-latex-next';
import { useConfirm } from '../../contexts/ConfirmContext';
import MathAnswerField, { answersEqual } from '../../components/MathAnswerField';

interface Props {
  exam: Exam;
  onClose: () => void;
}

export default function StudentCertificateTake({ exam, onClose }: Props) {
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const [testData, setTestData] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(exam.duration * 60);
  const [activeQ, setActiveQ] = useState(0);
  
  // userAnswers format: 
  // for choice: { 'q1': 2 }
  // for open: { 'q36_0': '42', 'q36_1': '5' }
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultSummary, setResultSummary] = useState<{ score: number, total: number } | null>(null);
  const handleSelectOption = (qId, optIndex) => {
    setUserAnswers(prev => ({ ...prev, [qId]: optIndex }));
  };

  const handleOpenAnswer = (qId, part, latex) => {
    setUserAnswers(prev => ({ ...prev, [qId + '_' + part]: latex }));
  };


  useEffect(() => {
    // block exit
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    const fetchTest = async () => {
      if (!exam.testId) return;
      try {
        const d = await getDoc(doc(db, 'tests', exam.testId));
        if (d.exists()) {
          setTestData(d.data() as TestData);
        } else {
          toast.error("Test topilmadi");
          onClose();
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        toast.error("Testni yuklashda xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [exam.testId, onClose]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      if (!isSubmitting) {
        handleSubmit();
      }
      return;
    }
    const t = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(t);
  }, [timeLeft, isSubmitting]);

  const handleSubmit = async () => {
    console.log("SUBMIT START");
    if (!testData || !user) return;
    setIsSubmitting(true);
    
    try {
      const q = query(collection(db, 'exam_results'), where('examId', '==', exam.id), where('studentId', '==', user.id));
      const existing = await getDocs(q);
      const attemptNum = existing.size + 1;
      
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
      
      const timeSpent = (exam.duration * 60) - timeLeft;
      
      const totalQuestionsComputed = raschItems.length;
      await addDoc(collection(db, 'exam_results'), {
        examId: exam.id,
        studentId: user.id,
        studentName: user.fullName,
        score: totalCorrect,
        total: totalQuestionsComputed,
        raschItems,
        timeSpent,
        attempts: attemptNum,
        submittedAt: new Date().toISOString()
      });
      
      toast.success("Imtihon topshirildi!");
      setResultSummary({ score: totalCorrect, total: totalQuestionsComputed });
    } catch (e: any) {
      console.error("SUBMIT ERROR:", e);
      toast.error("Xatolik yuz berdi: " + (e.message || String(e)));
      setIsSubmitting(false);
    }
  };

  const handleManualSubmit = async () => {
    let answeredCount = 0;
    testData.questions.forEach((q) => {
      if (q.isOpenEnded) {
        if ((userAnswers[`${q.id}_0`]?.trim() !== '' && userAnswers[`${q.id}_0`] !== undefined) ||
            (userAnswers[`${q.id}_1`]?.trim() !== '' && userAnswers[`${q.id}_1`] !== undefined)) {
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
      message = `Siz ${totalCount} ta savoldan faqat ${answeredCount} tasiga javob berdingiz. Chindan ham testni yakunlamoqchimisiz?`;
    }

    if (await confirm({ title, message })) {
      handleSubmit();
    }
  };

  if (loading) {
    return <div className="fixed inset-0 bg-[#0a0a0a] z-[9999] flex items-center justify-center text-[#FEC204] font-bold">Yuklanmoqda...</div>;
  }

  if (!testData) return null;

  const currentQ = testData.questions[activeQ];
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  if (resultSummary) {
    return createPortal(
      <div className="fixed inset-0 bg-[#0d0d0d] z-[9999] flex items-center justify-center animate-in fade-in duration-300">
        <div className="glass-panel p-8 max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={40} className="text-green-500" />
          </div>
          <h2 className="text-3xl font-black text-white">Test Yakunlandi!</h2>
          <p className="text-white/60">Sizning natijangiz muvaffaqiyatli saqlandi va Rasch modeli asosida hisoblanish uchun adminga yuborildi.</p>
          
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 my-6">
            <p className="text-sm text-white/50 mb-2 uppercase font-bold tracking-wider">To'g'ri javoblar</p>
            <p className="text-5xl font-black text-[#FEC204]">{resultSummary.score} <span className="text-xl text-white/40">/ {resultSummary.total}</span></p>
          </div>
          
          <button onClick={onClose} className="w-full bg-[#FEC204] text-black py-4 rounded-xl font-bold text-lg hover:bg-[#FEC204]/90 transition-colors">
            Asosiy menuga qaytish
          </button>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="fixed inset-0 bg-[#0d0d0d] z-[9999] flex flex-col animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="bg-[#1a1a1a] p-4 flex items-center justify-between border-b border-white/10 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-white">{exam.title}</h2>
          <p className="text-white/50 text-sm">Milliy Sertifikat (Rasch) • {testData.questions.length} savol</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#FEC204]/20 text-[#FEC204] px-4 py-2 rounded-xl font-bold border border-[#FEC204]/30">
            <Clock size={20} />
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
          <button onClick={handleManualSubmit} disabled={isSubmitting} className="bg-[#FEC204] text-black px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:opacity-90">
            {isSubmitting ? 'Yuborilmoqda...' : <><Send size={18} /> Yakunlash</>}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Area */}
        <div className="flex-1 flex flex-col p-6 overflow-y-auto custom-scrollbar" id="questions-container">
          <div className="max-w-4xl w-full mx-auto space-y-12">
            {testData.questions.map((q: any, qIndex: number) => (
              <div key={q.id} id={`question-${qIndex}`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">Savol {qIndex + 1}</h3>
                  {q.isOpenEnded && <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded font-bold text-sm">Ochiq savol (2 qism)</span>}
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-white/10">
                  <div className="text-lg text-white mb-6 whitespace-pre-wrap">
                    <Latex>{q.text || ''}</Latex>
                  </div>
                  {q.imageUrl && (
                    <img src={q.imageUrl} alt="Savol" className="max-h-64 rounded-xl border border-white/10 mb-6" />
                  )}

                  {q.isOpenEnded ? (
                    <div className="space-y-6">
                      {/* Part a */}
                      <div>
                        <label className="text-white/70 font-bold mb-2 block">a) javobingizni kiriting:</label>
                        <MathAnswerField
                          value={userAnswers[`${q.id}_0`] || ''}
                          onChange={(latex) => handleOpenAnswer(q.id, 0, latex)}
                          placeholder="a) javob (matematik ham mumkin)"
                        />
                      </div>
                      {/* Part b */}
                      <div>
                        <label className="text-white/70 font-bold mb-2 block">b) javobingizni kiriting:</label>
                        <MathAnswerField
                          value={userAnswers[`${q.id}_1`] || ''}
                          onChange={(latex) => handleOpenAnswer(q.id, 1, latex)}
                          placeholder="b) javob (matematik ham mumkin)"
                        />
                      </div>
                    </div>
                  ) : (
                    (() => {
                      const hasOptionText = q.options.some((opt: string) => opt && opt.trim() !== '');
                      return hasOptionText ? (
                        <div className="space-y-3">
                          {q.options.map((opt: string, optIndex: number) => {
                            const isSelected = userAnswers[q.id] === optIndex;
                            return (
                              <button
                                key={optIndex}
                                onClick={() => handleSelectOption(q.id, optIndex)}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${isSelected ? 'border-[#FEC204] bg-[#FEC204]/10' : 'border-white/10 hover:border-white/30 bg-[#1a1a1a]'}`}
                              >
                                <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-sm font-bold mt-0.5 ${isSelected ? 'bg-[#FEC204] text-black' : 'bg-white/10 text-white/50'}`}>
                                  {ALPHABET[optIndex]}
                                </div>
                                <div className={`flex-1 ${isSelected ? 'text-white' : 'text-white/70'}`}>
                                  <Latex>{opt}</Latex>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-4">
                          {q.options.map((_: any, optIndex: number) => {
                            const isSelected = userAnswers[q.id] === optIndex;
                            return (
                              <button
                                key={optIndex}
                                onClick={() => handleSelectOption(q.id, optIndex)}
                                className={`w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-full font-bold transition-all flex items-center justify-center text-lg ${
                                  isSelected
                                    ? 'bg-[#FEC204] text-black shadow-[0_0_15px_rgba(254,194,4,0.4)]'
                                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20'
                                }`}
                              >
                                {ALPHABET[optIndex]}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })()
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Nav */}
        <div className="w-80 bg-[#121212] border-l border-white/10 p-4 flex flex-col h-full">
          <h3 className="font-bold text-white/50 mb-4">Savollar ({testData.questions.length})</h3>
          <div className="grid grid-cols-5 gap-2 overflow-y-auto custom-scrollbar content-start">
            {testData.questions.map((q: any, i: number) => {
              let isAnswered = false;
              if (q.isOpenEnded) {
                isAnswered = (userAnswers[`${q.id}_0`]?.trim() !== '' && userAnswers[`${q.id}_0`] !== undefined) ||
                             (userAnswers[`${q.id}_1`]?.trim() !== '' && userAnswers[`${q.id}_1`] !== undefined);
              } else {
                isAnswered = userAnswers[q.id] !== undefined;
              }
              
              return (
                <button
                  key={q.id}
                  onClick={() => {
                    const el = document.getElementById(`question-${i}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className={`aspect-square flex items-center justify-center rounded-lg text-sm font-bold border-2 transition-all ${
                    isAnswered 
                      ? 'border-[#FEC204] bg-[#FEC204]/20 text-[#FEC204]' 
                      : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10'
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
