const fs = require('fs');

const code = `import React, { useState, useEffect, useMemo } from 'react';
import { X, Eye, EyeOff, BookOpen, BrainCircuit, Shuffle, ArrowRight, Home, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export default function StudentVocabModal({ lesson, onClose }: { lesson: any, onClose: () => void }) {
  const engs = useMemo(() => (lesson.vocabularyEng || '').split('\\n').map((s: string) => s.trim()).filter(Boolean), [lesson.vocabularyEng]);
  const uzs = useMemo(() => (lesson.vocabularyUz || '').split('\\n').map((s: string) => s.trim()).filter(Boolean), [lesson.vocabularyUz]);
  
  const pairs = useMemo(() => {
    const p = [];
    const maxLen = Math.max(engs.length, uzs.length);
    for (let i = 0; i < maxLen; i++) {
      if (engs[i] && uzs[i]) {
        p.push({ eng: engs[i], uz: uzs[i] });
      }
    }
    return p;
  }, [engs, uzs]);

  const [mode, setMode] = useState<'menu' | 'list' | 'eng-uzb' | 'uzb-eng' | 'match'>('menu');
  
  // -- List Mode --
  const [hideEnglish, setHideEnglish] = useState(false);
  const [hideUzbek, setHideUzbek] = useState(false);

  // -- Quiz Mode (eng-uzb, uzb-eng) --
  const [chunkIndex, setChunkIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  const QUIZ_CHUNK_SIZE = 10;
  
  // Generate Options for Quiz
  useEffect(() => {
    if ((mode === 'eng-uzb' || mode === 'uzb-eng') && !quizFinished) {
      const currentChunk = pairs.slice(chunkIndex * QUIZ_CHUNK_SIZE, (chunkIndex + 1) * QUIZ_CHUNK_SIZE);
      const currentPair = currentChunk[questionIndex];
      
      if (!currentPair) {
         setQuizFinished(true);
         return;
      }
      
      const correctAns = mode === 'eng-uzb' ? currentPair.uz : currentPair.eng;
      const allAnswers = mode === 'eng-uzb' ? pairs.map(p => p.uz) : pairs.map(p => p.eng);
      
      let wrongAnswers = allAnswers.filter(a => a !== correctAns);
      wrongAnswers = shuffleArray(wrongAnswers).slice(0, 3);
      
      // If we don't have enough wrong answers (e.g. very short list), just duplicate or show less, but ideally we have at least 4 pairs total
      while (wrongAnswers.length < 3) {
        wrongAnswers.push(wrongAnswers[0] || correctAns);
      }

      setOptions(shuffleArray([correctAns, ...wrongAnswers]));
      setSelectedAnswer(null);
      setIsAnswerRevealed(false);
    }
  }, [mode, chunkIndex, questionIndex, pairs, quizFinished]);

  const handleQuizAnswer = (ans: string) => {
    if (isAnswerRevealed) return;
    setSelectedAnswer(ans);
    setIsAnswerRevealed(true);
    
    const currentChunk = pairs.slice(chunkIndex * QUIZ_CHUNK_SIZE, (chunkIndex + 1) * QUIZ_CHUNK_SIZE);
    const currentPair = currentChunk[questionIndex];
    const correctAns = mode === 'eng-uzb' ? currentPair.uz : currentPair.eng;
    
    if (ans === correctAns) {
      setCorrectCount(prev => prev + 1);
    } else {
      setWrongCount(prev => prev + 1);
    }
    
    setTimeout(() => {
      if (questionIndex + 1 < currentChunk.length) {
        setQuestionIndex(prev => prev + 1);
      } else {
        setQuizFinished(true);
      }
    }, 1200);
  };
  
  const handleQuizContinue = () => {
    if ((chunkIndex + 1) * QUIZ_CHUNK_SIZE < pairs.length) {
      setChunkIndex(prev => prev + 1);
      setQuestionIndex(0);
      setCorrectCount(0);
      setWrongCount(0);
      setQuizFinished(false);
    } else {
      setMode('menu');
    }
  };

  const startQuiz = (m: 'eng-uzb' | 'uzb-eng') => {
    if (pairs.length < 4) {
      alert("Test ishlash uchun kamida 4 ta so'z bo'lishi kerak!");
      return;
    }
    setMode(m);
    setChunkIndex(0);
    setQuestionIndex(0);
    setCorrectCount(0);
    setWrongCount(0);
    setQuizFinished(false);
  };

  // -- Match Mode --
  const MATCH_CHUNK_SIZE = 4;
  const [matchEngs, setMatchEngs] = useState<{id: string, text: string}[]>([]);
  const [matchUzs, setMatchUzs] = useState<{id: string, text: string}[]>([]);
  const [selectedMatchEng, setSelectedMatchEng] = useState<string | null>(null);
  const [selectedMatchUz, setSelectedMatchUz] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [matchError, setMatchError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'match') {
      const currentChunk = pairs.slice(chunkIndex * MATCH_CHUNK_SIZE, (chunkIndex + 1) * MATCH_CHUNK_SIZE);
      if (currentChunk.length === 0) {
        setMode('menu');
        return;
      }
      
      const chunkWithIds = currentChunk.map((p, i) => ({ id: \`pair-\${chunkIndex}-\${i}\`, ...p }));
      setMatchEngs(shuffleArray(chunkWithIds.map(p => ({ id: p.id, text: p.eng }))));
      setMatchUzs(shuffleArray(chunkWithIds.map(p => ({ id: p.id, text: p.uz }))));
      setMatchedIds([]);
      setSelectedMatchEng(null);
      setSelectedMatchUz(null);
      setMatchError(null);
    }
  }, [mode, chunkIndex, pairs]);

  useEffect(() => {
    if (selectedMatchEng && selectedMatchUz) {
      if (selectedMatchEng === selectedMatchUz) {
        setMatchedIds(prev => [...prev, selectedMatchEng]);
        setSelectedMatchEng(null);
        setSelectedMatchUz(null);
      } else {
        setMatchError(selectedMatchEng);
        setTimeout(() => {
          setSelectedMatchEng(null);
          setSelectedMatchUz(null);
          setMatchError(null);
        }, 800);
      }
    }
  }, [selectedMatchEng, selectedMatchUz]);

  const handleMatchContinue = () => {
    if ((chunkIndex + 1) * MATCH_CHUNK_SIZE < pairs.length) {
      setChunkIndex(prev => prev + 1);
    } else {
      setMode('menu');
    }
  };

  const startMatch = () => {
    if (pairs.length < 2) {
      alert("Moslashtirish uchun kamida 2 ta so'z bo'lishi kerak!");
      return;
    }
    setMode('match');
    setChunkIndex(0);
  };


  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-[#0d0d0d] border border-white/10 rounded-[24px] p-6 shadow-2xl flex flex-col max-h-[85vh] relative overflow-hidden"
      >
        <div className="flex justify-between items-center mb-6 z-10 relative">
          <div>
            <h2 className="text-[20px] font-black tracking-tight text-white">{lesson.title} - Lug'atlar</h2>
            <p className="text-[12px] text-white/40 font-medium mt-1">So'zlarni yodlash va takrorlash</p>
          </div>
          <div className="flex gap-2">
            {mode !== 'menu' && (
              <button onClick={() => setMode('menu')} className="px-4 py-2 bg-white/5 rounded-xl text-white/60 hover:bg-white/10 hover:text-white transition-colors text-sm font-bold flex items-center gap-2">
                <Home size={16} /> Bosh sahifa
              </button>
            )}
            <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-white/40 hover:bg-white/10 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* --- MENU MODE --- */}
        {mode === 'menu' && (
          <div className="flex-1 flex flex-col gap-3 justify-center items-center py-8">
            <button onClick={() => setMode('list')} className="w-full max-w-sm p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all flex items-center gap-4 group">
              <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen size={24} />
              </div>
              <div className="text-left">
                <h3 className="text-white font-bold text-[16px]">Ro'yxatni ko'rish</h3>
                <p className="text-white/40 text-[12px]">Barcha so'zlarni yashirib yodlash</p>
              </div>
            </button>

            <button onClick={() => startQuiz('eng-uzb')} className="w-full max-w-sm p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all flex items-center gap-4 group">
              <div className="w-12 h-12 bg-[#FEC204]/10 text-[#FEC204] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <BrainCircuit size={24} />
              </div>
              <div className="text-left">
                <h3 className="text-white font-bold text-[16px]">ENG - UZB test</h3>
                <p className="text-white/40 text-[12px]">Inglizcha so'zning tarjimasini toping</p>
              </div>
            </button>

            <button onClick={() => startQuiz('uzb-eng')} className="w-full max-w-sm p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all flex items-center gap-4 group">
              <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <BrainCircuit size={24} />
              </div>
              <div className="text-left">
                <h3 className="text-white font-bold text-[16px]">UZB - ENG test</h3>
                <p className="text-white/40 text-[12px]">O'zbekcha so'zning tarjimasini toping</p>
              </div>
            </button>

            <button onClick={() => startMatch()} className="w-full max-w-sm p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all flex items-center gap-4 group">
              <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shuffle size={24} />
              </div>
              <div className="text-left">
                <h3 className="text-white font-bold text-[16px]">Moslashtirish</h3>
                <p className="text-white/40 text-[12px]">So'zlarni o'z jufti bilan birlashtiring</p>
              </div>
            </button>
          </div>
        )}

        {/* --- LIST MODE --- */}
        {mode === 'list' && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex gap-4 mb-4 shrink-0">
              <button 
                onClick={() => setHideEnglish(!hideEnglish)}
                className={\`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors \${hideEnglish ? 'bg-white/20 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}\`}
              >
                {hideEnglish ? <EyeOff size={16} /> : <Eye size={16} />} Inglizchani yashirish
              </button>
              <button 
                onClick={() => setHideUzbek(!hideUzbek)}
                className={\`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors \${hideUzbek ? 'bg-[#FEC204]/20 text-[#FEC204]' : 'bg-white/5 text-white/60 hover:bg-white/10'}\`}
              >
                {hideUzbek ? <EyeOff size={16} /> : <Eye size={16} />} O'zbekchani yashirish
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
              {pairs.length === 0 ? (
                <div className="text-center py-10 text-white/40 text-sm font-bold">Lug'atlar kiritilmagan</div>
              ) : (
                pairs.map((pair, idx) => (
                  <div key={idx} className="flex items-stretch gap-3">
                    <div className="w-8 flex items-center justify-center text-[11px] font-bold text-white/20 bg-white/5 rounded-lg">
                      {idx + 1}
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div className={\`p-3 rounded-lg border border-white/5 flex items-center justify-center text-center transition-all \${hideEnglish ? 'bg-black text-transparent hover:text-white cursor-pointer select-none' : 'bg-white/5 text-white'}\`}>
                        <span className="font-medium text-[15px]">{pair.eng}</span>
                      </div>
                      <div className={\`p-3 rounded-lg border border-[#FEC204]/10 flex items-center justify-center text-center transition-all \${hideUzbek ? 'bg-black text-transparent hover:text-[#FEC204] cursor-pointer select-none' : 'bg-[#FEC204]/5 text-[#FEC204]'}\`}>
                        <span className="font-bold text-[15px]">{pair.uz}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* --- QUIZ MODE --- */}
        {(mode === 'eng-uzb' || mode === 'uzb-eng') && (
          <div className="flex-1 flex flex-col items-center justify-center min-h-0 w-full max-w-md mx-auto">
            {!quizFinished ? (
              <div className="w-full">
                <div className="flex justify-between items-center mb-6 text-white/50 text-[13px] font-bold">
                  <span>Savol {questionIndex + 1} / {Math.min(QUIZ_CHUNK_SIZE, pairs.length - chunkIndex * QUIZ_CHUNK_SIZE)}</span>
                  <div className="flex gap-4">
                    <span className="text-green-500">To'g'ri: {correctCount}</span>
                    <span className="text-red-500">Xato: {wrongCount}</span>
                  </div>
                </div>

                <div className="text-center mb-8">
                  <h3 className="text-[32px] font-black text-white">
                    {mode === 'eng-uzb' 
                      ? pairs[chunkIndex * QUIZ_CHUNK_SIZE + questionIndex]?.eng 
                      : pairs[chunkIndex * QUIZ_CHUNK_SIZE + questionIndex]?.uz}
                  </h3>
                  <p className="text-white/40 text-sm mt-2">Tarjimasini toping</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {options.map((opt, i) => {
                    const currentPair = pairs[chunkIndex * QUIZ_CHUNK_SIZE + questionIndex];
                    const correctAns = mode === 'eng-uzb' ? currentPair?.uz : currentPair?.eng;
                    
                    let btnClass = "bg-white/5 border-white/10 text-white hover:bg-white/10";
                    if (isAnswerRevealed) {
                      if (opt === correctAns) {
                        btnClass = "bg-green-500/20 border-green-500/50 text-green-500";
                      } else if (opt === selectedAnswer) {
                        btnClass = "bg-red-500/20 border-red-500/50 text-red-500";
                      } else {
                        btnClass = "bg-white/5 border-white/10 text-white/30 opacity-50";
                      }
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handleQuizAnswer(opt)}
                        disabled={isAnswerRevealed}
                        className={\`w-full p-4 rounded-xl border text-left font-bold text-[16px] transition-all \${btnClass}\`}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center w-full animate-in zoom-in duration-300">
                <div className="w-24 h-24 bg-[#FEC204]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={48} className="text-[#FEC204]" />
                </div>
                <h3 className="text-[24px] font-black text-white mb-2">Natija</h3>
                <p className="text-white/60 mb-6">Ushbu bosqichni yakunladingiz</p>
                
                <div className="flex justify-center gap-8 mb-8">
                  <div className="text-center">
                    <div className="text-[32px] font-black text-green-500">{correctCount}</div>
                    <div className="text-[12px] text-white/40 uppercase tracking-wider font-bold">To'g'ri</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[32px] font-black text-red-500">{wrongCount}</div>
                    <div className="text-[12px] text-white/40 uppercase tracking-wider font-bold">Xato</div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setMode('menu')} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-white transition-colors">
                    Bosh sahifa
                  </button>
                  <button 
                    onClick={handleQuizContinue} 
                    className="flex-1 py-4 bg-[#FEC204] hover:bg-[#e5ae03] text-black rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    Davom etish <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- MATCH MODE --- */}
        {mode === 'match' && (
          <div className="flex-1 flex flex-col min-h-0 w-full">
             <div className="flex justify-between items-center mb-6 text-white/50 text-[13px] font-bold shrink-0">
                <span>Guruh {chunkIndex + 1} / {Math.ceil(pairs.length / MATCH_CHUNK_SIZE)}</span>
                <span className="text-[#FEC204]">Topildi: {matchedIds.length} / {matchEngs.length}</span>
             </div>

             <div className="flex-1 flex gap-4 min-h-0 overflow-y-auto pb-4">
               {/* English Column */}
               <div className="flex-1 flex flex-col gap-3">
                 <h4 className="text-center text-white/40 font-bold text-xs uppercase tracking-wider mb-2">Inglizcha</h4>
                 {matchEngs.map(item => {
                   const isMatched = matchedIds.includes(item.id);
                   const isSelected = selectedMatchEng === item.id;
                   const isError = matchError === item.id;
                   
                   let classes = "bg-white/5 border-white/10 text-white hover:bg-white/10 cursor-pointer";
                   if (isMatched) classes = "bg-green-500/20 border-green-500/50 text-green-500 opacity-50 cursor-default scale-95";
                   else if (isError) classes = "bg-red-500/20 border-red-500/50 text-red-500 animate-shake";
                   else if (isSelected) classes = "bg-[#FEC204]/20 border-[#FEC204]/50 text-[#FEC204] scale-[1.02] shadow-[0_0_15px_rgba(254,194,4,0.2)]";

                   return (
                     <button
                       key={item.id}
                       disabled={isMatched}
                       onClick={() => setSelectedMatchEng(item.id)}
                       className={\`w-full p-4 rounded-xl border text-center font-bold text-[15px] transition-all \${classes}\`}
                     >
                       {item.text}
                     </button>
                   )
                 })}
               </div>

               {/* Uzbek Column */}
               <div className="flex-1 flex flex-col gap-3">
                 <h4 className="text-center text-white/40 font-bold text-xs uppercase tracking-wider mb-2">O'zbekcha</h4>
                 {matchUzs.map(item => {
                   const isMatched = matchedIds.includes(item.id);
                   const isSelected = selectedMatchUz === item.id;
                   const isError = matchError === item.id;
                   
                   let classes = "bg-white/5 border-white/10 text-white hover:bg-white/10 cursor-pointer";
                   if (isMatched) classes = "bg-green-500/20 border-green-500/50 text-green-500 opacity-50 cursor-default scale-95";
                   else if (isError) classes = "bg-red-500/20 border-red-500/50 text-red-500 animate-shake";
                   else if (isSelected) classes = "bg-[#FEC204]/20 border-[#FEC204]/50 text-[#FEC204] scale-[1.02] shadow-[0_0_15px_rgba(254,194,4,0.2)]";

                   return (
                     <button
                       key={item.id}
                       disabled={isMatched}
                       onClick={() => setSelectedMatchUz(item.id)}
                       className={\`w-full p-4 rounded-xl border text-center font-bold text-[15px] transition-all \${classes}\`}
                     >
                       {item.text}
                     </button>
                   )
                 })}
               </div>
             </div>

             {/* Match Complete overlay for this chunk */}
             {matchedIds.length > 0 && matchedIds.length === matchEngs.length && (
               <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 rounded-[24px]">
                 <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={40} className="text-green-500" />
                 </div>
                 <h3 className="text-2xl font-black text-white mb-8">Barakalla!</h3>
                 <div className="flex gap-4">
                  <button onClick={() => setMode('menu')} className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-white transition-colors">
                    Bosh sahifa
                  </button>
                  <button onClick={handleMatchContinue} className="px-8 py-3 bg-[#FEC204] hover:bg-[#e5ae03] text-black rounded-xl font-bold transition-colors">
                    Davom etish
                  </button>
                 </div>
               </div>
             )}
          </div>
        )}

      </motion.div>
    </div>
  );
}
`

fs.writeFileSync('src/pages/student/StudentVocabModal.tsx', code);
