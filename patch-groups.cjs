const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminGroups.tsx', 'utf-8');

// Add monthlyFee to initial state
code = code.replace(
  "schedule: {} as Record<string, {startTime: string, endTime: string}>",
  "schedule: {} as Record<string, {startTime: string, endTime: string}>,\n    monthlyFee: ''"
);

// Add monthlyFee to openEdit
code = code.replace(
  "schedule: group.schedule || {}",
  "schedule: group.schedule || {},\n      monthlyFee: group.monthlyFee || ''"
);

// Add monthlyFee reset in handleSave
code = code.replace(
  "setFormData({ name: '', subject: '', teacherName: '', days: [], startTime: '', endTime: '', schedule: {} });",
  "setFormData({ name: '', subject: '', teacherName: '', days: [], startTime: '', endTime: '', schedule: {}, monthlyFee: '' });"
);

// Update students' monthly fee in handleSave
code = code.replace(
  "await updateDoc(doc(db, 'groups', editingGroup.id), formData);",
  `await updateDoc(doc(db, 'groups', editingGroup.id), formData);
        
        // Update all students in this group
        if (formData.monthlyFee && Number(formData.monthlyFee) > 0) {
          const groupStudents = students.filter(s => s.groups?.includes(editingGroup.id) || s.groupId === editingGroup.id);
          const promises = groupStudents.map(student => 
             updateDoc(doc(db, 'users', student.id), { monthlyFee: Number(formData.monthlyFee) })
          );
          await Promise.all(promises);
        }`
);

// Same for new group - wait, we don't have an ID for new group until we create it.
code = code.replace(
  `        await addDoc(collection(db, 'groups'), {
          ...formData,
          createdAt: new Date().toISOString()
        });
        toast.success("Guruh qo'shildi");`,
  `        const newGroupRef = await addDoc(collection(db, 'groups'), {
          ...formData,
          createdAt: new Date().toISOString()
        });
        // (New groups don't have students yet, so no need to update students)
        toast.success("Guruh qo'shildi");`
);

// Add the input field to the form
code = code.replace(
  `<input placeholder="Guruh nomi" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30" />`,
  `<input placeholder="Guruh nomi" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30" />
              
              <input type="number" placeholder="Oylik to'lov summasi (so'm)" value={formData.monthlyFee} onChange={e=>setFormData({...formData, monthlyFee: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30" />`
);

fs.writeFileSync('src/pages/admin/AdminGroups.tsx', code);
