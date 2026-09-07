const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentSAT.tsx', 'utf-8');

const targetHeader = `      <div>
        <h1 className="text-[20px] font-black text-white tracking-[-0.5px]">SAT Imtihonlar</h1>
        <p className="text-[12px] text-white/40 font-medium">Sizning kelgusi imtihon va olimpiadalaringiz</p>
      </div>
      {upcomingExams.length > 0 && (
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

const replacementHeader = `      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-[20px] font-black text-white tracking-[-0.5px]">SAT Baza</h1>
          <p className="text-[12px] text-white/40 font-medium">Sizning kelgusi imtihon va darslaringiz</p>
        </div>
        
        <div className="flex items-center gap-2 bg-[#1a1a1a] p-1 rounded-xl border border-white/5">
           <button 
             onClick={() => setActiveTab('lessons')}
             className={\`px-6 py-2.5 rounded-lg font-bold text-sm transition-all \${activeTab === 'lessons' ? 'bg-[#FEC204] text-black shadow-[0_0_10px_rgba(254,194,4,0.3)]' : 'text-white/60 hover:text-white hover:bg-white/5'}\`}
           >
             Darslar
           </button>
           <button 
             onClick={() => setActiveTab('exams')}
             className={\`px-6 py-2.5 rounded-lg font-bold text-sm transition-all \${activeTab === 'exams' ? 'bg-[#FEC204] text-black shadow-[0_0_10px_rgba(254,194,4,0.3)]' : 'text-white/60 hover:text-white hover:bg-white/5'}\`}
           >
             Imtihonlar
           </button>
        </div>
      </div>

      {activeTab === 'exams' ? (
        <>
          {upcomingExams.length > 0 && (
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
          )}
        </>
      ) : (
        <div className="glass-panel p-6 flex flex-col items-center justify-center opacity-70 border-dashed border-2 px-12 py-16">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <span className="text-[24px]">📚</span>
          </div>
          <h3 className="text-[18px] font-bold text-white mb-2">Hali darslar yo'q</h3>
          <p className="text-[13px] text-white/40 text-center max-w-sm font-medium">Bu bo'limga hali SAT darsliklari yuklanmagan.</p>
        </div>
      )}`;
code = code.replace(targetHeader, replacementHeader);

fs.writeFileSync('src/pages/student/StudentSAT.tsx', code);
