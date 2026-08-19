const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminExams.tsx', 'utf-8');

const endExamCode = `  const handleEndExam = async (exam: any) => {
    if (exam.status === 'ended') {
      toast.error('Ushbu imtihon allaqachon yakunlangan!');
      return;
    }
    if (await confirm({ title: 'Diqqat', message: "Imtihonni yakunlashni tasdiqlaysizmi? Yakunlangandan so'ng o'quvchilar bu imtihonni ishlay olmaydi." })) {
      try {
        await updateDoc(doc(db, 'exams', exam.id), { status: 'ended' });
        toast.success('Imtihon yakunlandi');
      } catch (err: any) {
        toast.error(err.message || 'Xatolik yuz berdi');
      }
    }
  };

  const handleDelete = async (id: string) => {`;

code = code.replace("  const handleDelete = async (id: string) => {", endExamCode);

const buttonsCode = `              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {exam.status !== 'ended' && (
                  <button onClick={(e) => { e.stopPropagation(); handleEndExam(exam); }} className="px-3 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors text-xs font-bold">
                    Yakunlash
                  </button>
                )}
                {exam.status === 'ended' && (
                  <span className="px-3 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 text-xs font-bold">
                    Yakunlangan
                  </span>
                )}
                <button onClick={(e) => { e.stopPropagation(); openEdit(exam); }} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors">
                  <Edit2 size={14} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(exam.id); }} className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>`;
              
code = code.replace(/<div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">[\s\S]*?<\/div>/, buttonsCode);

fs.writeFileSync('src/pages/admin/AdminExams.tsx', code);
