import React, { useState, useEffect } from 'react';
import { TestData, Group, TestCategory } from '../../types';
import { Trash2, Edit2, Copy, FileText, X } from 'lucide-react';
import { collection, doc, deleteDoc, addDoc, onSnapshot, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useConfirm } from '../../contexts/ConfirmContext';
import toast from 'react-hot-toast';
import AdminTestBuilder from './AdminTestBuilder';
import { useAuth } from '../../contexts/AuthContext';
import { sendAutoNotification } from '../../lib/notificationSender';

export default function AdminTestsDatabase() {
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const [tests, setTests] = useState<TestData[]>([]);
  const [filterType, setFilterType] = useState<string>('Barchasi');
  const [groups, setGroups] = useState<Group[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningTest, setAssigningTest] = useState<TestData | null>(null);
  const [assignForm, setAssignForm] = useState({ groupId: '', date: '', startTime: '', duration: '60', maxAttempts: 1 });
  const [categories, setCategories] = useState<TestCategory[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

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

  const handleAssignClick = (t: TestData) => {
    setAssigningTest(t);
    setAssignForm({ groupId: '', date: '', startTime: '', duration: '60', maxAttempts: t.maxAttempts || 1 });
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
        maxAttempts: assignForm.maxAttempts || 1,
        createdAt: new Date().toISOString()
      });
      toast.success("Online test guruhga biriktirildi!");
      setIsAssignModalOpen(false);
      
      // Send auto notification
      const notifRes = await sendAutoNotification({
        title: "Yangi test: " + assigningTest.title,
        body: `${assigningTest.title} ishlashga tayyor!`,
        link: '/student/exams',
        target: 'group',
        targetId: assignForm.groupId
      });
      
      if (notifRes?.success && notifRes.data?.sent !== undefined) {
        toast.success(`Xabarnoma ${notifRes.data.sent} ta kishiga yuborildi. (${notifRes.data.failed} ta xato)`);
      } else {
        toast.error("Xabarnoma yuborilmadi: " + (notifRes?.error || "Xatolik"));
      }
    } catch (err) {
      console.error(err);
      toast.error("Xatolik yuz berdi");
    }
  };

  const [isTestBuilderOpen, setIsTestBuilderOpen] = useState(false);
  const [testConfig, setTestConfig] = useState<TestData>({
    title: '',
    questionCount: 10,
    variantCount: 4,
    testType: 'Mavzulashtirilgan',
    maxAttempts: 1,
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
      setTests(testsArr.filter(t => t.testType !== 'sat' && t.testType !== 'Milliy Sertifikat'));
    }, err => {
      console.error('Error fetching tests:', err);
    });

    const unsubCats = onSnapshot(collection(db, 'testCategories'), snap => {
      const cats: TestCategory[] = [];
      snap.docs.forEach(d => {
        cats.push({ id: d.id, ...d.data() } as TestCategory);
      });
      setCategories(cats);
    }, err => {
      console.error('Error fetching testCategories:', err);
    });

    return () => { unsub(); unsubCats(); };
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await addDoc(collection(db, 'testCategories'), { name: newCategoryName.trim() });
      toast.success("Kategoriya qo'shildi");
      setNewCategoryName('');
      setIsCategoryModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Kategoriya qo'shishda xatolik");
    }
  };

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

  const dynamicTypes = Array.from(new Set([
    ...categories.map(c => c.name),
    ...tests.map(t => t.testType || "Noma'lum").filter(Boolean)
  ]));
  
  const uniqueTypes = ['Barchasi', ...dynamicTypes];
  const filteredTests = filterType === 'Barchasi' ? tests : tests.filter(t => (t.testType || "Noma'lum") === filterType);

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-black tracking-tight text-white mb-1">Testlar bazasi</h1>
          <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">Barcha yaratilgan testlar to'plami ({tests.length})</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsCategoryModalOpen(true)}
            className="bg-white/10 text-white px-5 py-2.5 rounded-[12px] font-bold hover:bg-white/20 transition-colors flex items-center gap-2 text-[14px]"
          >
            <span className="text-xl leading-none">+</span> Kategoriya qo'shish
          </button>
          <button 
            onClick={() => {
              setTestConfig({
                title: '',
                questionCount: 10,
                variantCount: 4,
                testType: dynamicTypes.length > 0 ? dynamicTypes[0] : 'Mavzulashtirilgan',
                maxAttempts: 1,
                questions: [],
                createdAt: ''
              });
              setIsTestConfigOpen(true);
            }}
            className="bg-[#FEC204] text-black px-6 py-2.5 rounded-[12px] font-bold hover:bg-[#FEC204]/90 transition-colors shadow-[0_0_15px_rgba(254,194,4,0.3)] flex items-center gap-2 text-[14px]"
          >
            <span className="text-xl leading-none">+</span> Test yaratish
          </button>
        </div>
      </div>
      
      {uniqueTypes.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
          {uniqueTypes.map((type, idx) => (
            <button
              key={idx}
              onClick={() => setFilterType(type)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-colors border ${filterType === type ? 'bg-white/10 text-white border-white/20' : 'bg-white/5 text-white/50 border-white/5 hover:bg-white/10'}`}
            >
              {type}
            </button>
          ))}
        </div>
      )}

      {filteredTests.length === 0 ? (
        <div className="glass-panel p-6 flex flex-col items-center justify-center opacity-70 border-dashed border-2 px-12 py-16">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <span className="text-[24px]">📁</span>
          </div>
          <h3 className="text-[18px] font-bold text-white mb-2">Baza bo'sh</h3>
          <p className="text-[13px] text-white/40 text-center max-w-sm font-medium">Hozircha hech qanday test yaratilmagan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {filteredTests.map(t => (
            <div key={t.id} className="glass-panel p-0 flex overflow-hidden border border-white/5 hover:border-[#FEC204]/50 transition-colors rounded-[16px] group cursor-pointer" onClick={() => handleEdit(t)}>
              <div className="flex-1 p-5 border-r border-white/5">
                <h3 className="text-white font-bold text-lg mb-3">{t.title}</h3>
                
                <div className="flex flex-wrap gap-4 text-xs font-bold">
                  <div className="flex flex-col gap-1">
                    <span className="text-white/40 uppercase text-[9px] tracking-wider">Savollar</span>
                    <span className="text-white">{t.questions?.length || t.questionCount} ta</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-white/40 uppercase text-[9px] tracking-wider">Shakli</span>
                    <span className="text-[#FEC204]">{t.testType}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-white/40 uppercase text-[9px] tracking-wider">Sana</span>
                    <span className="text-white">{t.createdAt ? new Date(t.createdAt).toLocaleDateString('uz-UZ') : '-'}</span>
                  </div>
                </div>
              </div>

              <div className="w-[100px] flex flex-col justify-center items-center gap-3 p-3 bg-white/[0.02]">
                <button onClick={(e) => { e.stopPropagation(); handleAssignClick(t); }} className="w-full py-2 rounded-lg bg-[rgba(254,194,4,0.15)] text-[#FEC204] hover:bg-[rgba(254,194,4,0.25)] flex items-center justify-center gap-1.5 transition-colors font-bold text-[10px] uppercase tracking-[1px] text-center" title="Online test olish">
                  <span>Test olish</span>
                </button>
                <div className="flex gap-2 w-full justify-center mt-1">
                  <button onClick={(e) => { e.stopPropagation(); handleEdit(t); }} className="flex-1 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors" title="Tahrirlash">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(t.id!); }} className="flex-1 h-9 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors" title="O'chirish">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
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
                  {groups.filter(g => user?.role !== 'teacher' || g.teacherName === user?.fullName).map(g => (
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
              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-[12px] font-bold text-white/60 uppercase tracking-wider mb-2">Urinishlar soni *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="10"
                    value={assignForm.maxAttempts || ''}
                    onChange={e => setAssignForm({ ...assignForm, maxAttempts: e.target.value === '' ? 0 : Number(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-[14px] outline-none focus:border-[#FEC204] transition-colors"
                  />
                </div>
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
                  {dynamicTypes.length > 0 ? dynamicTypes.map((type, idx) => (
                    <option key={idx} value={type} className="bg-[#1a1a1a]">{type}</option>
                  )) : (
                    <option value="Mavzulashtirilgan" className="bg-[#1a1a1a]">Mavzulashtirilgan</option>
                  )}
                </select>
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

      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in duration-200">
          <div className="w-full md:w-[400px] bg-[#0d0d0d] border border-white/10 rounded-[20px] p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[18px] font-black tracking-tight text-white">Kategoriya qo'shish</h2>
              <button onClick={() => setIsCategoryModalOpen(false)} className="p-2 bg-white/5 rounded-full text-white/40 hover:bg-white/10 hover:text-white transition-colors"><X size={16} /></button>
            </div>
            
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Kategoriya nomi</label>
                <input 
                  required 
                  type="text"
                  placeholder="Masalan: Olimpiada" 
                  value={newCategoryName} 
                  onChange={e => setNewCategoryName(e.target.value)} 
                  className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white" 
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="flex-1 py-3 px-4 rounded-xl font-bold text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                  Bekor qilish
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 px-4 rounded-xl font-bold bg-[#FEC204] text-black hover:bg-[#e5ae03] transition-colors shadow-[0_0_20px_rgba(254,194,4,0.3)]"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isTestBuilderOpen && (
        <AdminTestBuilder 
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
