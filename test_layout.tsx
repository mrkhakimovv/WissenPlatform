          <div className="w-full max-h-[40vh] overflow-y-auto custom-scrollbar pr-2 mb-6 space-y-2 text-left">
            {allResultsList.map((r, i) => {
              const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
              const formatAns = (ans: any, isOpen: boolean) => {
                if (ans === null || ans === undefined) return "Belgilamagan";
                if (isOpen) return ans;
                return ALPHABET[ans] || ans;
              };
              return (
                <div key={i} className={`p-3 rounded-xl border flex items-center justify-between gap-4 ${r.isCorrect ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                  <div className="font-bold text-white/70 w-20 shrink-0">{r.questionIndex}-savol:</div>
                  <div className="flex-1 flex gap-4">
                    <div className="flex-1">
                      <span className="text-[10px] uppercase text-white/40 block">Sizning javob:</span>
                      <span className={\`font-bold \${r.isCorrect ? 'text-green-400' : 'text-red-400'}\`}>{formatAns(r.studentAnswer, r.isOpenEnded)}</span>
                    </div>
                    {!r.isCorrect && (
                      <div className="flex-1">
                        <span className="text-[10px] uppercase text-white/40 block">To'g'ri javob:</span>
                        <span className="font-bold text-green-400">{formatAns(r.correctAnswer, r.isOpenEnded)}</span>
                      </div>
                    )}
                  </div>
                  <div className="shrink-0">
                    {r.isCorrect ? (
                      <CheckCircle2 size={20} className="text-green-500" />
                    ) : (
                      <XCircle size={20} className="text-red-500" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
