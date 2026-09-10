const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf-8');

const oldInterval = `  useEffect(() => {
    if (loading || submitted || !hasStarted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (handleSubmitRef.current) {
            handleSubmitRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, submitted, hasStarted]);`;

const newInterval = `  useEffect(() => {
    if (loading || submitted || !hasStarted || exam.duration === 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (handleSubmitRef.current) {
            handleSubmitRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, submitted, hasStarted, exam.duration]);`;

code = code.replace(oldInterval, newInterval);

const oldTimeDisplay = `          <div className="flex flex-col items-end">
            <span className="text-[10px] md:text-[11px] font-bold text-white/40 uppercase tracking-widest">Qolgan vaqt</span>
            <span className={\`text-[16px] md:text-[18px] font-black \${timeLeft < 300 ? 'text-red-400' : 'text-[#FEC204]'}\`}>
              {m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}
            </span>
          </div>`;

const newTimeDisplay = `          <div className="flex flex-col items-end">
            <span className="text-[10px] md:text-[11px] font-bold text-white/40 uppercase tracking-widest">{exam.duration === 0 ? 'Vaqt' : 'Qolgan vaqt'}</span>
            <span className={\`text-[16px] md:text-[18px] font-black \${(exam.duration > 0 && timeLeft < 300) ? 'text-red-400' : 'text-[#FEC204]'}\`}>
              {exam.duration === 0 ? 'Cheklanmagan' : \`\${m.toString().padStart(2, '0')}:\${s.toString().padStart(2, '0')}\`}
            </span>
          </div>`;

code = code.replace(oldTimeDisplay, newTimeDisplay);

fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
