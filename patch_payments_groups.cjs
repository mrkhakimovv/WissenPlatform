const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminPayments.tsx', 'utf-8');

const target1 = `const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');`;

const replacement1 = `const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState<string>('all');`;

const target2 = `<select value={filterYear} onChange={e=>setFilterYear(Number(e.target.value))} className="glass-panel py-2 px-3 outline-none text-sm text-[color:var(--theme-text-primary)] rounded-xl border border-white/10" style={{ colorScheme: "dark" }}>
                  {years.map(y => <option key={y} value={y} className="bg-[#1a1a1a]">{y}</option>)}
                </select>
             </div>`;

const replacement2 = `<select value={filterGroup} onChange={e=>setFilterGroup(e.target.value)} className="glass-panel py-2 px-3 outline-none text-sm text-[color:var(--theme-text-primary)] rounded-xl border border-white/10" style={{ colorScheme: "dark" }}>
                  <option value="all" className="bg-[#1a1a1a]">Barcha guruhlar</option>
                  {groups.map(g => <option key={g.id} value={g.id} className="bg-[#1a1a1a]">{g.name}</option>)}
                </select>
                <select value={filterYear} onChange={e=>setFilterYear(Number(e.target.value))} className="glass-panel py-2 px-3 outline-none text-sm text-[color:var(--theme-text-primary)] rounded-xl border border-white/10" style={{ colorScheme: "dark" }}>
                  {years.map(y => <option key={y} value={y} className="bg-[#1a1a1a]">{y}</option>)}
                </select>
             </div>`;

const target3 = `{activeStudents
        .filter(s => searchTerm === '' || s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {`;

const replacement3 = `{activeStudents
        .filter(s => {
           if (searchTerm !== '' && !s.fullName?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
           if (filterGroup !== 'all') {
              if (s.groups && Array.isArray(s.groups)) {
                 if (!s.groups.includes(filterGroup)) return false;
              } else if (s.groupId) {
                 if (s.groupId !== filterGroup) return false;
              } else {
                 return false;
              }
           }
           return true;
        })
        .sort((a, b) => {`;

code = code.replace(target1, replacement1);
code = code.replace(target2, replacement2);
code = code.replace(target3, replacement3);
fs.writeFileSync('src/pages/admin/AdminPayments.tsx', code);
