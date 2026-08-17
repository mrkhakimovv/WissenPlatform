import React, { useState, useEffect } from 'react';
import { TestData, Group, Exam } from '../../types';
import { Trash2, Edit2, Copy, FileText, X, Calendar } from 'lucide-react';
import { collection, doc, deleteDoc, addDoc, updateDoc, onSnapshot, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useConfirm } from '../../contexts/ConfirmContext';
import toast from 'react-hot-toast';
import AdminSATBuilder from './AdminSATBuilder';

export default function AdminSATDatabase() {
  const { confirm } = useConfirm();
  const [tests, setTests] = useState<TestData[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [satExams, setSatExams] = useState<Exam[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningTest, setAssigningTest] = useState<TestData | null>(null);
  const [assignForm, setAssignForm] = useState({ groupId: '', date: '', startTime: '', duration: '60' });

  // SAT Exam form states
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [examEditingId, setExamEditingId] = useState<string | null>(null);
  const [examFormData, setExamFormData] = useState({
    title: '',
    subject: '',
    groupId: '',
    date: '',
    startTime: '',
    duration: '',
    location: '',
    description: '',
    testSources: [] as {testId: string, name: string, count: number}[]
  });

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

    const unsubSubjects = onSnapshot(collection(db, 'subjects'), snap => {
      setSubjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubExams = onSnapshot(query(collection(db, 'exams'), orderBy('createdAt', 'desc')), snap => {
      const allExams = snap.docs.map(d => ({ id: d.id, ...d.data() } as Exam));
      setSatExams(allExams.filter(e => e.examType === 'sat'));
    });

    return () => { unsubSubjects(); unsubExams(); };
  }, []);

  const handleAssignClick = (t: TestData) => {
    setAssigningTest(t);
    setAssignForm({ groupId: '', date: '', startTime: '', duration: '60' });
    setIsAssignModalOpen(true);
  };

  const handleAssignSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningTest || !assignForm.groupId || !assignForm.date || !assignForm.startTime || !assignForm.duration) {
      toast.error("Barcha maydonlarni to'ldiring");
      return;
    }
    
    try {
      await addDoc(collection(db, 'exams'), {
        title: assigningTest.title,
        subject: assigningTest.testType || 'Online Test',
        groupId: assignForm.groupId,
        date: assignForm.date,
        startTime: assignForm.startTime,
        duration: Number(assignForm.duration),
        location: 'Online',
        description: assigningTest.title + ' (Online)',
        testId: assigningTest.id,
        isOnline: true,
        examType: 'sat',
        createdAt: new Date().toISOString()
      });
      toast.success("Online test guruhga biriktirildi!");
      setIsAssignModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Xatolik yuz berdi");
    }
  };

  const openExamAdd = () => {
    setExamEditingId(null);
    setExamFormData({ title: '', subject: '', groupId: '', date: '', startTime: '', duration: '', location: '', description: '', testSources: [] });
    setIsExamModalOpen(true);
  };

  const openExamEdit = (exam: Exam) => {
    setExamEditingId(exam.id);
    setExamFormData({
      title: exam.title,
      subject: exam.subject,
      groupId: exam.groupId || '',
      date: exam.date,
      startTime: exam.startTime,
      duration: exam.duration.toString(),
      location: exam.location,
      description: exam.description || '', testSources: exam.testSources || []});
    setIsExamModalOpen(true);
  };

  const handleExamDelete = async (id: string) => {
    if (await confirm({ title: 'Diqqat', message: "Imtihonni o'chirishni tasdiqlaysizmi?" })) {
      try {
        await deleteDoc(doc(db, 'exams', id));
        toast.success("O'chirildi");
      } catch (err) {
      console.error('Kontekst:', err);
      const msg = err instanceof Error ? err.message : "Noma'lum xatolik";
      toast.error(msg);
    }
    }
  };

  const handleExamSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSave = {
        ...examFormData,
        duration: Number(examFormData.duration),
        examType: 'sat'
      };
      
      if (examEditingId) {
        await updateDoc(doc(db, 'exams', examEditingId), dataToSave);
        toast.success("Yangilandi");
      } else {
        await addDoc(collection(db, 'exams'), { ...dataToSave, createdAt: new Date().toISOString() });
        toast.success("Yaratildi");
      }
      setIsExamModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Xatolik");
    }
  };

  const getGroupName = (gId?: string) => {
    if (!gId) return 'Barcha uchun';
    return groups.find(g => g.id === gId)?.name || 'Noma\'lum guruh';
  };

  const [isTestBuilderOpen, setIsTestBuilderOpen] = useState(false);
  const [testConfig, setTestConfig] = useState<TestData>({
    title: '',
    questionCount: 10,
    variantCount: 4,
    testType: 'sat',
    satType: 'SAT Mavzulashtirilgan',
    questions: [],
    createdAt: ''
  });
  const [isTestConfigOpen, setIsTestConfigOpen] = useState(false);
  const [existingTests, setExistingTests] = useState<string[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'tests'), snap => {
      const testsArr: TestData[] = [];
      const titles = new Set<string>();
      snap.docs.forEach(d => {
        testsArr.push({ id: d.id, ...d.data() } as TestData);
        if (d.data().title) titles.add(d.data().title);
      });
      setExistingTests(Array.from(titles));
      // Sort by createdAt descending locally if not using query orderBy due to missing index
      testsArr.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setTests(testsArr.filter(t => t.testType === 'sat'));
    }, err => {
      console.error('Error fetching tests:', err);
    });
    return () => unsub();
  }, []);

  const handleDelete = async (id: string) => {
    if (await confirm({ title: 'Diqqat', message: "Testni o'chirishni tasdiqlaysizmi?" })) {
      try {
        await deleteDoc(doc(db, 'tests', id));
        toast.success("O'chirildi");
      } catch (err) {
        console.error(err);
        toast.error("Xatolik yuz berdi");
      }
    }
  };

  const handleEdit = (t: TestData) => {
    setTestConfig(t);
    setIsTestBuilderOpen(true);
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-black tracking-tight text-white mb-1">SAT BAZA</h1>
          <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">Barcha yaratilgan testlar to'plami ({tests.length})</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              setTestConfig({
                title: '',
                questionCount: 10,
                variantCount: 4,
                testType: 'sat',
                satType: 'SAT Mavzulashtirilgan',
                questions: [],
                createdAt: ''
              });
              setIsTestConfigOpen(true);
            }}
            className="bg-[#FEC204] text-black px-6 py-2.5 rounded-[12px] font-bold hover:bg-[#FEC204]/90 transition-colors shadow-[0_0_15px_rgba(254,194,4,0.3)] flex items-center gap-2 text-[14px]"
          >
            <span className="text-xl leading-none">+</span> Test yaratish
          </button>
          <button onClick={openExamAdd} className="glass-panel px-6 py-3 font-bold text-[#FEC204] hover:bg-[#FEC204] hover:text-black transition-colors rounded-[12px]">
            Sat online test
          </button>
        </div>
      </div>

      {tests.length === 0 ? (
        <div className="glass-panel p-6 flex flex-col items-center justify-center opacity-70 border-dashed border-2 px-12 py-16">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <span className="text-[24px]">📁</span>
          </div>
          <h3 className="text-[18px] font-bold text-white mb-2">Baza bo'sh</h3>
          <p className="text-[13px] text-white/40 text-center max-w-sm font-medium">Hozircha hech qanday test yaratilmagan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tests.map(t => (
            <div key={t.id} className="glass-panel p-5 relative group border border-white/5 hover:border-white/10 transition-colors rounded-[16px]">
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleAssignClick(t)} className="h-8 px-3 rounded-lg bg-[rgba(254,194,4,0.15)] text-[#FEC204] hover:bg-[rgba(254,194,4,0.25)] flex items-center gap-1.5 transition-colors font-bold text-xs" title="Online test olish">
                  <FileText size={14} />
                  <span>Test olish</span>
                </button>
                <button onClick={() => handleEdit(t)} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors" title="Tahrirlash">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(t.id!)} className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors" title="O'chirish">
                  <Trash2 size={14} />
                </button>
              </div>
              <h3 className="text-white font-bold text-lg pr-20 mb-3">{t.title}</h3>
              
              <div className="flex gap-4 text-xs font-bold">
                <div className="flex flex-col gap-1">
                  <span className="text-white/40 uppercase text-[9px] tracking-wider">Savollar</span>
                  <span className="text-white">{t.questions?.length || t.questionCount} ta</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-white/40 uppercase text-[9px] tracking-wider">Sana</span>
                  <span className="text-white">{t.createdAt ? new Date(t.createdAt).toLocaleDateString('uz-UZ') : '-'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      
      <div className="mt-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-black tracking-tight text-white mb-1">SAT Imtihonlar</h2>
          <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">Markaz ichki SAT imtihonlari</p>
        </div>
      </div>
      
      {satExams.length === 0 ? (
        <div className="glass-panel p-6 flex flex-col items-center justify-center opacity-70 border-dashed border-2 px-12 py-16">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <span className="text-[24px]">📝</span>
          </div>
          <h3 className="text-[18px] font-bold text-white mb-2">Hali SAT imtihonlar yo'q</h3>
          <p className="text-[13px] text-white/40 text-center max-w-sm font-medium">Rejalashtirilgan SAT imtihonlari haqida malumotlar shu yerda ko'rsatiladi.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {satExams.map(exam => (
            <div key={exam.id} className="glass-panel p-5 relative group border border-white/5 hover:border-[#FEC204]/50 transition-colors">
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openExamEdit(exam)} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleExamDelete(exam.id)} className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
              
              <div className="mb-3 pr-20">
                <h3 className="text-[16px] font-bold text-[#FEC204] mb-1">{exam.title}</h3>
                <div className="flex gap-2 text-[11px] font-bold">
                  <span className="text-white">{exam.subject}</span>
                  <span className="text-white/40">•</span>
                  <span className="text-white/60">{getGroupName(exam.groupId)}</span>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <Calendar size={14} className="text-[#FEC204]/60" />
                  <span>{new Date(exam.date).toLocaleDateString('uz-UZ')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <span className="w-3.5 h-3.5 rounded-full border border-[#FEC204]/60 flex items-center justify-center text-[8px] font-bold text-[#FEC204]/60">V</span>
                  <span>{exam.startTime} (Davomiyligi: {exam.duration} daqiqa)</span>
                </div>
              </div>
              
              {exam.description && (
                <p className="text-[12px] text-white/50 bg-white/5 p-3 rounded-lg">{exam.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {isExamModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-end md:justify-center animate-in fade-in duration-200">
          <div className="w-full md:w-[500px] bg-[#0d0d0d] border border-white/10 rounded-t-[20px] md:rounded-[20px] p-5 animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-0 md:zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-[18px] font-black tracking-tight text-white">{examEditingId ? 'SAT Imtihonni tahrirlash' : 'Yangi SAT imtihon'}</h2>
              <button onClick={() => setIsExamModalOpen(false)} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white hover:bg-white/10"><X size={16} /></button>
            </div>
            
            <form onSubmit={handleExamSave} className="space-y-4">
              <input required placeholder="Imtihon nomi (Masalan: SAT Mock 1)" value={examFormData.title} onChange={e=>setExamFormData({...examFormData, title: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30" />
              
              <div className="grid grid-cols-2 gap-3">
                <select required value={examFormData.subject} onChange={e=>setExamFormData({...examFormData, subject: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-[color:var(--theme-text-primary)] appearance-none" style={{ colorScheme: "dark" }}>
                  <option value="" disabled>Fanni tanlang</option>
                  {subjects.map(s => <option key={s.id} value={s.name} className="bg-[#1a1a1a]">{s.name}</option>)}
                </select>
                <select value={examFormData.groupId} onChange={e=>setExamFormData({...examFormData, groupId: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-[color:var(--theme-text-primary)] appearance-none" style={{ colorScheme: "dark" }}>
                  <option value="">Barcha uchun</option>
                  {groups.map(g => <option key={g.id} value={g.id} className="bg-[#1a1a1a]">{g.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Sana</label>
                  <input required type="date" value={examFormData.date} onChange={e=>setExamFormData({...examFormData, date: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white" style={{ colorScheme: "dark" }} />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Boshlanish vaqti</label>
                  <input required type="time" value={examFormData.startTime} onChange={e=>setExamFormData({...examFormData, startTime: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white" style={{ colorScheme: "dark" }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Davomiyligi (daqiqa)</label>
                  <input required type="number" placeholder="120" value={examFormData.duration} onChange={e=>setExamFormData({...examFormData, duration: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Manzil (Yoki Online)</label>
                  <input required placeholder="Online" value={examFormData.location} onChange={e=>setExamFormData({...examFormData, location: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30" />
                </div>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-2">
                <label className="text-[12px] font-bold text-[#FEC204] mb-3 block">Test manbalarini sozlash (Faqat SAT testlar)</label>
                
                {examFormData.testSources.map((ts, idx) => (
                  <div key={idx} className="flex gap-2 mb-2 items-center">
                    <select 
                      value={ts.testId} 
                      onChange={e => {
                        const newArr = [...examFormData.testSources];
                        const selTest = tests.find(t => t.id === e.target.value);
                        newArr[idx].testId = e.target.value;
                        if (selTest) {
                          newArr[idx].name = selTest.title;
                          newArr[idx].count = selTest.questions?.length || selTest.questionCount || 0;
                        }
                        setExamFormData({...examFormData, testSources: newArr});
                      }}
                      className="flex-1 glass-panel p-2 outline-none focus:border-[#FEC204]/50 text-xs text-[color:var(--theme-text-primary)] appearance-none" style={{ colorScheme: "dark" }}
                    >
                      <option value="" disabled>Testni tanlang</option>
                      {tests.map(t => (
                        <option key={t.id} value={t.id} className="bg-[#1a1a1a]">{t.title} ({t.questions?.length || t.questionCount} ta savol)</option>
                      ))}
                    </select>
                    <input 
                      type="number" 
                      value={ts.count} 
                      onChange={e => {
                        const newArr = [...examFormData.testSources];
                        newArr[idx].count = Number(e.target.value);
                        setExamFormData({...examFormData, testSources: newArr});
                      }}
                      className="w-16 glass-panel p-2 outline-none focus:border-[#FEC204]/50 text-xs text-center"
                    />
                    <button type="button" onClick={() => {
                      const newArr = [...examFormData.testSources];
                      newArr.splice(idx, 1);
                      setExamFormData({...examFormData, testSources: newArr});
                    }} className="w-8 h-8 bg-red-500/10 text-red-500 rounded-lg flex items-center justify-center shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                
                <button type="button" onClick={() => {
                  setExamFormData({...examFormData, testSources: [...examFormData.testSources, {testId: '', name: '', count: 10}]});
                }} className="w-full py-2 bg-[rgba(254,194,4,0.1)] text-[#FEC204] font-bold text-[12px] rounded-lg mt-2 flex items-center justify-center gap-2 hover:bg-[rgba(254,194,4,0.2)] transition-colors">
                  <span className="text-lg leading-none">+</span> Boshqa test qo'shish
                </button>
              </div>

              <textarea placeholder="Qo'shimcha malumotlar..." value={examFormData.description} onChange={e=>setExamFormData({...examFormData, description: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30 resize-none h-20" />
              
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsExamModalOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-white/70 transition-colors">Bekor qilish</button>
                <button type="submit" className="flex-1 py-3 bg-[#FEC204] hover:bg-[#e5ae03] text-black rounded-xl font-bold transition-colors shadow-[0_0_15px_rgba(254,194,4,0.3)]">Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAssignModalOpen && assigningTest && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setIsAssignModalOpen(false)}>
          <div className="bg-[#1a1a1a] rounded-[24px] w-full max-w-md border border-white/10 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-[18px] font-black text-white">Online test biriktirish</h2>
              <button type="button" onClick={() => setIsAssignModalOpen(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAssignSave} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-white/60 uppercase tracking-wider mb-2">Guruhni tanlang *</label>
                <select
                  required
                  value={assignForm.groupId}
                  onChange={e => setAssignForm({ ...assignForm, groupId: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-[14px] outline-none focus:border-[#FEC204] transition-colors appearance-none"
                >
                  <option value="" className="bg-[#1a1a1a]">Tanlang</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id} className="bg-[#1a1a1a]">{g.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-white/60 uppercase tracking-wider mb-2">Sana *</label>
                  <input
                    required
                    type="date"
                    value={assignForm.date}
                    onChange={e => setAssignForm({ ...assignForm, date: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-[14px] outline-none focus:border-[#FEC204] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-white/60 uppercase tracking-wider mb-2">Vaqt *</label>
                  <input
                    required
                    type="time"
                    value={assignForm.startTime}
                    onChange={e => setAssignForm({ ...assignForm, startTime: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-[14px] outline-none focus:border-[#FEC204] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-bold text-white/60 uppercase tracking-wider mb-2">Davomiyligi (daqiqa) *</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={assignForm.duration}
                  onChange={e => setAssignForm({ ...assignForm, duration: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-[14px] outline-none focus:border-[#FEC204] transition-colors"
                />
              </div>
              
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsAssignModalOpen(false)} className="flex-1 py-3 px-4 rounded-xl font-bold text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                  Bekor qilish
                </button>
                <button type="submit" className="flex-1 py-3 px-4 rounded-xl font-bold bg-[#FEC204] text-black hover:bg-[#e5ae03] transition-colors shadow-[0_0_20px_rgba(254,194,4,0.3)]">
                  Biriktirish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      
      {isTestConfigOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in duration-200">
          <div className="w-full md:w-[450px] bg-[#0d0d0d] border border-white/10 rounded-[20px] p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[18px] font-black tracking-tight text-white">Test parametrlarini kiritish</h2>
              <button onClick={() => setIsTestConfigOpen(false)} className="p-2 bg-white/5 rounded-full text-white/40 hover:bg-white/10 hover:text-white transition-colors"><X size={16} /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Test nomi</label>
                <input required list="existing-test-names" value={testConfig.title} onChange={e=>setTestConfig({...testConfig, title: e.target.value})} placeholder="Masalan: Matematika oylik test" className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white" />
                <datalist id="existing-test-names">
                  {existingTests.map((t, idx) => (
                    <option key={idx} value={t} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Test turi</label>
                <select required value={testConfig.satType} onChange={e=>setTestConfig({...testConfig, satType: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-[color:var(--theme-text-primary)] appearance-none" style={{ colorScheme: "dark" }}>
                  <option value="SAT Mavzulashtirilgan" className="bg-[#1a1a1a]">SAT Mavzulashtirilgan</option>
                  <option value="SAT Homework" className="bg-[#1a1a1a]">SAT Homework</option>
                  <option value="SAT practice" className="bg-[#1a1a1a]">SAT practice</option>
                  <option value="SAT real EXAM" className="bg-[#1a1a1a]">SAT real EXAM</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Savollar soni</label>
                  <input required type="number" min="1" max="100" value={testConfig.questionCount} onChange={e=>setTestConfig({...testConfig, questionCount: Number(e.target.value)})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Variantlar soni</label>
                  <select value={testConfig.variantCount} onChange={e=>setTestConfig({...testConfig, variantCount: Number(e.target.value)})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-[color:var(--theme-text-primary)] appearance-none" style={{ colorScheme: "dark" }}>
                    <option value={3} className="bg-[#1a1a1a]">3 ta (A, B, C)</option>
                    <option value={4} className="bg-[#1a1a1a]">4 ta (A, B, C, D)</option>
                    <option value={5} className="bg-[#1a1a1a]">5 ta (A, B, C, D, E)</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsTestConfigOpen(false)} className="flex-1 py-3 px-4 rounded-xl font-bold text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                  Bekor qilish
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    if (!testConfig.title) {
                      toast.error("Test nomini kiriting");
                      return;
                    }
                    setIsTestConfigOpen(false);
                    setIsTestBuilderOpen(true);
                  }} 
                  className="flex-1 py-3 px-4 rounded-xl font-bold bg-[#FEC204] text-black hover:bg-[#e5ae03] transition-colors shadow-[0_0_20px_rgba(254,194,4,0.3)]"
                >
                  Davom etish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isTestBuilderOpen && (
        <AdminSATBuilder 
          initialData={testConfig} 
          onClose={() => setIsTestBuilderOpen(false)} 
          onSave={() => {
             // Saved
          }} 
        />
      )}
    </div>
  );
}
