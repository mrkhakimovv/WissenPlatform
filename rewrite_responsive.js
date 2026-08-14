import fs from 'fs';

const code = `import React, { useState, useEffect } from 'react';
import { TestData, Exam } from '../../types';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { X, CheckCircle, ChevronRight, ChevronLeft, Bookmark, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';
import { createPortal } from 'react-dom';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';

interface Props {
  exam: Exam;
  onClose: () => void;
}

export default function StudentTestTake({ exam, onClose }: Props) {
  const { user } = useAuth();
  const [testData, setTestData] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [marked, setMarked] = useState<Record<number, boolean>>({});
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const handleSubmitRef = React.useRef<any>(null);

  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  });

  useEffect(() => {
    const preventCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      toast.error("Nusxa olish taqiqlangan!");
    };
    
    const preventKeys = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") {
        navigator.clipboard.writeText("");
        toast.error("Skrinshot taqiqlangan!");
      }
      if (e.ctrlKey && (e.key === 'p' || e.key === 's' || e.key === 'c')) {
        e.preventDefault();
      }
    };
    
    const preventContext = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Testni yopmoqchimisiz? Natija avtomatik saqlanadi!";
      return e.returnValue;
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && hasStarted && !submitted) {
        setShowExitConfirm(true);
      }
    };

    const handleKeys = (e: KeyboardEvent) => {
      preventKeys(e);
      if (e.key === 'Escape' && hasStarted && !submitted) {
        setShowExitConfirm(true);
      }
    };

    if (hasStarted && !submitted) {
      document.addEventListener('copy', preventCopy);
      document.addEventListener('keydown', handleKeys);
      document.addEventListener('contextmenu', preventContext);
      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.addEventListener('mozfullscreenchange', handleFullscreenChange);
      document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    }
    
    return () => {
      document.removeEventListener('copy', preventCopy);
      document.removeEventListener('keydown', handleKeys);
      document.removeEventListener('contextmenu', preventContext);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [hasStarted, submitted]);

  const handleStart = async () => {
    try {
      if (containerRef.current) await containerRef.current.requestFullscreen(); else await document.documentElement.requestFullscreen();
    } catch (e) {
      console.warn("Fullscreen request failed", e);
    }
    setHasStarted(true);
  };

  const [timeLeft, setTimeLeft] = useState(exam.duration * 60);

  useEffect(() => {
    const fetchTest = async () => {
      if (!exam.testId) {
        toast.error("Test topilmadi");
        onClose();
        return;
      }
      try {
        const d = await getDoc(doc(db, 'tests', exam.testId));
        if (d.exists()) {
          setTestData({ id: d.id, ...d.data() } as TestData);
        } else {
          toast.error("Test bazada yo'q");
          onClose();
        }
      } catch (err) {
        console.error(err);
        toast.error("Xatolik yuz berdi");
        onClose();
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [exam.testId, onClose]);

  useEffect(() => {
    if (loading || submitted || !hasStarted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, submitted, hasStarted]);

  const handleSubmit = async () => {
    if (!testData) return;
    let s = 0;
    testData.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctOptionIndex) {
        s += 1;
      }
    });
    setScore(s);
    setSubmitted(true);
    
    try {
      await addDoc(collection(db, 'exam_results'), {
        examId: exam.id,
        testId: exam.testId,
        studentId: user?.id,
        studentName: user?.fullName,
        groupId: user?.groupId,
        score: s,
        total: testData.questions.length,
        answers,
        submittedAt: new Date().toISOString()
      });
      toast.success("Natija saqlandi!");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <>{createPortal(
      <div className="fixed inset-0 bg-[#0d0d0d] z-[99999] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#FEC204] border-t-transparent rounded-full animate-spin"></div>

      {showExitConfirm && (
        <div className="fixed inset-0 bg-[#0d0d0d]/90 z-[999999] flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1a1a1a] rounded-[24px] w-full max-w-md p-6 md:p-8 border border-red-500/20 text-center shadow-2xl shadow-red-500/10"
          >
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-5 md:mb-6">
              <AlertTriangle size={28} className="text-red-500 md:w-8 md:h-8" />
            </div>
            <h2 className="text-[20px] md:text-2xl font-bold text-white mb-3 md:mb-4">Testdan chiqmoqchimisiz?</h2>
            <p className="text-[14px] md:text-base text-white/70 mb-6 md:mb-8 leading-relaxed">
              Siz test jarayonidan chiqmoqchisiz. Agar ushbu oynadan chiqib ketsangiz test avtomatik yakunlanadi va joriy belgilangan javoblar hisoblanadi.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => {
                  setShowExitConfirm(false);
                  handleSubmit();
                  if(document.fullscreenElement) document.exitFullscreen().catch(()=>{});
                }}
                className="flex-1 py-3 md:py-4 px-6 rounded-xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 transition-colors"
              >
                Chiqaman
              </button>
              <button 
                onClick={() => {
                  setShowExitConfirm(false);
                  if (!document.fullscreenElement) {
                    if (containerRef.current) containerRef.current.requestFullscreen().catch(()=>{});
                    else document.documentElement.requestFullscreen().catch(()=>{});
                  }
                }}
                className="flex-1 py-3 md:py-4 px-6 rounded-xl bg-[#FEC204] text-black font-bold hover:bg-[#FEC204]/90 transition-colors"
              >
                Davom etaman
              </button>
            </div>
          </motion.div>
        </div>
      )}
      </div>,
      document.body
    )}</>;
  }

  if (!testData) return null;

  if (!hasStarted) {
    return <>{createPortal(
      <div className="fixed inset-0 bg-[#0d0d0d] z-[99999] flex items-center justify-center p-4">
        <div className="bg-[#1a1a1a] rounded-[24px] w-full max-w-lg p-6 md:p-8 flex flex-col items-center text-center border border-white/10">
          <h2 className="text-[20px] md:text-[24px] font-black text-white mb-4">Imtihonga tayyormisiz?</h2>
          <p className="text-[14px] md:text-[16px] text-white/60 mb-6">Test davomida to'liq ekran rejimidan chiqish, nusxa olish yoki skrinshot qilish mumkin emas. Agar oyna yopilsa, test avtomatik yakunlanadi.</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
            <button onClick={onClose} className="flex-1 py-3 md:py-4 rounded-[12px] bg-white/10 text-white font-bold hover:bg-white/20 transition-colors">
              Bekor qilish
            </button>
            <button onClick={handleStart} className="flex-1 py-3 md:py-4 rounded-[12px] bg-[#FEC204] text-black font-bold hover:bg-[#e5ae03] transition-colors shadow-[0_0_20px_rgba(254,194,4,0.3)]">
              Boshlash
            </button>
          </div>
        </div>
      </div>,
      document.body
    )}</>;
  }

  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;

  if (submitted) {
    return <>{createPortal(
      <div className="fixed inset-0 bg-[#0d0d0d] z-[99999] flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-[#1a1a1a] rounded-[24px] w-full max-w-lg p-6 md:p-8 flex flex-col items-center text-center border border-white/10">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-[rgba(254,194,4,0.1)] rounded-full flex items-center justify-center text-[#FEC204] mb-4">
            <CheckCircle size={32} className="md:w-10 md:h-10" />
          </div>
          <h2 className="text-[20px] md:text-[24px] font-black text-white mb-2">Imtihon yakunlandi</h2>
          <p className="text-[14px] md:text-base text-white/60 mb-6">Sizning natijangiz muvaffaqiyatli saqlandi.</p>
          
          <div className="bg-white/5 border border-white/10 rounded-[16px] w-full p-5 md:p-6 mb-8">
            <div className="text-[40px] md:text-[48px] font-black text-[#FEC204] leading-none mb-2">
              {score} <span className="text-[18px] md:text-[20px] text-white/40">/ {testData.questions.length}</span>
            </div>
            <p className="text-[12px] md:text-[14px] font-bold text-white/60 uppercase tracking-widest">To'g'ri javoblar</p>
          </div>
          
          <button onClick={() => { if(document.fullscreenElement) document.exitFullscreen().catch(()=>{}); onClose(); }} className="w-full py-3 md:py-4 rounded-[12px] bg-white/10 text-white font-bold hover:bg-white/20 transition-colors">
            Ortga qaytish
          </button>
        </div>
      </div>,
      document.body
    )}</>;
  }

  const q = testData.questions[currentQuestion];

  return <>{createPortal(
    <div ref={containerRef} className="fixed inset-0 bg-[#0d0d0d] z-[99999] flex flex-col select-none">
      <div className="h-[60px] md:h-[72px] border-b border-white/10 flex items-center justify-between px-4 md:px-6 shrink-0">
        <div className="flex-1 min-w-0 pr-4">
          <h2 className="text-white font-bold text-[14px] md:text-[16px] truncate">{exam.title}</h2>
          <p className="text-white/40 text-[11px] md:text-[12px] truncate">{testData.title}</p>
        </div>
        <div className="flex items-center gap-3 md:gap-6 shrink-0">
          <div className="flex flex-col items-end">
            <span className="text-[10px] md:text-[11px] font-bold text-white/40 uppercase tracking-widest">Qolgan vaqt</span>
            <span className={`text-[16px] md:text-[18px] font-black ${timeLeft < 300 ? 'text-red-400' : 'text-[#FEC204]'}`}>
              {m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}
            </span>
          </div>
          <button onClick={() => setShowExitConfirm(true)} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10">
            <X size={18} className="md:w-[20px] md:h-[20px]" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-8 flex items-start justify-center">
        <div className="w-full max-w-3xl">
          {/* Progress */}
          <div className="flex gap-1 mb-6 md:mb-8 overflow-x-auto pb-2 custom-scrollbar">
            {testData.questions.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                className={`relative w-8 h-8 shrink-0 rounded-md flex items-center justify-center text-[12px] md:text-[13px] font-bold transition-colors ${
                  currentQuestion === idx 
                    ? 'bg-[#FEC204] text-black' 
                    : answers[idx] !== undefined
                      ? 'bg-white/20 text-white'
                      : 'bg-white/5 text-white/40 hover:bg-white/10'
                }`}
              >
                {idx + 1}
                {marked[idx] && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border border-[#0d0d0d]" />
                )}
              </button>
            ))}
          </div>

          <motion.div 
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-5 sm:p-6 md:p-10 rounded-[20px] md:rounded-[24px] relative"
          >
            <button
              onClick={() => setMarked(prev => ({ ...prev, [currentQuestion]: !prev[currentQuestion] }))}
              className={`absolute top-4 right-4 md:top-6 md:right-6 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-colors ${
                marked[currentQuestion] 
                  ? 'bg-[rgba(254,194,4,0.1)] text-[#FEC204]' 
                  : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Bookmark size={18} className={`md:w-[20px] md:h-[20px] ${marked[currentQuestion] ? "fill-current" : ""}`} />
            </button>
            <h3 className="text-[18px] md:text-[20px] font-bold text-white mb-5 md:mb-6 leading-relaxed pr-10 md:pr-12">
              <span className="text-[#FEC204] mr-2">{currentQuestion + 1}.</span>
              <Latex>{q.text}</Latex>
            </h3>
            
            {q.imageUrl && (
              <img src={q.imageUrl} alt="Savol rasmi" className="max-w-full h-auto max-h-[300px] object-contain rounded-[14px] md:rounded-xl mb-6 border border-white/10" />
            )}

            <div className="space-y-2 md:space-y-3">
              {q.options.map((opt, oIdx) => (
                <button
                  key={oIdx}
                  onClick={() => {
                    setAnswers(prev => ({ ...prev, [currentQuestion]: oIdx }));
                  }}
                  className={`w-full text-left p-3 md:p-4 rounded-[14px] md:rounded-xl border transition-all ${
                    answers[currentQuestion] === oIdx
                      ? 'bg-[rgba(254,194,4,0.1)] border-[#FEC204] text-white'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 md:w-7 md:h-7 rounded border flex items-center justify-center shrink-0 mt-0 md:mt-0 text-[12px] md:text-[13px] font-bold ${
                      answers[currentQuestion] === oIdx ? 'border-[#FEC204] bg-[#FEC204] text-black' : 'border-white/20 text-white/50'
                    }`}>
                      {String.fromCharCode(65 + oIdx)}
                    </div>
                    <span className="text-[14px] md:text-[15px] leading-snug"><Latex>{opt}</Latex></span>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="flex flex-row items-center justify-between mt-8 md:mt-10 gap-2 md:gap-3">
              <button
                disabled={currentQuestion === 0}
                onClick={() => setCurrentQuestion(p => p - 1)}
                className="flex-1 sm:flex-none justify-center px-3 py-3 md:px-5 md:py-3 rounded-[14px] md:rounded-xl bg-white/5 text-white/70 font-bold hover:bg-white/10 disabled:opacity-30 flex items-center gap-1 md:gap-2 transition-colors text-[13px] md:text-[15px]"
              >
                <ChevronLeft size={18} />
                Oldingi
              </button>
              
              {currentQuestion === testData.questions.length - 1 ? (
                <button
                  onClick={() => {
                    if (Object.keys(answers).length < testData.questions.length) {
                      if (!window.confirm("Barcha savollarga javob bermadingiz. Baribir yakunlaysizmi?")) return;
                    }
                    handleSubmit();
                  }}
                  className="flex-1 sm:flex-none justify-center px-4 py-3 md:px-6 md:py-3 rounded-[14px] md:rounded-xl bg-[#FEC204] text-black font-bold hover:bg-[#e5ae03] shadow-[0_0_20px_rgba(254,194,4,0.3)] transition-colors text-[13px] md:text-[15px]"
                >
                  Yakunlash
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestion(p => p + 1)}
                  className="flex-1 sm:flex-none justify-center px-3 py-3 md:px-5 md:py-3 rounded-[14px] md:rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 flex items-center gap-1 md:gap-2 transition-colors text-[13px] md:text-[15px]"
                >
                  Keyingi
                  <ChevronRight size={18} />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>,
    document.body
  )}</>;
}
`;
fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
console.log("Written file");
