const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminGroups.tsx', 'utf-8');

const target = `<input type="number" placeholder="Oylik to'lov summasi (so'm)" value={formData.monthlyFee} onChange={e=>setFormData({...formData, monthlyFee: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30" />`;
const replacement = `<input type="number" onWheel={(e) => (e.target as HTMLInputElement).blur()} placeholder="Oylik to'lov summasi (so'm)" value={formData.monthlyFee} onChange={e=>setFormData({...formData, monthlyFee: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30" />`;

if(code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/pages/admin/AdminGroups.tsx', code);
    console.log("Updated AdminGroups.tsx");
} else {
    console.log("Target not found");
}
