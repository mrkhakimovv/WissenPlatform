import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Image as ImageIcon, Trash2, CheckCircle2, Type } from 'lucide-react';
import { TestData, TestQuestion } from '../../types';
import toast from 'react-hot-toast';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import MathAnswerField from '../../components/MathAnswerField';
import { collection, addDoc, updateDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { recalculateStandardExams } from '../../lib/recalculate';

interface Props {
  initialData: TestData;
  onClose: () => void;
  onSave: () => void;
}

export default function AdminSATBuilder({ initialData, onClose, onSave }: Props) {
  const [testData, setTestData] = useState<TestData>(initialData);
  const [activeQuestion, setActiveQuestion] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize questions if empty
  if (testData.questions.length === 0) {
    const initialQuestions = Array.from({ length: testData.questionCount }).map((_, i) => ({
      id: Math.random().toString(),
      text: '',
      options: Array(testData.variantCount).fill(''),
      correctOptionIndex: 0
    }));
    setTestData({ ...testData, questions: initialQuestions });
  }

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

  const handleSave = async () => {
    try {
      setIsSaving(true);
      if (testData.id) {
         await updateDoc(doc(db, 'tests', testData.id), {
            ...testData
         });
         toast.loading("Natijalar qayta hisoblanmoqda...", { id: 'recalc' });
         await recalculateStandardExams(testData);
         toast.success("Test saqlandi va mos imtihon natijalari yangilandi!", { id: 'recalc' });
      } else {
         const newDocRef = doc(collection(db, 'tests'));
         await setDoc(newDocRef, {
            ...testData,
            id: newDocRef.id,
            createdAt: new Date().toISOString()
         });
         toast.success("Test saqlandi!");
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

  const currentQ = testData.questions[activeQuestion];
  if (!currentQ) return null;

  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const isBubbleMode = testData.satType === 'SAT Homework' || testData.satType === 'SAT practice';

  return createPortal(
    <div className="fixed inset-0 bg-[#0d0d0d] z-[9999] flex flex-col animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0 bg-[#121212]">
        <div>
          <h2 className="text-lg font-black text-white">{testData.title}</h2>
          <p className="text-xs text-white/50">{testData.satType || testData.testType} • {testData.questionCount} ta savol</p>
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

      {isBubbleMode ? (
        <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar bg-[#0a0a0a]">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <label className="block text-sm font-bold text-white/70 mb-2">Test Nomi</label>
              <input
                type="text"
                value={testData.title}
                onChange={(e) => setTestData({ ...testData, title: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FEC204]"
                placeholder="Test nomini kiriting (Masalan: SAT Matematika 1-variant)"
              />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">Javoblar varaqasi (Kalitlarni belgilash)</h3>
            <p className="text-white/50 mb-8 text-sm">Ushbu test "Uyga vazifa" yoki "Amaliyot" turida bo'lgani uchun, faqat to'g'ri javob kalitlarini kiritish kifoya. O'quvchilar testni qog'ozda ishlashadi va faqat javoblarni onlayn tizimga kiritishadi.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {testData.questions.map((q, i) => (
                <div key={q.id} className="bg-white/5 rounded-xl p-4 flex flex-col items-center gap-3 border border-white/10 relative">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white/70 text-lg">{i + 1}-savol</span>
                    <button 
                      onClick={() => updateQuestion(i, 'isOpenEnded', !q.isOpenEnded)}
                      className={`p-1.5 rounded-md transition-colors ${q.isOpenEnded ? 'bg-[#FEC204] text-black' : 'bg-white/10 text-white/40 hover:bg-white/20 hover:text-white'}`}
                      title={q.isOpenEnded ? "Test turiga o'tkazish" : "Yopiq savol (matnli) ga o'tkazish"}
                    >
                      <Type size={14} />
                    </button>
                  </div>
                  <div className="flex gap-2 w-full justify-center">
                    {q.isOpenEnded ? (
                      <MathAnswerField
                        value={q.correctAnswerText || ''}
                        onChange={(latex) => updateQuestion(i, 'correctAnswerText', latex)}
                        placeholder="To'g'ri javobni kiriting"
                      />
                    ) : (
                      Array.from({length: testData.variantCount}).map((_, optIdx) => (
                        <button 
                          key={optIdx}
                          onClick={() => updateQuestion(i, 'correctOptionIndex', optIdx)}
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all duration-200 ${q.correctOptionIndex === optIdx ? 'border-[#FEC204] bg-[#FEC204] text-black shadow-[0_0_15px_rgba(254,194,4,0.4)] scale-110' : 'border-white/20 text-white/40 hover:border-white/50 hover:text-white'}`}
                        >
                          {ALPHABET[optIdx]}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
      <div className="flex flex-1 overflow-hidden min-w-0">
        {/* Sidebar */}
        <div className="w-64 border-r border-white/10 bg-[#0a0a0a] flex flex-col overflow-y-auto custom-scrollbar p-2 gap-1">
          {testData.questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setActiveQuestion(i)}
              className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition-colors ${activeQuestion === i ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5'}`}
            >
              <span className="font-bold text-sm">Savol {i + 1}</span>
              {q.text.trim() && <CheckCircle2 size={14} className="text-[#FEC204]" />}
            </button>
          ))}
        </div>

        {/* Main Editor */}
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
                 <label className="text-sm font-bold text-white/70">Variantlar</label>
                 {currentQ.options.map((opt, optIndex) => (
                    <div key={optIndex} className="flex items-start gap-3">
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
                    {currentQ.options.map((opt, optIndex) => (
                       <div key={optIndex} className={`flex items-start gap-3 p-3 rounded-lg border ${currentQ.correctOptionIndex === optIndex ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                          <span className="font-bold text-gray-500">{ALPHABET[optIndex]})</span>
                          <div className="flex-1 whitespace-pre-wrap overflow-x-auto custom-scrollbar" style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
                             <Latex>{opt || '...'}</Latex>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
      )}
    </div>,
    document.body
  );
}
