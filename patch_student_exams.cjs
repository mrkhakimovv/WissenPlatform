const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentExams.tsx', 'utf-8');

code = code.replace(
  "    const canAttempt = attemptsCount < maxAttempts;",
  "    const canAttempt = attemptsCount < maxAttempts && exam.status !== 'ended';"
);

// Also we might want to change the text displayed to the student if the exam is ended
const targetIsOnline = `        {isOnlineTest ? (
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2">
            <button 
              onClick={() => {
                if(canAttempt) setTakingExam(exam);
                else toast.error("Barcha urinishlardan foydalangansiz");
              }}
              className={\`w-full py-3 rounded-[12px] font-bold text-[13px] transition-colors flex justify-center items-center gap-2 \${canAttempt ? 'bg-[#FEC204] text-black hover:bg-[#FEC204]/90' : 'bg-white/5 text-white/40 cursor-not-allowed'}\`}
            >
              {canAttempt ? 'Testni ishlash' : 'Yakunlangan'}
            </button>`;
            
// Wait, let's see how the button is actually rendered first.
