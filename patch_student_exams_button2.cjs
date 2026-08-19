const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentExams.tsx', 'utf-8');

const targetStr = `        {(isOnlineTest && !isPast) && (
          <button 
            onClick={() => {
              if (canAttempt) {
                setTakingExam(exam);
              } else {
                toast.error(\`Siz ushbu testni \${maxAttempts} marta ishlagansiz. Boshqa urinish qolmadi.\`);
              }
            }}
            className={\`w-full mt-2 py-3 rounded-[12px] font-bold flex items-center justify-center gap-2 transition-colors border \${!canAttempt ? 'bg-white/5 text-white/30 border-white/5 cursor-not-allowed opacity-60' : attemptsCount > 0 ? 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10' : 'bg-[rgba(254,194,4,0.15)] text-[#FEC204] border-[#FEC204]/20 hover:bg-[rgba(254,194,4,0.25)]'}\`}
          >
            <MapPin size={16} className="hidden" /> {/* just to align imports */}
            {attemptsCount > 0 ? (
              canAttempt ? <>Qayta ishlash</> : <>Urinishlar tugagan</>
            ) : (
              <><span className="text-[18px] mb-1 leading-none">▶</span> Testni boshlash</>
            )}
          </button>
        )}`;

const newStr = `        {(isOnlineTest && !isPast) && (
          <button 
            onClick={() => {
              if (exam.status === 'ended') {
                toast.error("Ushbu imtihon admin tomonidan yakunlangan.");
              } else if (canAttempt) {
                setTakingExam(exam);
              } else {
                toast.error(\`Siz ushbu testni \${maxAttempts} marta ishlagansiz. Boshqa urinish qolmadi.\`);
              }
            }}
            className={\`w-full mt-2 py-3 rounded-[12px] font-bold flex items-center justify-center gap-2 transition-colors border \${(!canAttempt || exam.status === 'ended') ? 'bg-white/5 text-white/30 border-white/5 cursor-not-allowed opacity-60' : attemptsCount > 0 ? 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10' : 'bg-[rgba(254,194,4,0.15)] text-[#FEC204] border-[#FEC204]/20 hover:bg-[rgba(254,194,4,0.25)]'}\`}
          >
            <MapPin size={16} className="hidden" /> {/* just to align imports */}
            {exam.status === 'ended' ? (
              <>Yakunlangan</>
            ) : attemptsCount > 0 ? (
              canAttempt ? <>Qayta ishlash</> : <>Urinishlar tugagan</>
            ) : (
              <><span className="text-[18px] mb-1 leading-none">▶</span> Testni boshlash</>
            )}
          </button>
        )}`;

code = code.replace(targetStr, newStr);

fs.writeFileSync('src/pages/student/StudentExams.tsx', code);
