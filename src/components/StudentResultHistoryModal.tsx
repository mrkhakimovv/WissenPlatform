import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, XCircle } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';

interface Props {
  result: any;
  onClose: () => void;
}

export default function StudentResultHistoryModal({ result, onClose }: Props) {
  const [testData, setTestData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        if (result?.testId) {
          const docRef = doc(db, 'tests', result.testId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setTestData(docSnap.data());
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTestData();
  }, [result]);

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-2xl p-6 bg-[#1a1a1a]/95 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-black text-white">Natijalar tafsiloti</h2>
            <p className="text-sm text-white/50 mt-1">{new Date(result.submittedAt).toLocaleString('uz-UZ')}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <X size={20} className="text-white" />
          </button>
        </div>

        <div className="flex items-center gap-6 mb-6 pb-6 border-b border-white/10">
          <div className="text-center">
            <p className="text-[10px] text-white/50 uppercase tracking-wider font-bold mb-1">Jami savollar</p>
            <p className="text-2xl font-bold text-white">{result.total} ta</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-white/50 uppercase tracking-wider font-bold mb-1">To'g'ri</p>
            <p className="text-2xl font-bold text-[#22c55e]">{result.score} ta</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-white/50 uppercase tracking-wider font-bold mb-1">Noto'g'ri</p>
            <p className="text-2xl font-bold text-red-500">{result.total - result.score} ta</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#FEC204] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-y-auto custom-scrollbar flex-1 pr-2 space-y-4">
            {Array.from({ length: result.total }).map((_, i) => {
              const wrongAns = result.wrongAnswers?.find((w: any) => w.questionIndex === i + 1);
              const isCorrect = !wrongAns;
              const studentAnswerRaw = result.answers ? result.answers[i] : null;
              
              // Find question from testData if available
              const q = testData?.questions?.[i];
              
              const isOepn = q ? q.isOpenEnded : (wrongAns ? wrongAns.isOpenEnded : false);
              const options = q ? q.options : (wrongAns ? wrongAns.options : []);
              const correctAnsRaw = q ? (isOepn ? q.correctAnswerText : q.correctOptionIndex) : (wrongAns ? wrongAns.correctAnswer : null);
              
              const getAnswerDisplay = (ans: any) => {
                if (ans === null || ans === undefined || ans === '') return <span className="italic opacity-50">Javob belgilanmagan</span>;
                if (isOepn) {
                  let str = String(ans);
                  if (str.includes('\\') || str.includes('^') || str.includes('_')) {
                    // Wrap with $ if not already wrapped
                    if (!str.startsWith('$') && !str.includes('$$')) {
                      str = `$${str}$`;
                    }
                  }
                  return <Latex>{str}</Latex>;
                }
                if (typeof ans === 'number' && options && options[ans]) return <Latex>{options[ans]}</Latex>;
                if (typeof ans === 'number') return `Variant ${String.fromCharCode(65 + ans)}`;
                return String(ans);
              };

              return (
                <div key={i} className={`p-4 rounded-xl border ${isCorrect ? 'bg-[#22c55e]/5 border-[#22c55e]/20' : 'bg-red-500/5 border-red-500/20'}`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {isCorrect ? <CheckCircle2 size={20} className="text-[#22c55e]" /> : <XCircle size={20} className="text-red-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-white text-sm">Savol {i + 1}</h4>
                      </div>
                      
                      {q && q.text && (
                        <div className="text-white/80 text-sm mb-3">
                          <Latex>{q.text}</Latex>
                        </div>
                      )}
                      {q && q.image && (
                         <div className="mb-3">
                           <img src={q.image} alt="" className="max-h-40 rounded-lg object-contain bg-white/5" />
                         </div>
                      )}

                      <div className="mt-2">
                        <div className="bg-black/20 p-3 rounded-lg border border-white/5 inline-block min-w-[200px]">
                          <p className="text-[10px] text-white/40 uppercase font-bold mb-1.5">Sizning javobingiz</p>
                          <div className={`text-sm ${isCorrect ? 'text-[#22c55e]' : 'text-red-400'} font-medium`}>
                            {getAnswerDisplay(studentAnswerRaw)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
