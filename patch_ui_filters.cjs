const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminTestsDatabase.tsx', 'utf-8');

const targetStr = `      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-black tracking-tight text-white mb-1">Testlar bazasi</h1>
          <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">Barcha yaratilgan testlar to'plami ({tests.length})</p>
        </div>
        <button 
          onClick={() => {
            setTestConfig({
              title: '',
              questionCount: 10,
              variantCount: 4,
              testType: 'Mavzulashtirilgan',
              maxAttempts: 1,
              questions: [],
              createdAt: ''
            });
            setIsTestConfigOpen(true);
          }}
          className="bg-[#FEC204] text-black px-6 py-2.5 rounded-[12px] font-bold hover:bg-[#FEC204]/90 transition-colors shadow-[0_0_15px_rgba(254,194,4,0.3)] flex items-center gap-2 text-[14px]"
        >
          <span className="text-xl leading-none">+</span> Test yaratish
        </button>
      </div>`;

const newStr = `      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-black tracking-tight text-white mb-1">Testlar bazasi</h1>
          <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">Barcha yaratilgan testlar to'plami ({tests.length})</p>
        </div>
        <button 
          onClick={() => {
            setTestConfig({
              title: '',
              questionCount: 10,
              variantCount: 4,
              testType: 'Mavzulashtirilgan',
              maxAttempts: 1,
              questions: [],
              createdAt: ''
            });
            setIsTestConfigOpen(true);
          }}
          className="bg-[#FEC204] text-black px-6 py-2.5 rounded-[12px] font-bold hover:bg-[#FEC204]/90 transition-colors shadow-[0_0_15px_rgba(254,194,4,0.3)] flex items-center gap-2 text-[14px]"
        >
          <span className="text-xl leading-none">+</span> Test yaratish
        </button>
      </div>
      
      {uniqueTypes.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
          {uniqueTypes.map((type, idx) => (
            <button
              key={idx}
              onClick={() => setFilterType(type)}
              className={\`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-colors border \${filterType === type ? 'bg-white/10 text-white border-white/20' : 'bg-white/5 text-white/50 border-white/5 hover:bg-white/10'}\`}
            >
              {type}
            </button>
          ))}
        </div>
      )}`;

code = code.replace(targetStr, newStr);

// Then change `tests.map` to `filteredTests.map`
code = code.replace(`{tests.map(t => (`, `{filteredTests.map(t => (`);
// And also check for empty state
code = code.replace(`{tests.length === 0 ? (`, `{filteredTests.length === 0 ? (`);

fs.writeFileSync('src/pages/admin/AdminTestsDatabase.tsx', code);
