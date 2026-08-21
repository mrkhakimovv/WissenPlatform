import { useConfirm } from '../../contexts/ConfirmContext';
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, doc, setDoc } from '../../lib/firebase';
import { db } from '../../lib/firebase';
import AdminTestBuilder from './AdminTestBuilder';
import ExamStatsModal from '../../components/ExamStatsModal';
import { TestData } from '../../types';
import { Plus, X, Edit2, Trash2, Calendar, Clock, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { Exam, Group } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminExams() {
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | 'all'>('all');
  const [groups, setGroups] = useState<Group[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [existingTests, setExistingTests] = useState<string[]>([]);
  const [allTests, setAllTests] = useState<{id: string, title: string, totalCount: number}[]>([]);

  const [selectedExamForStats, setSelectedExamForStats] = useState<Exam | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTestConfigOpen, setIsTestConfigOpen] = useState(false);
  const [isTestBuilderOpen, setIsTestBuilderOpen] = useState(false);
  const [testConfig, setTestConfig] = useState<TestData>({
    title: '',
    questionCount: 10,
    variantCount: 4,
    testType: 'Mavzulashtirilgan',
    questions: [],
    createdAt: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    groupId: '',
    date: '',
    startTime: '',
    duration: '',
    location: '',
    description: '',    maxAttempts: 1,
    randomizeQuestions: false
  , testSources: [] as {testId: string, name: string, count: number}[]});

  useEffect(() => {
    const unsubExams = onSnapshot(query(collection(db, 'exams'), orderBy('createdAt', 'desc')), snap => {
      const allExams = snap.docs.map(d => ({ id: d.id, ...d.data() } as Exam));
      setExams(allExams.filter(e => e.examType !== 'sat'));
    });
    const unsubGroups = onSnapshot(collection(db, 'groups'), snap => {
      setGroups(snap.docs.map(d => ({ id: d.id, ...d.data() } as Group)));
    });
    const unsubSubjects = onSnapshot(collection(db, 'subjects'), snap => {
      setSubjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubTests = onSnapshot(collection(db, 'tests'), snap => {
      const titles = new Set<string>();
      const testsData: any[] = [];
      snap.docs.forEach(d => {
        const data = d.data();
        if (data.title) titles.add(data.title);
        testsData.push({ id: d.id, title: data.title || 'Nomsiz test', totalCount: data.questions?.length || data.questionCount || 0, testType: data.testType });
      });
      setExistingTests(Array.from(titles));
      setAllTests(testsData);
    }, err => {
      console.error('Error fetching tests:', err);
    });
    return () => { unsubExams(); unsubGroups(); unsubSubjects(); unsubTests(); };
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setFormData({ title: '', subject: '', groupId: '', date: '', startTime: '', duration: '', location: '', description: '', testSources: [], maxAttempts: 1,
    randomizeQuestions: false });
    setIsModalOpen(true);
  };

  const openEdit = (exam: Exam) => {
    setEditingId(exam.id);
    setFormData({
      title: exam.title,
      subject: exam.subject,
      groupId: exam.groupId || '',
      date: exam.date,
      startTime: exam.startTime,
      duration: exam.duration.toString(),
      location: exam.location,
      description: exam.description || '', testSources: exam.testSources || [], maxAttempts: exam.maxAttempts || 1, randomizeQuestions: exam.randomizeQuestions ?? false});
    setIsModalOpen(true);
  };

  const handleEndExam = async (exam: any) => {
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

  const handleDelete = async (id: string) => {
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSave = {
        ...formData,
        duration: Number(formData.duration),
      };
      
      if (editingId) {
        await updateDoc(doc(db, 'exams', editingId), dataToSave);
        toast.success("Yangilandi");
      } else {
        const newDocRef = doc(collection(db, 'exams'));
        await setDoc(newDocRef, {
          ...dataToSave,
          id: newDocRef.id,
          createdAt: new Date().toISOString()
        });
        toast.success("Qo'shildi");
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Kontekst:', err);
      const msg = err instanceof Error ? err.message : "Noma'lum xatolik";
      toast.error(msg);
    }
  };

  const getGroupName = (id?: string) => {
    if (!id) return 'Barcha uchun';
    return groups.find(g => g.id === id)?.name || 'Noma\'lum guruh';
  };

  const teacherGroups = groups.filter(g => user?.role !== 'teacher' || g.teacherName === user?.fullName);
  let filteredExams = exams.filter(ex => user?.role !== 'teacher' || !ex.groupId || teacherGroups.some(g => g.id === ex.groupId));
  if (selectedGroupId !== 'all') {
    filteredExams = filteredExams.filter(ex => selectedGroupId === 'global' ? !ex.groupId : ex.groupId === selectedGroupId);
  }

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-black tracking-tight text-white mb-1">Imtihonlar</h1>
          <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">Markaz ichki olimpiadalari va testlari</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => {
            setTestConfig({
              title: '',
              questionCount: 10,
              variantCount: 4,
              testType: 'Mavzulashtirilgan',
              questions: [],
              createdAt: ''
            });
            setIsTestConfigOpen(true);
          }} className="bg-[#FEC204] text-black px-6 py-2.5 rounded-[12px] font-bold hover:bg-[#FEC204]/90 transition-colors shadow-[0_0_15px_rgba(254,194,4,0.3)] flex items-center gap-2 text-[14px] h-[46px]">
            <span className="text-xl leading-none">+</span> Test yaratish
          </button>
          <button onClick={openAdd} className="glass-panel px-6 py-3 font-bold text-[#FEC204] hover:bg-[#FEC204] hover:text-black transition-colors rounded-[12px]">
            Imtihon qo'shish
          </button>
        </div>
      </div>

      {/* Guruhlar filtri */}
      <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
        <button
          onClick={() => setSelectedGroupId('all')}
          className={`px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-colors ${selectedGroupId === 'all' ? 'bg-[#FEC204] text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
        >
          Barchasi
        </button>
        <button
          onClick={() => setSelectedGroupId('global')}
          className={`px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-colors ${selectedGroupId === 'global' ? 'bg-[#FEC204] text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
        >
          Umumiy (Guruhsiz)
        </button>
        {teacherGroups.map(g => (
          <button
            key={g.id}
            onClick={() => setSelectedGroupId(g.id)}
            className={`px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-colors ${selectedGroupId === g.id ? 'bg-[#FEC204] text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
            {g.name}
          </button>
        ))}
      </div>

      {exams.length === 0 ? (
        <div className="glass-panel p-6 flex flex-col items-center justify-center opacity-70 border-dashed border-2 px-12 py-16">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <span className="text-[24px]">📝</span>
          </div>
          <h3 className="text-[18px] font-bold text-white mb-2">Hali imtihonlar yo'q</h3>
          <p className="text-[13px] text-white/40 text-center max-w-sm font-medium">Rejalashtirilgan imtihonlar va test sinovlari haqida malumotlar shu yerda qo'shib boriladi.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {filteredExams.map(exam => (
            <div key={exam.id} onClick={() => setSelectedExamForStats(exam)} className="glass-panel p-0 flex overflow-hidden cursor-pointer hover:border-[#FEC204]/50 transition-colors">
              
              <div className="flex-1 p-5 border-r border-white/5">
                <div className="mb-3">
                  <h3 className="text-[16px] font-bold text-white mb-1">{exam.title}</h3>
                  <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                    <span className="text-[#FEC204]">{exam.subject}</span>
                    <span className="text-white/40">•</span>
                    <span className="text-white/60">{getGroupName(exam.groupId)}</span>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <Calendar size={14} className="text-white/40" />
                    <span>{new Date(exam.date).toLocaleDateString('uz-UZ')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <Clock size={14} className="text-white/40" />
                    <span>{exam.startTime} (Davomiyligi: {exam.duration} daqiqa)</span>
                  </div>
                  
                </div>
                
                {exam.description && (
                  <p className="text-[12px] text-white/50 bg-white/5 p-3 rounded-lg">{exam.description}</p>
                )}
              </div>

              <div className="w-[100px] flex flex-col justify-center items-center gap-3 p-3 bg-white/[0.02]">
                {exam.status !== 'ended' && (
                  <button onClick={(e) => { e.stopPropagation(); handleEndExam(exam); }} className="w-full py-2 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors text-[10px] font-bold uppercase tracking-[1px]">
                    Yakunlash
                  </button>
                )}
                {exam.status === 'ended' && (
                  <span className="w-full py-2 rounded-lg bg-white/5 flex items-center justify-center text-white/40 text-[10px] font-bold uppercase tracking-[1px] text-center">
                    Yakunlangan
                  </span>
                )}
                <div className="flex gap-2 w-full justify-center mt-1">
                  <button onClick={(e) => { e.stopPropagation(); openEdit(exam); }} className="flex-1 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(exam.id); }} className="flex-1 h-9 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-end md:justify-center animate-in fade-in duration-200">
          <div className="w-full md:w-[500px] bg-[#0d0d0d] border border-white/10 rounded-t-[20px] md:rounded-[20px] p-5 animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-0 md:zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-[18px] font-black tracking-tight text-white">{editingId ? 'Imtihonni tahrirlash' : 'Yangi imtihon'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white/5 rounded-full text-white/40"><X size={16} /></button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              <input required placeholder="Imtihon nomi (Masalan: Oylik test)" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30" />
              
              <div className="grid grid-cols-2 gap-3">
                <select required value={formData.subject} onChange={e=>setFormData({...formData, subject: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-[color:var(--theme-text-primary)] appearance-none" style={{ colorScheme: "dark" }}>
                  <option value="" disabled>Fanni tanlang</option>
                  {subjects.map(s => <option key={s.id} value={s.name} className="bg-[#1a1a1a]">{s.name}</option>)}
                </select>

                <select value={formData.groupId} onChange={e=>setFormData({...formData, groupId: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-[color:var(--theme-text-primary)] appearance-none" style={{ colorScheme: "dark" }}>
                  <option value="">Barcha uchun</option>
                  {teacherGroups.map(g => <option key={g.id} value={g.id} className="bg-[#1a1a1a]">{g.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Sana</label>
                  <input required type="date" value={formData.date} onChange={e=>setFormData({...formData, date: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white" style={{ colorScheme: "dark" }} />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Boshlanish vaqti</label>
                  <input required type="time" value={formData.startTime} onChange={e=>setFormData({...formData, startTime: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white" style={{ colorScheme: "dark" }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Daqiqa</label>
                  <input required type="number" placeholder="90" value={formData.duration} onChange={e=>setFormData({...formData, duration: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Urinishlar</label>
                  <input required type="number" min="1" max="100" value={formData.maxAttempts || 1} onChange={e=>setFormData({...formData, maxAttempts: Number(e.target.value)})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white" />
                </div>
              </div>

              
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-2">
                <label className="text-[12px] font-bold text-[#FEC204] mb-3 block">Test manbalarini sozlash</label>
                
                {formData.testSources.map((ts, idx) => (
                  <div key={idx} className="flex gap-2 mb-2 items-center">
                    <select 
                      value={ts.testId} 
                      onChange={(e) => {
                        const newSources = [...formData.testSources];
                        newSources[idx].testId = e.target.value;
                        newSources[idx].name = allTests.find(t => t.id === e.target.value)?.title || '';
                        setFormData({...formData, testSources: newSources});
                      }}
                      className="flex-1 glass-panel p-2 outline-none focus:border-[#FEC204]/50 text-xs text-white appearance-none" style={{ colorScheme: "dark" }}
                    >
                      <option value="" disabled>Testni tanlang</option>
                      {allTests.map(t => (
                        <option key={t.id} value={t.id} className="bg-[#1a1a1a]">{t.title} {t.testType === 'sat' ? '(SAT) ' : ''}({t.totalCount} ta savol)</option>
                      ))}
                    </select>
                    <input 
                      type="number" 
                      min="1" 
                      placeholder="Savol soni" 
                      value={ts.count} 
                      onChange={(e) => {
                        const newSources = [...formData.testSources];
                        newSources[idx].count = parseInt(e.target.value) || 0;
                        setFormData({...formData, testSources: newSources});
                      }}
                      className="w-20 glass-panel p-2 outline-none focus:border-[#FEC204]/50 text-xs text-center"
                    />
                    <button type="button" onClick={() => {
                        const newSources = [...formData.testSources];
                        newSources.splice(idx, 1);
                        setFormData({...formData, testSources: newSources});
                    }} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                
                <button type="button" onClick={() => {
                  setFormData({
                    ...formData,
                    testSources: [...formData.testSources, {testId: '', name: '', count: 10}]
                  });
                }} className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-white/70 transition-colors mt-2 flex justify-center items-center gap-1">
                  <span className="text-lg leading-none">+</span> Manba qo'shish
                </button>

                <div className="mt-4 flex items-center justify-between bg-[#111] p-3 rounded-lg border border-white/5">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">Savollar va variantlar aralashsin</span>
                    <span className="text-[10px] text-white/40">Har bir o'quvchiga savollar tasodifiy tartibda beriladi</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={formData.randomizeQuestions} onChange={e => setFormData({...formData, randomizeQuestions: e.target.checked})} />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FEC204]"></div>
                  </label>
                </div>
              </div>

              <textarea placeholder="Qo'shimcha ma'lumot (ixtiyoriy)" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30 min-h-[80px] custom-scrollbar" />
              
              <div className="pt-2">
                <button type="submit" className="w-full py-3 bg-[#FEC204] text-black font-bold rounded-[12px] text-sm active:scale-[0.98] transition-transform">
                  Saqlash
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
              
              <div>
                <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Test shakli</label>
                <select value={testConfig.testType} onChange={e=>setTestConfig({...testConfig, testType: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-[color:var(--theme-text-primary)] appearance-none" style={{ colorScheme: "dark" }}>
                  <option value="Mavzulashtirilgan" className="bg-[#1a1a1a]">Mavzulashtirilgan</option>
                  <option value="Nazorat testi" className="bg-[#1a1a1a]">Nazorat testi</option>
                  <option value="Olimpiada" className="bg-[#1a1a1a]">Olimpiada</option>
                  <option value="Blok test" className="bg-[#1a1a1a]">Blok test</option>
                </select>
              </div>
              
              <button 
                onClick={() => {
                  if(!testConfig.title) return toast.error("Test nomini kiriting");
                  setIsTestConfigOpen(false);
                  setIsTestBuilderOpen(true);
                }} 
                className="w-full py-3 bg-[#FEC204] text-black font-bold rounded-[12px] text-sm mt-2 hover:opacity-90 active:scale-95 transition-all"
              >
                Yaratishni boshlash
              </button>
            </div>
          </div>
        </div>
      )}
      
      {isTestBuilderOpen && (
        <AdminTestBuilder 
          initialData={testConfig} 
          onClose={() => setIsTestBuilderOpen(false)}
          onSave={() => {
             // Handle refresh or state update if needed
          }}
        />
      )}

      {selectedExamForStats && (
        <ExamStatsModal
          exam={selectedExamForStats}
          groupName={getGroupName(selectedExamForStats.groupId)}
          onClose={() => setSelectedExamForStats(null)}
        />
      )}
    </div>
  );
}
