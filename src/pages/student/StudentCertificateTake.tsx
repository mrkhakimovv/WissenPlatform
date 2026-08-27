import React, { useState, useEffect } from 'react';
import { Exam, TestData } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { doc, getDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { AlertTriangle, Clock, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import Latex from 'react-latex-next';
import { useConfirm } from '../../contexts/ConfirmContext';

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
      } catch (e) {
        toast.error("Xatolik");
        onClose();
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [exam]);

  useEffect(() => {
    if (loading || isSubmitting) return;
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
  }, [loading, isSubmitting]);

  const handleSelectOption = (qId: string, index: number) => {
    setUserAnswers(prev => ({ ...prev, [qId]: index }));
  };

  const handleOpenAnswer = (qId: string, partIndex: number, val: string) => {
    setUserAnswers(prev => ({ ...prev, [`${qId}_${partIndex}`]: val }));
  };

  const handleSubmit = async () => {
    if (!testData || !user) return;
    setIsSubmitting(true);
    
    try {
      const q = query(collection(db, 'exam_results'), where('examId', '==', exam.id), where('studentId', '==', user.id));
      const existing = await getDocs(q);
      const attemptNum = existing.size + 1;
      
      const raschItems: number[] = [];
      let totalCorrect = 0;
      
      testData.questions.forEach((q, i) => {
        if (q.isOpenEnded) {
          // Part a
          const ansA = userAnswers[`${q.id}_0`] || '';
          const correctA = q.subAnswers?.[0]?.correctAnswerText || '';
          const isA = (ansA.trim().toLowerCase() === correctA.trim().toLowerCase() && correctA.trim() !== '') ? 1 : 0;
          raschItems.push(isA);
          totalCorrect += isA;
          
          // Part b
          const ansB = userAnswers[`${q.id}_1`] || '';
          const correctB = q.subAnswers?.[1]?.correctAnswerText || '';
          const isB = (ansB.trim().toLowerCase() === correctB.trim().toLowerCase() && correctB.trim() !== '') ? 1 : 0;
          raschItems.push(isB);
          totalCorrect += isB;
        } else {
          const ans = userAnswers[q.id];
          const isC = ans === q.correctOptionIndex ? 1 : 0;
          raschItems.push(isC);
          totalCorrect += isC;
        }
      });
      
      const timeSpent = (exam.duration * 60) - timeLeft;
      
      await addDoc(collection(db, 'exam_results'), {
        examId: exam.id,
        studentId: user.id,
        studentName: user.fullName,
        score: totalCorrect,
        total: 55,
        raschItems, // length 55
        timeSpent,
        attempts: attemptNum,
        submittedAt: new Date().toISOString()
      });
      
      toast.success("Imtihon topshirildi!");
      onClose();
    } catch (e) {
      console.error(e);
      toast.error("Xatolik yuz berdi");
      setIsSubmitting(false);
    }
  };

  const handleManualSubmit = async () => {
    if (await confirm({ title: "Diqqat", message: "Imtihonni yakunlamoqchimisiz? Barcha javoblar saqlanadi." })) {
      handleSubmit();
    }
  };

  if (loading) {
    return <div className="fixed inset-0 bg-[#0a0a0a] z-[9999] flex items-center justify-center text-[#FEC204] font-bold">Yuklanmoqda...</div>;
  }

  if (!testData) return null;

  const currentQ = testData.questions[activeQ];
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  return (
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
        <div className="flex-1 flex flex-col p-6 overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl w-full mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Savol {activeQ + 1}</h3>
              {currentQ.isOpenEnded && <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded font-bold text-sm">Ochiq savol (2 qism)</span>}
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/10 mb-6">
              <div className="text-lg text-white mb-6 whitespace-pre-wrap">
                <Latex>{currentQ.text || ''}</Latex>
              </div>
              {currentQ.imageUrl && (
                <img src={currentQ.imageUrl} alt="Savol" className="max-h-64 rounded-xl border border-white/10 mb-6" />
              )}

              {currentQ.isOpenEnded ? (
                <div className="space-y-6">
                  {/* Part a */}
                  <div>
                    <label className="text-white/70 font-bold mb-2 block">a) javobingizni kiriting:</label>
                    <input 
                      type="text" 
                      value={userAnswers[`${currentQ.id}_0`] || ''}
                      onChange={(e) => handleOpenAnswer(currentQ.id, 0, e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-white/20 p-4 rounded-xl text-white outline-none focus:border-[#FEC204]"
                      placeholder="Javobni kiriting..."
                    />
                  </div>
                  {/* Part b */}
                  <div>
                    <label className="text-white/70 font-bold mb-2 block">b) javobingizni kiriting:</label>
                    <input 
                      type="text" 
                      value={userAnswers[`${currentQ.id}_1`] || ''}
                      onChange={(e) => handleOpenAnswer(currentQ.id, 1, e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-white/20 p-4 rounded-xl text-white outline-none focus:border-[#FEC204]"
                      placeholder="Javobni kiriting..."
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentQ.options.map((opt, optIndex) => {
                    const isSelected = userAnswers[currentQ.id] === optIndex;
                    return (
                      <button
                        key={optIndex}
                        onClick={() => handleSelectOption(currentQ.id, optIndex)}
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
              )}
            </div>

            <div className="flex items-center justify-between">
              <button 
                onClick={() => setActiveQ(prev => Math.max(0, prev - 1))}
                disabled={activeQ === 0}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-xl text-white font-bold flex items-center gap-2"
              >
                <ChevronLeft size={20} /> Oldingi
              </button>
              <button 
                onClick={() => setActiveQ(prev => Math.min(testData.questions.length - 1, prev + 1))}
                disabled={activeQ === testData.questions.length - 1}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-xl text-white font-bold flex items-center gap-2"
              >
                Keyingi <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Nav */}
        <div className="w-80 bg-[#121212] border-l border-white/10 p-4 flex flex-col h-full">
          <h3 className="font-bold text-white/50 mb-4">Savollar ({testData.questions.length})</h3>
          <div className="grid grid-cols-5 gap-2 overflow-y-auto custom-scrollbar content-start">
            {testData.questions.map((q, i) => {
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
                  onClick={() => setActiveQ(i)}
                  className={`aspect-square flex items-center justify-center rounded-lg text-sm font-bold border-2 transition-all ${
                    activeQ === i 
                      ? 'border-white bg-white text-black' 
                      : isAnswered 
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
    </div>
  );
}
