import re

with open('src/pages/admin/AdminAttendance.tsx', 'r') as f:
    content = f.read()

# Replace today constant with state
content = content.replace("const today = format(new Date(), 'yyyy-MM-dd');", """const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));""")

# Replace markAttendance and getStatus today with selectedDate
content = content.replace("a.date === today", "a.date === selectedDate")
content = content.replace("date: today", "date: selectedDate")

# Replace header block
header_old = """      <div className="flex justify-between items-end mb-2">
        <div className="flex items-center gap-3">
          {selectedGroupId && (
            <button onClick={() => setSelectedGroupId(null)} className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full transition-colors text-[color:var(--theme-text-primary)]">
              <ChevronLeft size={20} />
            </button>
          )}
          <div>
            <h2 className="text-[color:var(--theme-text-primary)] font-semibold">Kunlik Davomat {selectedGroup && `- ${selectedGroup.name}`}</h2>
          </div>
        </div>
        <span className="text-[color:var(--theme-text-primary)]/60 text-xs font-medium border border-[color:var(--glass-border)] px-3 py-1 rounded-full shrink-0">{today}</span>
      </div>"""

header_new = """      <div className="flex justify-between items-end mb-4">
        <div className="flex items-center gap-3">
          {selectedGroupId && (
            <button onClick={() => setSelectedGroupId(null)} className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full transition-colors text-[color:var(--theme-text-primary)]">
              <ChevronLeft size={20} />
            </button>
          )}
          <div>
            <h2 className="text-[color:var(--theme-text-primary)] font-semibold">Davomat {selectedGroup && `- ${selectedGroup.name}`}</h2>
          </div>
        </div>
        <input 
          type="date" 
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="bg-white/5 text-[color:var(--theme-text-primary)] text-xs font-medium border border-[color:var(--glass-border)] px-2 py-1.5 rounded-lg shrink-0 outline-none focus:border-[#FEC204]/50"
        />
      </div>"""

content = content.replace(header_old, header_new)

# Add "Hammasini keldi"
mark_all = """
  const handleMarkAllPresent = async () => {
    try {
      if (await confirm({ title: 'Diqqat', message: "Hamma belgilanmagan o'quvchilarni 'Keldi' qilib belgilaysizmi?" })) {
        for (const student of groupStudents) {
          const status = getStatus(student.id);
          if (!status) {
            await addDoc(collection(db, 'attendance'), {
              studentId: student.id,
              date: selectedDate,
              status: 'present',
              groupId: selectedGroupId
            });
          }
        }
        toast.success("Barchasi belgilandi");
      }
    } catch(e: any) {
      toast.error(e.message);
    }
  };
"""

content = content.replace("const groupStudents = students.filter(s => s.groupId === selectedGroupId);", mark_all + "\n  const groupStudents = students.filter(s => s.groupId === selectedGroupId);")

# Add button for "Hammasini keldi" above the list
group_list_start_old = """      ) : (
        <div className="space-y-3">
          {groupStudents.map(student => {"""

group_list_start_new = """      ) : (
        <div className="space-y-3">
          {groupStudents.length > 0 && groupStudents.some(s => !getStatus(s.id)) && (
            <div className="flex justify-end mb-2">
              <button onClick={handleMarkAllPresent} className="px-3 py-1.5 bg-[#FEC204]/10 text-[#FEC204] hover:bg-[#FEC204]/20 border border-[#FEC204]/20 rounded-lg text-xs font-bold transition-colors">
                Hammasini Keldi qilish
              </button>
            </div>
          )}
          {groupStudents.map(student => {"""

content = content.replace(group_list_start_old, group_list_start_new)

with open('src/pages/admin/AdminAttendance.tsx', 'w') as f:
    f.write(content)
