const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminMilliySertifikat.tsx', 'utf8');

const target1 = `  const toggleGroup = (groupId: string) => {`;
const replace1 = `  const toggleAllGroups = () => {
    setAssignForm(prev => {
      if (prev.groupIds.length === groups.length && groups.length > 0) {
        return { ...prev, groupIds: [] }; // Deselect all
      } else {
        return { ...prev, groupIds: groups.map(g => g.id) }; // Select all
      }
    });
  };

  const toggleGroup = (groupId: string) => {`;

if(code.includes(target1) && !code.includes('toggleAllGroups')) {
    code = code.replace(target1, replace1);
}

const target2 = `<label className="text-sm font-bold text-white/70 block mb-1">Guruhlar (Biriktirish)</label>
                  <div className="glass-panel p-3 rounded-xl h-32 overflow-y-auto custom-scrollbar flex flex-col gap-2 border border-white/10">`;

const replace2 = `<label className="text-sm font-bold text-white/70 flex justify-between items-center mb-1">
                    <span>Guruhlar (Biriktirish)</span>
                  </label>
                  <div className="glass-panel p-3 rounded-xl h-32 overflow-y-auto custom-scrollbar flex flex-col gap-2 border border-white/10">
                    <label className="flex items-center gap-2 cursor-pointer pb-2 border-b border-white/10 mb-1">
                      <input 
                        type="checkbox" 
                        checked={groups.length > 0 && assignForm.groupIds.length === groups.length} 
                        onChange={toggleAllGroups} 
                        className="accent-[#FEC204]" 
                      />
                      <span className="text-sm font-bold text-white">Barchasi (Barcha guruhlarni belgilash)</span>
                    </label>`;

if (code.includes(target2) && !code.includes('Barchasi (Barcha guruhlarni belgilash)')) {
    code = code.replace(target2, replace2);
}

fs.writeFileSync('src/pages/admin/AdminMilliySertifikat.tsx', code);
console.log("Patched all groups toggle");
