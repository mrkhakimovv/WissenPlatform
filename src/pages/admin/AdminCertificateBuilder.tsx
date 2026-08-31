import React, { useState, useEffect } from 'react';
import { TestData, TestQuestion } from '../../types';
import { Trash2, Edit2, X, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { createPortal } from 'react-dom';
import Latex from 'react-latex-next';
import { doc, setDoc, updateDoc, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';
import MathAnswerField from '../../components/MathAnswerField';
import { recalculateCertificateExams } from '../../lib/recalculate';

interface Props {
  initialData: TestData & { id?: string };
  onClose: () => void;
  onSave: () => void;
}

export default function AdminCertificateBuilder({ initialData, onClose, onSave }: Props) {
  const [testData, setTestData] = useState<TestData & { id?: string }>(initialData);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isFastAnswerModeOpen, setIsFastAnswerModeOpen] = useState(false);

  // Initialize the 45 questions if they don't exist
  useEffect(() => {
    if (!testData.questions || testData.questions.length !== 45) {
      const questions: TestQuestion[] = Array.from({ length: 45 }).map((_, i) => {
        let q: TestQuestion = {
          id: `q${i + 1}`,
          text: '',
          options: [],
          correctOptionIndex: 0
        };
        
        if (i < 32) {
          // Q1-32: 4 options
          q.options = ['', '', '', ''];
        } else if (i < 35) {
          // Q33-35: 6 options
          q.options = ['', '', '', '', '', ''];
        } else {
          // Q36-45: Open ended with a) and b)
          q.isOpenEnded = true;
          q.subAnswers = [
            { label: 'a', correctAnswerText: '' },
            { label: 'b', correctAnswerText: '' }
          ];
        }
        return q;
      });
      
      setTestData(prev => ({ ...prev, questions }));
    }
  }, []);

  const updateQuestion = (index: number, field: keyof TestQuestion, value: any) => {
    const newQuestions = [...testData.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setTestData({ ...testData, questions: newQuestions });
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const newQuestions = [...testData.questions];
    const newOptions = [...newQuestions[qIndex].options];
    newOptions[optIndex] = value;
    newQuestions[qIndex] = { ...newQuestions[qIndex], options: newOptions };
    setTestData({ ...testData, questions: newQuestions });
  };
  
  const updateSubAnswer = (qIndex: number, subIndex: number, value: string) => {
    const newQuestions = [...testData.questions];
    if (!newQuestions[qIndex].subAnswers) return;
    const newSubAnswers = [...newQuestions[qIndex].subAnswers!];
    newSubAnswers[subIndex] = { ...newSubAnswers[subIndex], correctAnswerText: value };
    newQuestions[qIndex] = { ...newQuestions[qIndex], subAnswers: newSubAnswers };
    setTestData({ ...testData, questions: newQuestions });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      if (testData.id) {
         await updateDoc(doc(db, 'tests', testData.id), { ...testData });
         // Test o'zgarganda imtihonlarni qayta hisoblash
         toast.loading("Natijalar qayta hisoblanmoqda...", { id: 'recalc' });
         await recalculateCertificateExams(testData);
         toast.success("Sertifikat testi saqlandi va barcha mos imtihon natijalari yangilandi!", { id: 'recalc' });
      } else {
         const newDocRef = doc(collection(db, 'tests'));
         await setDoc(newDocRef, {
            ...testData,
            id: newDocRef.id,
            createdAt: new Date().toISOString()
         });
         toast.success("Sertifikat testi saqlandi!");
      }
      onSave();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Xatolik yuz berdi", { id: 'recalc' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!testData.questions || testData.questions.length === 0) return null;

  const currentQ = testData.questions[activeQuestion];
  if (!currentQ) return null;

  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';


  const isFastMode = !!testData.isFastMode;

  return createPortal(
    <div className="fixed inset-0 bg-[#0d0d0d] z-[9999] flex flex-col animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0 bg-[#121212]">
        <div>
          <h2 className="text-lg font-black text-white">{testData.title}</h2>
          <p className="text-xs text-[#FEC204] font-bold">Milliy Sertifikat (Rasch) • 45 ta savol (55 birlik) {isFastMode && " • Faqat Javoblar"}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors text-sm font-bold">
            Yopish
          </button>
          <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 rounded-lg bg-[#FEC204] text-black hover:opacity-90 transition-colors text-sm font-bold flex items-center gap-2">
            {isSaving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </div>

      {isFastMode ? (
        <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar bg-[#0a0a0a]">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <label className="block text-sm font-bold text-white/70 mb-2">Test Nomi</label>
              <input
                type="text"
                value={testData.title}
                onChange={(e) => setTestData({ ...testData, title: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FEC204]"
                placeholder="Test nomini kiriting (Masalan: Milliy Sertifikat 1-variant)"
              />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">Javoblar varaqasi (Kalitlarni belgilash)</h3>
            <p className="text-white/50 mb-8 text-sm">O'quvchilar testni qog'ozda ishlashadi va faqat javoblarni onlayn tizimga kiritishadi, yoki siz shu yerda to'g'ri kalitlarni belgilaysiz.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {testData.questions.map((q, i) => (
                <div key={q.id} className="bg-white/5 rounded-xl p-4 flex flex-col items-center gap-3 border border-white/10 relative">
                  <span className="font-bold text-white/70 text-lg">{i + 1}-savol</span>
                  
                  {q.isOpenEnded ? (
                    <div className="flex flex-col gap-2 w-full">
                      <div className="flex items-center gap-2">
                        <span className="text-[#FEC204] font-bold">a)</span>
                        <div className="flex-1 min-w-0">
                          <MathAnswerField
                            value={q.subAnswers?.[0]?.correctAnswerText || ''}
                            onChange={(val) => updateSubAnswer(i, 0, val)}
                            placeholder="Javob..."
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#FEC204] font-bold">b)</span>
                        <div className="flex-1 min-w-0">
                          <MathAnswerField
                            value={q.subAnswers?.[1]?.correctAnswerText || ''}
                            onChange={(val) => updateSubAnswer(i, 1, val)}
                            placeholder="Javob..."
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-1 sm:gap-1.5 xl:gap-2 w-full justify-center flex-wrap">
                      {q.options.map((_, optIndex) => (
                        <button
                          key={optIndex}
                          onClick={() => updateQuestion(i, 'correctOptionIndex', optIndex)}
                          className={`w-8 h-8 sm:w-9 sm:h-9 xl:w-10 xl:h-10 text-xs sm:text-sm xl:text-base shrink-0 rounded-full font-bold transition-colors flex items-center justify-center ${q.correctOptionIndex === optIndex ? 'bg-[#FEC204] text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        >
                          {ALPHABET[optIndex]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden min-w-0">
        {/* Sidebar */}
        <div className="w-64 border-r border-white/10 bg-[#0a0a0a] flex flex-col p-2 gap-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1">
          {testData.questions.map((q, i) => {
            let label = "4 variant";
            if (i >= 32 && i < 35) label = "6 variant";
            else if (i >= 35) label = "Ochiq a/b";
            
            return (
              <button
                key={q.id}
                onClick={() => { setActiveQuestion(i); setIsFastAnswerModeOpen(false); }}
                className={`w-full text-left p-3 rounded-lg flex flex-col transition-colors ${activeQuestion === i ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5'}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-sm">Savol {i + 1}</span>
                  {q.text.trim() && <CheckCircle2 size={14} className="text-[#FEC204]" />}
                </div>
                <span className="text-[10px] opacity-60 mt-1">{label}</span>
              </button>
            );
          })}
          </div>
          <div className="mt-2 pt-2 border-t border-white/10 shrink-0">
            <button
               onClick={() => setIsFastAnswerModeOpen(true)}
               className="w-full py-3 px-4 bg-[#FEC204]/10 text-[#FEC204] hover:bg-[#FEC204]/20 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
               <CheckCircle2 size={18} /> To'g'ri javoblar
            </button>
          </div>
        </div>

        {/* Main Editor */}
        {isFastAnswerModeOpen ? (
          <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#121212] custom-scrollbar">
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl font-black text-white">To'g'ri javoblarni tez kiritish</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {testData.questions.map((q, i) => (
                  <div key={q.id} className="bg-white/5 rounded-xl p-4 flex flex-col items-center gap-3 border border-white/10 relative">
                    <span className="font-bold text-white/70 text-lg">{i + 1}-savol</span>
                    {q.isOpenEnded ? (
                      <div className="flex flex-col gap-2 w-full">
                        <div className="flex items-center gap-2">
                          <span className="text-[#FEC204] font-bold">a)</span>
                          <div className="flex-1 min-w-0">
                            <MathAnswerField
                              value={q.subAnswers?.[0]?.correctAnswerText || ''}
                              onChange={(val) => updateSubAnswer(i, 0, val)}
                              placeholder="Javob"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[#FEC204] font-bold">b)</span>
                          <div className="flex-1 min-w-0">
                            <MathAnswerField
                              value={q.subAnswers?.[1]?.correctAnswerText || ''}
                              onChange={(val) => updateSubAnswer(i, 1, val)}
                              placeholder="Javob"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-1 sm:gap-1.5 xl:gap-2 w-full justify-center flex-wrap">
                        {q.options.map((_, optIndex) => (
                          <button
                            key={optIndex}
                            onClick={() => updateQuestion(i, 'correctOptionIndex', optIndex)}
                            className={`w-8 h-8 sm:w-9 sm:h-9 xl:w-10 xl:h-10 text-xs sm:text-sm xl:text-base shrink-0 rounded-full font-bold transition-colors flex items-center justify-center ${q.correctOptionIndex === optIndex ? 'bg-[#FEC204] text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                          >
                            {ALPHABET[optIndex]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
          </div>
        ) : (
        <div className="flex-1 min-w-0 flex flex-col lg:flex-row overflow-hidden bg-[#0d0d0d]">
           {/* Editor panel */}
           <div className="flex-1 min-w-0 flex flex-col border-r border-white/10 overflow-y-auto custom-scrollbar p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-white/70">Savol matni (LaTeX formatida)</label>
                  <button className="flex items-center gap-1.5 text-[#FEC204] text-xs font-bold hover:underline" onClick={() => {
                     const url = prompt("Rasm URL manzilini kiriting:");
                     if (url) updateQuestion(activeQuestion, 'imageUrl', url);
                  }}>
                    <ImageIcon size={14} /> Rasm qo'shish
                  </button>
                </div>
                <textarea 
                  value={currentQ.text}
                  onChange={(e) => updateQuestion(activeQuestion, 'text', e.target.value)}
                  className="w-full h-32 glass-panel p-4 outline-none focus:border-[#FEC204]/50 text-sm custom-scrollbar"
                  placeholder="Misol: $\int_0^1 x^2 dx$ qanchaga teng?"
                />
                {currentQ.imageUrl && (
                   <div className="mt-3 relative inline-block group">
                      <img src={currentQ.imageUrl} alt="Savol rasmi" className="max-h-32 rounded border border-white/10" />
                      <button onClick={() => updateQuestion(activeQuestion, 'imageUrl', '')} className="absolute top-1 right-1 bg-black/60 p-1 rounded text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={14} />
                      </button>
                   </div>
                )}
              </div>

              <div className="space-y-4">
                 {currentQ.isOpenEnded ? (
                    <div>
                      <label className="text-sm font-bold text-white/70 mb-3 block">To'g'ri javoblar (a va b qismlar uchun)</label>
                      <div className="space-y-4">
                        {currentQ.subAnswers?.map((sub, subIndex) => (
                           <div key={subIndex} className="flex flex-col gap-2">
                              <span className="text-xs font-bold text-white/50">{sub.label}) qism uchun to'g'ri javob:</span>
                              <MathAnswerField
                                value={sub.correctAnswerText}
                                onChange={(val) => updateSubAnswer(activeQuestion, subIndex, val)}
                                placeholder="Masalan: 42"
                              />
                           </div>
                        ))}
                      </div>
                    </div>
                 ) : (
                    <div>
                       <label className="text-sm font-bold text-white/70 mb-3 block">Variantlar</label>
                       {currentQ.options.map((opt, optIndex) => (
                          <div key={optIndex} className="flex items-start gap-3 mb-4">
                             <button
                                onClick={() => updateQuestion(activeQuestion, 'correctOptionIndex', optIndex)}
                               className={`mt-1.5 w-6 h-6 rounded-full shrink-0 flex items-center justify-center border-2 transition-colors ${currentQ.correctOptionIndex === optIndex ? 'border-[#FEC204] bg-[#FEC204] text-black' : 'border-white/20 text-transparent hover:border-white/40'}`}
                             >
                               {currentQ.correctOptionIndex === optIndex && <CheckCircle2 size={14} />}
                             </button>
                             <div className="flex-1 relative">
                                <span className="absolute left-3 top-3 text-xs font-bold text-white/40">{ALPHABET[optIndex]}</span>
                                <textarea
                                   value={opt}
                                   onChange={(e) => updateOption(activeQuestion, optIndex, e.target.value)}
                                   className="w-full glass-panel pl-8 p-3 outline-none focus:border-[#FEC204]/50 text-sm min-h-[50px] custom-scrollbar"
                                   placeholder="Variant matni..."
                                />
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </div>
           </div>

           {/* Preview panel */}
           <div className="flex-1 min-w-0 bg-[#121212] overflow-y-auto custom-scrollbar p-6">
              <h3 className="text-sm font-bold text-white/40 mb-4 uppercase tracking-wider">Ko'rinish (Preview)</h3>
              <div className="bg-white text-black p-6 rounded-xl shadow-lg min-h-[300px] w-full overflow-hidden">
                 <div className="mb-4 max-w-none whitespace-pre-wrap overflow-x-auto custom-scrollbar" style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
                    <Latex>{currentQ.text || 'Savol matni kiritilmagan...'}</Latex>
                 </div>
                 {currentQ.imageUrl && (
                    <div className="mb-6">
                      <img src={currentQ.imageUrl} alt="Savol rasmi" className="max-w-full rounded" />
                    </div>
                 )}
                 <div className="space-y-3 mt-6">
                    {currentQ.isOpenEnded ? (
                       <div className="space-y-4">
                          <div className="p-3 border-2 border-dashed border-gray-300 rounded-lg">
                             <span className="font-bold text-gray-500 mb-2 block">a) javob joyi:</span>
                             <div className="bg-gray-100 p-2 rounded text-sm text-gray-600">
                               {currentQ.subAnswers?.[0].correctAnswerText || 'Kiritilmagan'}
                             </div>
                          </div>
                          <div className="p-3 border-2 border-dashed border-gray-300 rounded-lg">
                             <span className="font-bold text-gray-500 mb-2 block">b) javob joyi:</span>
                             <div className="bg-gray-100 p-2 rounded text-sm text-gray-600">
                               {currentQ.subAnswers?.[1].correctAnswerText || 'Kiritilmagan'}
                             </div>
                          </div>
                       </div>
                    ) : (
                       currentQ.options.map((opt, optIndex) => (
                          <div key={optIndex} className={`flex items-start gap-3 p-3 rounded-lg border ${currentQ.correctOptionIndex === optIndex ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                             <span className="font-bold text-gray-500">{ALPHABET[optIndex]})</span>
                             <div className="flex-1 whitespace-pre-wrap overflow-x-auto custom-scrollbar" style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
                                <Latex>{opt || '...'}</Latex>
                             </div>
                          </div>
                       ))
                    )}
                 </div>
              </div>
           </div>
        </div>
        )}
      </div>
      )}
    </div>,
    document.body
  );
}