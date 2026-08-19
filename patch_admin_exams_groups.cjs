const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminExams.tsx', 'utf-8');

// Add state
code = code.replace(
  "  const [exams, setExams] = useState<Exam[]>([]);",
  "  const [exams, setExams] = useState<Exam[]>([]);\n  const [selectedGroupId, setSelectedGroupId] = useState<string | 'all'>('all');"
);

// Update filtering
code = code.replace(
  "  const filteredExams = exams.filter(ex => user?.role !== 'teacher' || !ex.groupId || teacherGroups.some(g => g.id === ex.groupId));",
  `  let filteredExams = exams.filter(ex => user?.role !== 'teacher' || !ex.groupId || teacherGroups.some(g => g.id === ex.groupId));
  if (selectedGroupId !== 'all') {
    filteredExams = filteredExams.filter(ex => selectedGroupId === 'global' ? !ex.groupId : ex.groupId === selectedGroupId);
  }`
);

// Add the tabs UI right after the header section
const headerEnd = `        </div>
      </div>`;
      
const tabsUI = `        </div>
      </div>

      {/* Guruhlar filtri */}
      <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
        <button
          onClick={() => setSelectedGroupId('all')}
          className={\`px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-colors \${selectedGroupId === 'all' ? 'bg-[#FEC204] text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}\`}
        >
          Barchasi
        </button>
        <button
          onClick={() => setSelectedGroupId('global')}
          className={\`px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-colors \${selectedGroupId === 'global' ? 'bg-[#FEC204] text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}\`}
        >
          Umumiy (Guruhsiz)
        </button>
        {teacherGroups.map(g => (
          <button
            key={g.id}
            onClick={() => setSelectedGroupId(g.id)}
            className={\`px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-colors \${selectedGroupId === g.id ? 'bg-[#FEC204] text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}\`}
          >
            {g.name}
          </button>
        ))}
      </div>`;

code = code.replace(headerEnd, tabsUI);

fs.writeFileSync('src/pages/admin/AdminExams.tsx', code);
