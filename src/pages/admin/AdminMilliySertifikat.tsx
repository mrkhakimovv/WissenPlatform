import React, { useState, useEffect } from 'react';
import { TestData, Group, Exam } from '../../types';
import { Trash2, Edit2, Copy, FileText, X, Award, BarChart2 } from 'lucide-react';
import { collection, doc, deleteDoc, addDoc, updateDoc, onSnapshot, query, orderBy, getDocs, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useConfirm } from '../../contexts/ConfirmContext';
import toast from 'react-hot-toast';
import AdminCertificateBuilder from './AdminCertificateBuilder';
import AdminCertificateResults from './AdminCertificateResults';
import { useAuth } from '../../contexts/AuthContext';
import { computeRaschReport, dedupeBestAttempts } from '../../lib/rasch';

export default function AdminMilliySertifikat() {
  const { user } = useAuth();
  const { confirm } = useConfirm();

  const [tests, setTests] = useState<(TestData & { id?: string })[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [viewingResultsFor, setViewingResultsFor] = useState<Exam | null>(null);
  const [editingTest, setEditingTest] = useState<TestData & { id?: string } | null>(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isCreationModeModalOpen, setIsCreationModeModalOpen] = useState(false);
  const [assigningTest, setAssigningTest] = useState<TestData & { id?: string } | null>(null);
  const [assignForm, setAssignForm] = useState({ title: '', subject: '', date: '', startTime: '', duration: '120', groupIds: [] as string[] });

  // Fetch Tests
  useEffect(() => {
    const q = query(collection(db, 'tests'), where('format', '==', 'rasch'));
    const unsub = onSnapshot(q, (snap) => {
      const data: any[] = [];
      snap.forEach(d => data.push({ id: d.id, ...d.data() }));
      setTests(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    });
    return unsub;
  }, []);

  // Fetch Exams
  useEffect(() => {
    const q = query(collection(db, 'exams'), where('examType', '==', 'certificate'));
    const unsub = onSnapshot(q, (snap) => {
      const data: any[] = [];
      snap.forEach(d => data.push({ id: d.id, ...d.data() }));
      setExams(data.sort((a, b) => new Date(b.date + 'T' + b.startTime).getTime() - new Date(a.date + 'T' + a.startTime).getTime()));
    });
    return unsub;
  }, []);

  // Fetch Groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const snap = await getDocs(collection(db, 'groups'));
        const g: Group[] = [];
        snap.forEach(d => g.push({ id: d.id, ...d.data() } as Group));
        setGroups(g);
      } catch (err) {
        console.error('Groups fetch error:', err);
      }
    };
    fetchGroups();
  }, []);

  const handleCreateTest = () => {
    setIsCreationModeModalOpen(true);
  };

  const handleStartCreation = (isFastMode: boolean) => {
    setEditingTest({
      title: 'Yangi Sertifikat Testi',
      questionCount: 45,
      variantCount: 0,
      testType: 'Milliy Sertifikat',
      format: 'rasch',
      isFastMode,
      questions: [],
      createdAt: new Date().toISOString()
    } as any);
    setIsCreationModeModalOpen(false);
    setIsBuilderOpen(true);
  };

  const handleEditTest = (t: TestData & { id?: string }) => {
    setEditingTest(t);
    setIsBuilderOpen(true);
  };

  const handleDeleteTest = async (id?: string) => {
    if (!id) return;
    if (await confirm({ title: "Diqqat", message: "Haqiqatan ham bu testni o.chirmoqchimisiz? Barcha ma.lumotlar yo.qoladi." })) {
      try {
        await deleteDoc(doc(db, 'tests', id));
        toast.success("Test o'chirildi");
      } catch (e) {
        toast.error("Xatolik yuz berdi");
      }
    }
  };

  const handleAssignClick = (t: TestData & { id?: string }) => {
    setAssigningTest(t);
    setAssignForm({ title: t.title + ' Imtihoni', subject: 'Matematika', date: '', startTime: '', duration: '120', groupIds: [] });
    setIsAssignModalOpen(true);
  };

  const toggleGroup = (groupId: string) => {
    setAssignForm(prev => {
      if (prev.groupIds.includes(groupId)) {
        return { ...prev, groupIds: prev.groupIds.filter(id => id !== groupId) };
      } else {
        return { ...prev, groupIds: [...prev.groupIds, groupId] };
      }
    });
  };

  const handleAssignSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningTest || !assigningTest.id || !assignForm.title || !assignForm.subject || !assignForm.date || !assignForm.startTime || !assignForm.duration || assignForm.groupIds.length === 0) {
      toast.error("Barcha maydonlarni to'ldiring");
      return;
    }

    try {
      await addDoc(collection(db, 'exams'), {
        title: assignForm.title,
        subject: assignForm.subject,
        testId: assigningTest.id,
        groupIds: assignForm.groupIds,
        date: assignForm.date,
        startTime: assignForm.startTime,
        duration: parseInt(assignForm.duration),
        examType: 'certificate',
        status: 'active',
        createdAt: new Date().toISOString()
      });
      toast.success("Sertifikat imtihoni yaratildi!");
      setIsAssignModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Xatolik yuz berdi");
    }
  };

  const handleDeleteExam = async (id: string) => {
    if (await confirm({ title: "Diqqat", message: "Haqiqatan ham bu imtihonni o.chirmoqchimisiz?" })) {
      try {
        await deleteDoc(doc(db, 'exams', id));
        toast.success("Imtihon o'chirildi");
      } catch (e) {
        toast.error("Xatolik");
      }
    }
  };

  // Imtihonni yakunlash: barcha natijalar bo'yicha Rasch hisoboti bir marta
  // hisoblanadi va imtihon hujjatiga muzlatiladi (keyin o'zgarmaydi).
  const handleFinalizeExam = async (exam: Exam) => {
    const ok = await confirm({
      title: "Imtihonni yakunlash",
      message: "Yakunlangach natijalar muzlatiladi va o'quvchilarga ko'rinadi. Davom etilsinmi?",
    });
    if (!ok) return;
    try {
      const snap = await getDocs(query(collection(db, 'exam_results'), where('examId', '==', exam.id)));
      const all = snap.docs.map(d => d.data());
      const best = dedupeBestAttempts(all.filter((r: any) => Array.isArray(r.raschItems) && r.raschItems.length > 0));
      if (best.length === 0) {
        toast.error("Baholanadigan natija yo'q (topshiruv topilmadi).");
        return;
      }
      const numItems = best[0].raschItems.length;
      const validResults = best.filter((r: any) => r.raschItems.length === numItems);

      const matrix = validResults.map((r: any) => ({ studentId: r.studentId, studentName: r.studentName, items: r.raschItems }));
      const report = computeRaschReport(matrix);
      await updateDoc(doc(db, 'exams', exam.id), {
        status: 'ended',
        finalizedAt: new Date().toISOString(),
        raschReport: report,
      });
      toast.success(`Imtihon yakunlandi (${best.length} o'quvchi baholandi).`);
    } catch (e) {
      console.error(e);
      toast.error("Yakunlashda xatolik");
    }
  };

  // Yakunlangan imtihonni qayta ochish (natijalarni yangilash uchun)
  const handleReopenExam = async (exam: Exam) => {
    const ok = await confirm({ title: "Qayta ochish", message: "Imtihon qayta faollashadi va natijalar yangilanishi mumkin. Davom etilsinmi?" });
    if (!ok) return;
    try {
      await updateDoc(doc(db, 'exams', exam.id), { status: 'active' });
      toast.success("Imtihon qayta ochildi");
    } catch (e) {
      toast.error("Xatolik");
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8">
      {/* Testlar section */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Award className="text-[#FEC204]" /> Milliy Sertifikat Testlari (Rasch)
            </h2>
            <p className="text-white/50 text-sm mt-1">Sertifikat imtihonlari uchun 45-savollik bazalar</p>
          </div>
          <button onClick={handleCreateTest} className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#FEC204] text-black font-bold hover:opacity-90 transition-opacity">
            + Yangi Test Yaratish
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tests.length === 0 ? (
            <div className="col-span-full glass-panel p-8 text-center text-white/50 rounded-2xl">
              Hozircha testlar yo'q
            </div>
          ) : (
            tests.map(test => (
              <div key={test.id} className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col h-full">
                <div className="flex-1">
                  <h3 className="font-bold text-white text-lg mb-1">{test.title}</h3>
                  <div className="flex flex-col gap-1 text-sm text-white/60 mb-4">
                    <span>45 ta savol (55 birlik)</span>
                    <span>Yaratildi: {new Date(test.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                  <button onClick={() => handleAssignClick(test)} className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg text-sm font-bold transition-colors">
                    Imtihon yaratish
                  </button>
                  <button onClick={() => handleEditTest(test)} className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDeleteTest(test.id)} className="p-2 bg-white/5 hover:bg-red-500/20 text-white hover:text-red-500 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <hr className="border-white/10" />

      {/* Exams section */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart2 className="text-blue-400" /> Faol va Yakunlangan Sertifikat Imtihonlari
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {exams.length === 0 ? (
             <div className="col-span-full glass-panel p-8 text-center text-white/50 rounded-2xl">
                Imtihonlar yo'q
             </div>
          ) : (
             exams.map(exam => {
               const examTest = tests.find(t => t.id === exam.testId);
               return (
                 <div key={exam.id} className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
                   <div>
                     <div className="flex justify-between items-start mb-2">
                       <div>
                         <h3 className="font-bold text-white text-lg">{exam.title}</h3>
                         <p className="text-[#FEC204] text-sm font-bold">{exam.subject}</p>
                       </div>
                       {exam.status === 'ended' ? (
                         <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-bold">Yakunlangan</span>
                       ) : (
                         <span className="px-2 py-1 bg-[#FEC204]/20 text-[#FEC204] rounded text-xs font-bold">Faol</span>
                       )}
                     </div>
                     <div className="text-sm text-white/60 space-y-1 my-3">
                       <p>Guruhlar: {exam.groupIds?.length || 0} ta guruhga biriktirilgan</p>
                       <p>Sana: {exam.date} {exam.startTime}</p>
                       <p>Davomiyligi: {exam.duration} daqiqa</p>
                       {exam.status === 'ended' && exam.raschReport?.stats && (
                         <p className="text-green-400/80">Baholangan: {exam.raschReport.stats.n} o'quvchi</p>
                       )}
                     </div>
                   </div>

                   <div className="flex gap-2 mt-2 pt-4 border-t border-white/5">
                     <button onClick={() => setViewingResultsFor(exam)} className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-2 rounded-lg text-sm font-bold transition-colors">
                       Natijalar
                     </button>
                     {exam.status === 'ended' ? (
                       <button onClick={() => handleReopenExam(exam)} className="px-3 bg-white/5 hover:bg-white/10 text-white/70 py-2 rounded-lg text-sm font-bold transition-colors">
                         Qayta ochish
                       </button>
                     ) : (
                       <button onClick={() => handleFinalizeExam(exam)} className="px-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 py-2 rounded-lg text-sm font-bold transition-colors">
                         Yakunlash
                       </button>
                     )}
                     <button onClick={() => handleDeleteExam(exam.id)} className="p-2 bg-white/5 hover:bg-red-500/20 text-white hover:text-red-500 rounded-lg transition-colors">
                       <Trash2 size={18} />
                     </button>
                   </div>
                 </div>
               );
             })
          )}
        </div>
      </div>

      {isBuilderOpen && editingTest && (
        <AdminCertificateBuilder
          initialData={editingTest}
          onClose={() => { setIsBuilderOpen(false); setEditingTest(null); }}
          onSave={() => { setIsBuilderOpen(false); setEditingTest(null); }}
        />
      )}

      {viewingResultsFor && <AdminCertificateResults exam={viewingResultsFor} onClose={() => setViewingResultsFor(null)} />}

      {isCreationModeModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Test kiritish usuli</h3>
                <button onClick={() => setIsCreationModeModalOpen(false)} className="text-white/50 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <button onClick={() => handleStartCreation(false)} className="w-full text-left p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors group relative overflow-hidden">
                  <div className="font-bold text-white text-lg mb-1 group-hover:text-[#FEC204] transition-colors">To'liq (Savol + Javob)</div>
                  <div className="text-sm text-white/50">Testning to'liq savol va javoblarini kiritish orqali haqiqiy onlayn test varaqasini yaratish.</div>
                </button>
                <button onClick={() => handleStartCreation(true)} className="w-full text-left p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors group relative overflow-hidden">
                  <div className="font-bold text-white text-lg mb-1 group-hover:text-[#FEC204] transition-colors">Faqat javoblar (Tezkor)</div>
                  <div className="text-sm text-white/50">Javoblar varaqasi shaklida faqat to'g'ri kalitlarni va matnlarni kiritish. O'quvchilar javoblarini tekshirish uchun.</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {isAssignModalOpen && assigningTest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Sertifikat Imtihonini Yaratish</h3>
                <button onClick={() => setIsAssignModalOpen(false)} className="text-white/50 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleAssignSave} className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-white/70 block mb-1">Imtihon nomi</label>
                  <input type="text" value={assignForm.title} onChange={e => setAssignForm({...assignForm, title: e.target.value})} className="w-full glass-panel p-3 outline-none text-white focus:border-[#FEC204]/50 text-sm rounded-xl" required />
                </div>
                <div>
                  <label className="text-sm font-bold text-white/70 block mb-1">Fani (Subject)</label>
                  <input type="text" value={assignForm.subject} onChange={e => setAssignForm({...assignForm, subject: e.target.value})} className="w-full glass-panel p-3 outline-none text-white focus:border-[#FEC204]/50 text-sm rounded-xl" placeholder="Matematika" required />
                </div>

                <div>
                  <label className="text-sm font-bold text-white/70 block mb-1">Guruhlar (Biriktirish)</label>
                  <div className="glass-panel p-3 rounded-xl h-32 overflow-y-auto custom-scrollbar flex flex-col gap-2 border border-white/10">
                    {groups.map(g => (
                      <label key={g.id} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={assignForm.groupIds.includes(g.id)} onChange={() => toggleGroup(g.id)} className="accent-[#FEC204]" />
                        <span className="text-sm text-white/80">{g.name} ({g.subject})</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-white/70 block mb-1">Sana</label>
                    <input type="date" value={assignForm.date} onChange={e => setAssignForm({...assignForm, date: e.target.value})} className="w-full glass-panel p-3 outline-none text-white focus:border-[#FEC204]/50 text-sm rounded-xl [color-scheme:dark]" required />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-white/70 block mb-1">Boshlanish vaqti</label>
                    <input type="time" value={assignForm.startTime} onChange={e => setAssignForm({...assignForm, startTime: e.target.value})} className="w-full glass-panel p-3 outline-none text-white focus:border-[#FEC204]/50 text-sm rounded-xl [color-scheme:dark]" required />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-white/70 block mb-1">Davomiyligi (daqiqa)</label>
                  <input type="number" min="1" value={assignForm.duration} onChange={e => setAssignForm({...assignForm, duration: e.target.value})} className="w-full glass-panel p-3 outline-none text-white focus:border-[#FEC204]/50 text-sm rounded-xl" required />
                </div>

                <button type="submit" className="w-full py-3 bg-[#FEC204] text-black font-bold rounded-xl mt-4 hover:opacity-90">
                  Imtihonni Yaratish
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}