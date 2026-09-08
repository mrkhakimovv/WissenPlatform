const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentSAT.tsx', 'utf-8');

const examsUI = `      {upcomingExams.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-[13px] font-bold text-white/60 uppercase tracking-wider">Kelgusi SAT Imtihonlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingExams.map(exam => renderExamCard(exam, false))}
          </div>
        </div>
      )}
      {pastExams.length > 0 && (
        <div className="space-y-4 mt-8">
          <h2 className="text-[13px] font-bold text-white/60 uppercase tracking-wider">O'tgan SAT Imtihonlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastExams.map(exam => renderExamCard(exam, true))}
          </div>
        </div>
      )}
      {exams.length === 0 && (
        <div className="glass-panel p-6 flex flex-col items-center justify-center opacity-70 border-dashed border-2 px-12 py-16">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <span className="text-[24px]">📝</span>
          </div>
          <h3 className="text-[18px] font-bold text-white mb-2">Hali imtihonlar yo'q</h3>
          <p className="text-[13px] text-white/40 text-center max-w-sm font-medium">Sizning guruhlaringiz uchun hali imtihonlar belgilanmagan.</p>
        </div>
      )}`;

const replacement = `      {activeTab === 'exams' ? (
        <>
${examsUI}
        </>
      ) : (
        <div className="glass-panel p-6 flex flex-col items-center justify-center opacity-70 border-dashed border-2 px-12 py-16">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <span className="text-[24px]">🎥</span>
          </div>
          <h3 className="text-[18px] font-bold text-white mb-2">Hali darslar yo'q</h3>
          <p className="text-[13px] text-white/40 text-center max-w-sm font-medium">Hozircha markaz tomonidan sizga SAT darslari va videokurslari biriktirilmagan.</p>
        </div>
      )}`;

code = code.replace(examsUI, replacement);
fs.writeFileSync('src/pages/student/StudentSAT.tsx', code);
console.log('Successfully patched StudentSAT.tsx!');
