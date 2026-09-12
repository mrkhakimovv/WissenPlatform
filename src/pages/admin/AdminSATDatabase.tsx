import React, { useState, useEffect, useRef } from 'react';
import { TestData, Group, Exam } from '../../types';
import { Trash2, Edit2, Copy, FileText, X, Calendar, Users, Check, Eye } from 'lucide-react';
import { collection, doc, deleteDoc, addDoc, updateDoc, onSnapshot, query, orderBy, getDocs, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import * as XLSX from 'xlsx';
import { sendAutoNotification } from '../../lib/notificationSender';
import { useConfirm } from '../../contexts/ConfirmContext';
import toast from 'react-hot-toast';
import AdminSATBuilder from './AdminSATBuilder';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminSATDatabase() {
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const [tests, setTests] = useState<TestData[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [satExams, setSatExams] = useState<Exam[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningTest, setAssigningTest] = useState<TestData | null>(null);
  const [assignForm, setAssignForm] = useState({ groupId: '', date: '', startTime: '', duration: '60' });

  const handleViewResults = async (lesson: any) => {
    if (!lesson.assignedGroups || lesson.assignedGroups.length === 0) {
      toast.error("Ushbu darsga hech qanday guruh biriktirilmagan!");
      return;
    }
    if (!lesson.homeworkTestId) {
      toast.error("Ushbu darsda uyga vazifa yo'q!");
      return;
    }
    
    setViewingLessonResults(lesson);
    setIsLoadingResults(true);
    
    try {
      const usersSnap = await getDocs(query(collection(db, 'users')));
      const students: any[] = [];
      usersSnap.docs.forEach(d => {
        const u = d.data();
        const uGroups = u.groups || (u.groupId ? [u.groupId] : []);
        if (lesson.assignedGroups.some((g: string) => uGroups.includes(g))) {
          students.push({ id: d.id, ...u, uGroups });
        }
      });
      
      const resultsSnap = await getDocs(query(collection(db, 'exam_results'), where('testId', '==', lesson.homeworkTestId)));
      const allResults = resultsSnap.docs.map(d => ({id: d.id, ...d.data()}));
      
      const data = students.map(student => {
        const studentResults = allResults
          .filter(r => r.studentId === student.id)
          .sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime());
          
        return {
          student,
          results: studentResults
        };
      });
      
      setLessonResultsData(data);
    } catch (err) {
      console.error(err);
      toast.error("Xatolik yuz berdi");
    } finally {
      setIsLoadingResults(false);
    }
  };

  const handleDownloadResults = async (lesson: any) => {
    if (!lesson.assignedGroups || lesson.assignedGroups.length === 0) {
      toast.error("Ushbu darsga hech qanday guruh biriktirilmagan!");
      return;
    }
    
    const loadingToast = toast.loading("Natijalar yuklanmoqda...");
    try {
      // 1. Get all students in these groups
      const usersSnap = await getDocs(query(collection(db, 'users')));
      const students: any[] = [];
      usersSnap.docs.forEach(d => {
        const u = d.data();
        const uGroups = u.groups || (u.groupId ? [u.groupId] : []);
        if (lesson.assignedGroups.some((g: string) => uGroups.includes(g))) {
          students.push({ id: d.id, ...u, uGroups });
        }
      });
      
      if (students.length === 0) {
        toast.dismiss(loadingToast);
        toast.error("Guruhlarda o'quvchilar topilmadi.");
        return;
      }
      
      // 2. Get all results for these students
      const resultsSnap = await getDocs(collection(db, 'exam_results'));
      const allResults = resultsSnap.docs.map(d => d.data());
      
      // 3. Prepare columns from all SAT lessons
      // Sort lessons by createdAt or just use the current order in state (which is usually chronological or by order)
      const sortedLessons = [...lessons].sort((a,b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeA - timeB;
      });
      
      // 4. Build data for Excel
      const excelData = students.map(student => {
        const row: any = {
          "Ism Familiya": student.fullName || 'Noma\'lum',
          "Guruh Nomi": student.uGroups.map((gId: string) => groups.find(g => g.id === gId)?.name || gId).join(', ')
        };
        
        sortedLessons.forEach(l => {
          // Doim ustun bo'lishi uchun bo'sh joy bilan initsializatsiya qilamiz
          row[l.title] = "";
          
          if (l.homeworkTestId) {
            // Find result for this lesson and student
            const result = allResults.find(r => r.studentId === student.id && r.testId === l.homeworkTestId);
            if (result) {
              row[l.title] = `${result.score} / ${result.total}`;
            }
          }
        });
        
        return row;
      });
      
      // 5. Generate Excel
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // Calculate column widths
      const colWidths = [
        { wch: 30 }, // Ism Familiya
        { wch: 20 }, // Guruh nomi
        ...sortedLessons.map(() => ({ wch: 15 }))
      ];
      worksheet['!cols'] = colWidths;
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Natijalar");
      XLSX.writeFile(workbook, `SAT_Natijalar_${new Date().toLocaleDateString('uz-UZ')}.xlsx`);
      
      toast.dismiss(loadingToast);
      toast.success("Yuklab olindi!");
    } catch (err) {
      console.error("Export error:", err);
      toast.dismiss(loadingToast);
      toast.error("Xatolik yuz berdi");
    }
  };

  // SAT Lessons states
  const [lessons, setLessons] = useState<any[]>([]);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [lessonForm, setLessonForm] = useState({ title: '', homeworkKeys: '', vocabulary: '' });
  
  const [isVocabModalOpen, setIsVocabModalOpen] = useState(false);
  const [vocabForm, setVocabForm] = useState({ id: '', pairs: [{ eng: '', uz: '' }] });
  const [isTemplateMode, setIsTemplateMode] = useState(false);
  const [templateText, setTemplateText] = useState('');
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const vocabContainerRef = useRef<HTMLDivElement>(null);
  const [isLessonAssignModalOpen, setIsLessonAssignModalOpen] = useState(false);
  const [assigningLesson, setAssigningLesson] = useState<any>(null);
  const [lessonAssignGroupIds, setLessonAssignGroupIds] = useState<string[]>([]);
  const [isBulkLessonAssignModalOpen, setIsBulkLessonAssignModalOpen] = useState(false);
  const [bulkAssignGroupIds, setBulkAssignGroupIds] = useState<string[]>([]);
  const [viewingLessonResults, setViewingLessonResults] = useState<any>(null);
  const [lessonResultsData, setLessonResultsData] = useState<any[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);

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

    const unsubLessons = onSnapshot(collection(db, 'sat_lessons'), snap => {
      setLessons(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubSubjects(); unsubExams(); unsubLessons(); };
  }, []);


  const handleLessonSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonForm.title) {
      toast.error("Dars nomini kiriting");
      return;
    }
    try {
      const defaultGroupsStr = localStorage.getItem('satDefaultAssignedGroups');
      const defaultGroups = defaultGroupsStr ? JSON.parse(defaultGroupsStr) : [];
      
      const allExistingGroups = new Set<string>(defaultGroups);
      lessons.forEach(l => {
        if (l.assignedGroups) {
          l.assignedGroups.forEach((gId: string) => allExistingGroups.add(gId));
        }
      });
      const combinedGroups = Array.from(allExistingGroups);
      
      await addDoc(collection(db, 'sat_lessons'), {
        ...lessonForm,
        assignedGroups: combinedGroups,
        activeGroups: [],
        createdAt: new Date().toISOString()
      });
      setIsLessonModalOpen(false);
      setLessonForm({ title: '', homeworkKeys: '', vocabulary: '' });
      toast.success("Dars qo'shildi");
    } catch (error) {
      console.error(error);
      toast.error("Xatolik yuz berdi");
    }
  };


  const handleVocabSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vocabForm.id) return;
    try {
      const engs = vocabForm.pairs.map(p => p.eng.trim());
      const uzs = vocabForm.pairs.map(p => p.uz.trim());
      await updateDoc(doc(db, 'sat_lessons', vocabForm.id), { 
        vocabularyEng: engs.join('\n'),
        vocabularyUz: uzs.join('\n')
      });
      setIsVocabModalOpen(false);
      toast.success("Lug'atlar saqlandi");
    } catch(err) {
      toast.error("Xatolik");
    }
  };
  

  const handleParseTemplate = () => {
    const regex = /\[#(.*?);\+(.*?)\]/g;
    let match;
    const newPairs = [];
    while ((match = regex.exec(templateText)) !== null) {
      newPairs.push({
        eng: match[1].trim(),
        uz: match[2].trim()
      });
    }
    
    if (newPairs.length > 0) {
      // Filter out empty existing pairs, then append new ones
      const existing = vocabForm.pairs.filter(p => p.eng.trim() !== '' || p.uz.trim() !== '');
      setVocabForm({ ...vocabForm, pairs: [...existing, ...newPairs] });
      setTemplateText('');
      setIsTemplateMode(false);
      toast.success(newPairs.length + " ta so'z qo'shildi!");
      setTimeout(() => {
        if (vocabContainerRef.current) {
          vocabContainerRef.current.scrollTop = vocabContainerRef.current.scrollHeight;
        }
      }, 50);
    } else {
      toast.error("Shablonga mos so'zlar topilmadi");
    }
  };

  const handleAddVocabPair = () => {
    setVocabForm({ ...vocabForm, pairs: [...vocabForm.pairs, { eng: '', uz: '' }] });
    setTimeout(() => {
      if (vocabContainerRef.current) {
        vocabContainerRef.current.scrollTop = vocabContainerRef.current.scrollHeight;
      }
    }, 50);
  };
  
  const handleUpdateVocabPair = (index: number, field: 'eng' | 'uz', value: string) => {
    const newPairs = [...vocabForm.pairs];
    newPairs[index][field] = value;
    setVocabForm({ ...vocabForm, pairs: newPairs });
  };
  

  const handleHomeworkClick = (lesson: any) => {
    setEditingLessonId(lesson.id);
    if (lesson.homeworkTestId) {
      // Find the test
      const test = tests.find(t => t.id === lesson.homeworkTestId);
      if (test) {
        setTestConfig(test);
        setIsTestBuilderOpen(true);
      } else {
        toast.error("Test topilmadi, ehtimol o'chirilgan.");
      }
    } else {
      setTestConfig({
        title: lesson.title + ' - Uyga vazifa',
        questionCount: 10,
        variantCount: 4,
        testType: 'sat',
        satType: 'SAT Homework',
        isFastMode: true,
        questions: [],
        createdAt: ''
      });
      setIsTestBuilderOpen(true);
    }
  };


  const handleLessonStartSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningLesson) return;
    try {
      await updateDoc(doc(db, 'sat_lessons', assigningLesson.id), {
        activeGroups: lessonAssignGroupIds
      });
      setIsLessonAssignModalOpen(false);
      setAssigningLesson(null);
      setLessonAssignGroupIds([]);
      toast.success("Dars guruhlar uchun boshlandi");
    } catch(err) {
      toast.error("Xatolik yuz berdi");
    }
  };

  const handleBulkAssignSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkAssignGroupIds.length === 0) return;
    const loadingToast = toast.loading("Barcha darslar guruhlarga biriktirilmoqda...");
    try {
      for (const lesson of lessons) {
        const currentAssigned = lesson.assignedGroups || [];
        const newAssigned = [...new Set([...currentAssigned, ...bulkAssignGroupIds])];
        if (newAssigned.length !== currentAssigned.length) {
          await updateDoc(doc(db, 'sat_lessons', lesson.id), {
            assignedGroups: newAssigned
          });
        }
      }
      
      localStorage.setItem('satDefaultAssignedGroups', JSON.stringify(bulkAssignGroupIds));
      
      toast.dismiss(loadingToast);
      toast.success("Barcha darslar muvaffaqiyatli biriktirildi va sozlamalar saqlandi");
      setIsBulkLessonAssignModalOpen(false);
      // We don't reset bulkAssignGroupIds so it stays for next open, 
      // but let's just keep it as is, we will initialize it properly when opening.
    } catch(err) {
      console.error(err);
      toast.dismiss(loadingToast);
      toast.error("Xatolik yuz berdi");
    }
  };

  const handleRemoveAssignedGroup = async (lesson: any, groupId: string) => {
    try {
      const assignedGroups = lesson.assignedGroups.filter((id: string) => id !== groupId);
      await updateDoc(doc(db, 'sat_lessons', lesson.id), { assignedGroups });
      toast.success("Guruh o'chirildi");
    } catch (e) {
      toast.error("Xatolik");
    }
  };

  const handleLessonDelete = async (id: string) => {
    if (await confirm({title: "O'chirish", message: "Haqiqatan ham bu darsni o'chirmoqchimisiz?"})) {
      try {
        await deleteDoc(doc(db, 'sat_lessons', id));
        toast.success("Dars o'chirildi");
      } catch (error) {
        console.error(error);
        toast.error("Xatolik yuz berdi");
      }
    }
  };

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
      
      const notifRes = await sendAutoNotification({
        title: "Yangi SAT test: " + assigningTest.title,
        body: `${assigningTest.title} ishlashga tayyor!`,
        link: '/student/sat',
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

  const openExamAdd = () => {
    setExamEditingId(null);
    setExamFormData({ title: '', subject: '', groupId: '', date: '', startTime: '', duration: '', location: '', description: '', testSources: [] });
    setIsExamModalOpen(true);
  };

  const openExamEdit = (exam: Exam) => {
    setExamEditingId(exam.id);
    setExamFormData({
      title: exam.title || '',
      subject: exam.subject || '',
      groupId: exam.groupId || '',
      date: exam.date || '',
      startTime: exam.startTime || '',
      duration: exam.duration?.toString() || '',
      location: exam.location || '',
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
        
        const notifRes = await sendAutoNotification({
          title: "Yangi SAT Mock tayinlandi: " + examFormData.title,
          body: `${examFormData.title} ishlashga tayyor!`,
          link: '/student/sat',
          target: 'group',
          targetId: examFormData.groupId
        });
        
        if (notifRes?.success && notifRes.data?.sent !== undefined) {
          toast.success(`Xabarnoma ${notifRes.data.sent} ta kishiga yuborildi. (${notifRes.data.failed} ta xato)`);
        } else {
          toast.error("Xabarnoma yuborilmadi: " + (notifRes?.error || "Xatolik"));
        }
      }
      setIsExamModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Xatolik");
    }
  };

  const getGroupsName = (exam: Exam) => {
    if (exam.groupIds && exam.groupIds.length > 0) {
      return exam.groupIds.map(id => groups.find(g => g.id === id)?.name).filter(Boolean).join(', ');
    }
    if (exam.groupId) {
      return groups.find(g => g.id === exam.groupId)?.name || 'Noma\'lum guruh';
    }
    return 'Barcha uchun';
  };

  const [isTestBuilderOpen, setIsTestBuilderOpen] = useState(false);
  const [testConfig, setTestConfig] = useState<TestData>({
    title: '',
    questionCount: 10,
    variantCount: 4,
    testType: 'sat',
    satType: 'SAT Mavzulashtirilgan',
    isFastMode: false,
    questions: [],
    createdAt: ''
  });
  const [isTestConfigOpen, setIsTestConfigOpen] = useState(false);
  const [existingTests, setExistingTests] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'exams' | 'base' | 'lessons'>('exams');

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div className="flex bg-white/5 p-1 rounded-xl w-fit border border-white/10">
          <button 
            onClick={() => setActiveTab('exams')}
            className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'exams' ? 'bg-[#FEC204] text-black shadow-[0_0_10px_rgba(254,194,4,0.3)]' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
          >
            SAT EXAMS
          </button>
          <button 
            onClick={() => setActiveTab('base')}
            className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'base' ? 'bg-[#FEC204] text-black shadow-[0_0_10px_rgba(254,194,4,0.3)]' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
          >
            SAT BASE
          </button>
          <button 
            onClick={() => setActiveTab('lessons')}
            className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'lessons' ? 'bg-[#FEC204] text-black shadow-[0_0_10px_rgba(254,194,4,0.3)]' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
          >
            DARSLAR
          </button>
        </div>
        <div className="flex gap-2">
          {activeTab === 'lessons' ? (
             <div className="flex items-center gap-2">
               <button 
                  onClick={() => {
                    const saved = localStorage.getItem('satDefaultAssignedGroups');
                    if (saved) {
                      setBulkAssignGroupIds(JSON.parse(saved));
                    }
                    setIsBulkLessonAssignModalOpen(true);
                  }}
                  className="bg-white/5 border border-white/10 text-white px-6 py-2.5 rounded-[12px] font-bold hover:bg-white/10 transition-colors flex items-center gap-2 text-[14px]"
               >
                  <Users size={18} /> Guruhlarga biriktirish
               </button>
               <button 
                  onClick={() => setIsLessonModalOpen(true)}
                  className="bg-[#FEC204] text-black px-6 py-2.5 rounded-[12px] font-bold hover:bg-[#FEC204]/90 transition-colors shadow-[0_0_15px_rgba(254,194,4,0.3)] flex items-center gap-2 text-[14px]"
               >
                  <span className="text-xl leading-none">+</span> Dars qo'shish
               </button>
             </div>
          ) : activeTab === 'base' ? (
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
          ) : (
             <button onClick={openExamAdd} className="bg-[#FEC204] text-black px-6 py-2.5 rounded-[12px] font-bold hover:bg-[#FEC204]/90 transition-colors shadow-[0_0_15px_rgba(254,194,4,0.3)] flex items-center gap-2 text-[14px]">
                <span className="text-xl leading-none">+</span> Sat online test
             </button>
          )}
        </div>
      </div>
      <div>
        {activeTab === 'exams' ? (
           <>
              <div className="mb-4">
                 <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">Markaz ichki SAT imtihonlari ro'yxati</p>
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
          {(user?.role === 'teacher' ? satExams.filter(ex => !ex.groupId || groups.some(g => g.id === ex.groupId && g.teacherName === user.fullName)) : satExams).map(exam => (
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
                  <span className="text-white/60">{getGroupsName(exam)}</span>
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
           </>
        ) : activeTab === 'base' ? ( 
           <>
              <div className="mb-4">
                 <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">Barcha yaratilgan testlar to'plami</p>
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
           </>
        ) : (
           <>
              <div className="mb-4">
                 <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">Markaz SAT darsliklari va videokurslari</p>
              </div>
              {lessons.length === 0 ? (
              <div className="glass-panel p-6 flex flex-col items-center justify-center opacity-70 border-dashed border-2 px-12 py-16">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <span className="text-[24px]">🎥</span>
                </div>
                <h3 className="text-[18px] font-bold text-white mb-2">Hali darslar qo'shilmagan</h3>
                <p className="text-[13px] text-white/40 text-center max-w-sm font-medium">Bu yerda siz o'quvchilaringiz uchun onlayn SAT darslari, videolar, va qo'shimcha materiallar yuklashingiz mumkin bo'ladi.</p>
              </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lessons.map(lesson => (
                    <div key={lesson.id} className="glass-panel p-5 relative group border border-white/5 hover:border-[#FEC204]/50 transition-colors">
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleLessonDelete(lesson.id)} className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <h3 className="text-[16px] font-bold text-[#FEC204] mb-4">{lesson.title}</h3>
                      
                      <div className="flex flex-col gap-2 mt-4">
                        <button 
                          onClick={() => handleHomeworkClick(lesson)}
                          className="w-full py-2.5 rounded-lg border border-[#FEC204]/30 text-[#FEC204] font-bold text-sm hover:bg-[#FEC204]/10 transition-colors"
                        >
                          {lesson.homeworkTestId ? "Uyga vazifani tahrirlash" : "Uyga vazifa kiritish"}
                        </button>
                        <button 
                          onClick={() => {
                            {
                              const engs = (lesson.vocabularyEng || '').split('\n').map(s => s.trim());
                              const uzs = (lesson.vocabularyUz || '').split('\n').map(s => s.trim());
                              const maxLen = Math.max(engs.length, uzs.length, 1);
                              const pairs = [];
                              for (let i = 0; i < maxLen; i++) {
                                pairs.push({
                                  eng: engs[i] || '',
                                  uz: uzs[i] || ''
                                });
                              }
                              setVocabForm({ id: lesson.id, pairs: pairs.filter(p => p.eng || p.uz).length ? pairs.filter(p => p.eng || p.uz) : [{ eng: '', uz: '' }] });
                            }
                            setIsVocabModalOpen(true);
                          }}
                          className="w-full py-2.5 rounded-lg border border-white/10 text-white/70 font-bold text-sm hover:bg-white/5 hover:text-white transition-colors"
                        >
                          Lug'atlarni {(lesson.vocabularyEng || lesson.vocabularyUz) ? 'tahrirlash' : 'kiritish'}
                        </button>
                        
                        <button 
                          onClick={() => {
                            setAssigningLesson(lesson);
                            setLessonAssignGroupIds(lesson.activeGroups || []);
                            setIsLessonAssignModalOpen(true);
                          }}
                          className="w-full py-2.5 rounded-lg bg-white/5 text-white/90 font-bold text-sm hover:bg-white/10 transition-colors mt-2"
                        >
                          Darsni boshlash
                        </button>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-white/5">
                        <button
                          onClick={() => handleViewResults(lesson)}
                          className="w-full py-2.5 rounded-lg bg-[rgba(254,194,4,0.1)] text-[#FEC204] border border-[#FEC204]/20 font-bold text-sm hover:bg-[rgba(254,194,4,0.2)] transition-colors flex items-center justify-center gap-2"
                        >
                          <Eye size={16} /> Natijalarni ko'rish
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}
           </>
        )}
      </div>

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
                  {groups.filter(g => user?.role !== 'teacher' || g.teacherName === user?.fullName).map(g => <option key={g.id} value={g.id} className="bg-[#1a1a1a]">{g.name}</option>)}
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


      {isLessonAssignModalOpen && assigningLesson && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setIsLessonAssignModalOpen(false)}>
          <div className="bg-[#1a1a1a] rounded-[24px] w-full max-w-md border border-white/10 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-[18px] font-black text-white">Darsni boshlash</h2>
              <button type="button" onClick={() => setIsLessonAssignModalOpen(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleLessonStartSave} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-white/60 uppercase tracking-wider mb-2">Guruhlarni tanlang *</label>
                <div className="max-h-[200px] overflow-y-auto custom-scrollbar space-y-2 bg-white/5 border border-white/10 rounded-xl p-3">
                  {groups.filter(g => (user?.role !== 'teacher' || g.teacherName === user?.fullName) && assigningLesson.assignedGroups?.includes(g.id)).map(g => (
                    <label key={g.id} className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-white/5 rounded-lg transition-colors">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${lessonAssignGroupIds.includes(g.id) ? 'bg-[#FEC204] border-[#FEC204] text-black' : 'border-white/20 text-transparent group-hover:border-[#FEC204]'}`}>
                        <Check size={14} />
                      </div>
                      <span className="text-white/80 group-hover:text-white transition-colors">{g.name}</span>
                      <input 
                        type="checkbox"
                        className="hidden"
                        checked={lessonAssignGroupIds.includes(g.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setLessonAssignGroupIds(prev => [...prev, g.id]);
                          } else {
                            setLessonAssignGroupIds(prev => prev.filter(id => id !== g.id));
                          }
                        }}
                      />
                    </label>
                  ))}
                  {groups.filter(g => (user?.role !== 'teacher' || g.teacherName === user?.fullName) && assigningLesson.assignedGroups?.includes(g.id)).length === 0 && (
                    <p className="text-white/40 text-sm text-center py-4">Guruhlar biriktirilmagan</p>
                  )}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsLessonAssignModalOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-white/70 transition-colors">Bekor qilish</button>
                <button type="submit" className="flex-1 py-3 bg-[#FEC204] hover:bg-[#e5ae03] text-black rounded-xl font-bold transition-colors shadow-[0_0_15px_rgba(254,194,4,0.3)]">Boshlash</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isBulkLessonAssignModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setIsBulkLessonAssignModalOpen(false)}>
          <div className="bg-[#1a1a1a] rounded-[24px] w-full max-w-md border border-white/10 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-[18px] font-black text-white">Barcha darslarni biriktirish</h2>
              <button type="button" onClick={() => setIsBulkLessonAssignModalOpen(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleBulkAssignSave} className="p-6 space-y-4">
              <p className="text-white/60 text-[14px]">Ushbu bo'limdagi barcha darslar va vazifalar tanlangan guruhlarga bir vaqtda biriktiriladi.</p>
              <div>
                <label className="block text-[12px] font-bold text-white/60 uppercase tracking-wider mb-2">Guruhlarni tanlang *</label>
                <div className="max-h-[200px] overflow-y-auto custom-scrollbar space-y-2 bg-white/5 border border-white/10 rounded-xl p-3">
                  {groups.filter(g => user?.role !== 'teacher' || g.teacherName === user?.fullName).map(g => (
                    <label key={g.id} className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-white/5 rounded-lg transition-colors">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${bulkAssignGroupIds.includes(g.id) ? 'bg-[#FEC204] border-[#FEC204] text-black' : 'border-white/20 text-transparent group-hover:border-[#FEC204]'}`}>
                        <Check size={14} />
                      </div>
                      <span className="text-white/80 group-hover:text-white transition-colors">{g.name}</span>
                      <input 
                        type="checkbox"
                        className="hidden"
                        checked={bulkAssignGroupIds.includes(g.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBulkAssignGroupIds(prev => [...prev, g.id]);
                          } else {
                            setBulkAssignGroupIds(prev => prev.filter(id => id !== g.id));
                          }
                        }}
                      />
                    </label>
                  ))}
                  {groups.filter(g => user?.role !== 'teacher' || g.teacherName === user?.fullName).length === 0 && (
                    <p className="text-white/40 text-sm text-center py-4">Guruhlar topilmadi</p>
                  )}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsBulkLessonAssignModalOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-white/70 transition-colors">Bekor qilish</button>
                <button type="submit" disabled={bulkAssignGroupIds.length === 0} className="flex-1 py-3 bg-[#FEC204] hover:bg-[#e5ae03] text-black rounded-xl font-bold transition-colors shadow-[0_0_15px_rgba(254,194,4,0.3)] disabled:opacity-50 disabled:shadow-none">Biriktirish</button>
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
                <select required value={testConfig.satType} onChange={e => {
                    const type = e.target.value;
                    if (type === 'SAT real EXAM') {
                      setTestConfig({ ...testConfig, satType: type, questionCount: 44, isFastMode: false });
                    } else {
                      setTestConfig({ ...testConfig, satType: type });
                    }
                  }} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-[color:var(--theme-text-primary)] appearance-none" style={{ colorScheme: "dark" }}>
                  <option value="SAT Mavzulashtirilgan" className="bg-[#1a1a1a]">SAT Mavzulashtirilgan</option>
                  <option value="SAT Homework" className="bg-[#1a1a1a]">SAT Homework</option>
                  <option value="SAT practice" className="bg-[#1a1a1a]">SAT practice</option>
                  <option value="SAT real EXAM" className="bg-[#1a1a1a]">SAT real EXAM</option>
                </select>
              </div>
              
              <div>
                <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Test formati</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => testConfig.satType !== 'SAT real EXAM' && setTestConfig({...testConfig, isFastMode: false})} className={`py-3 px-4 rounded-xl font-bold text-sm transition-colors border-2 ${!testConfig.isFastMode ? 'bg-[#FEC204]/10 border-[#FEC204] text-[#FEC204]' : 'bg-white/5 border-transparent text-white/50 hover:bg-white/10'}`}>Savol + Javob</button>
                  <button type="button" onClick={() => testConfig.satType !== 'SAT real EXAM' && setTestConfig({...testConfig, isFastMode: true})} className={`py-3 px-4 rounded-xl font-bold text-sm transition-colors border-2 ${testConfig.isFastMode ? 'bg-[#FEC204]/10 border-[#FEC204] text-[#FEC204]' : 'bg-white/5 border-transparent text-white/50 hover:bg-white/10'}`}>Faqat Javoblar</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Savollar soni</label>
                  <input required type="number" min="1" max="100" value={testConfig.questionCount} onChange={e=>setTestConfig({...testConfig, questionCount: Number(e.target.value)})} disabled={testConfig.satType === 'SAT real EXAM'} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white disabled:opacity-50" />
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
          onSave={async (savedTest) => { 
            if (savedTest && savedTest.id && editingLessonId) {
              try {
                await updateDoc(doc(db, 'sat_lessons', editingLessonId), {
                  homeworkTestId: savedTest.id
                });
                toast.success("Uyga vazifa darsga biriktirildi!");
              } catch(e) {
                console.error(e);
                toast.error("Darsni yangilashda xatolik");
              }
            }
          }} 
        />
      )}
      {isLessonModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center animate-in fade-in duration-200">
          <div className="w-full md:w-[500px] bg-[#0d0d0d] border border-white/10 rounded-[20px] p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[18px] font-black tracking-tight text-white">Yangi dars qo'shish</h2>
              <button onClick={() => setIsLessonModalOpen(false)} className="p-2 bg-white/5 rounded-full text-white/40 hover:bg-white/10 hover:text-white transition-colors"><X size={16} /></button>
            </div>
            <form onSubmit={handleLessonSave} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Dars nomi *</label>
                <input required placeholder="Masalan: Unit 1 - Reading strategies" value={lessonForm.title} onChange={e => setLessonForm({...lessonForm, title: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsLessonModalOpen(false)} className="flex-1 py-3 px-4 rounded-xl font-bold text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                  Bekor qilish
                </button>
                <button type="submit" className="flex-1 py-3 px-4 rounded-xl font-bold bg-[#FEC204] text-black hover:bg-[#e5ae03] transition-colors shadow-[0_0_20px_rgba(254,194,4,0.3)]">
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isVocabModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center animate-in fade-in duration-200">
          <div className="w-full md:w-[500px] bg-[#0d0d0d] border border-white/10 rounded-[20px] p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[18px] font-black tracking-tight text-white">Lug'atlarni kiritish</h2>
              <button onClick={() => setIsVocabModalOpen(false)} className="p-2 bg-white/5 rounded-full text-white/40 hover:bg-white/10 hover:text-white transition-colors"><X size={16} /></button>
            </div>
            <form onSubmit={handleVocabSave} className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-4">
                  <label className="text-[10px] uppercase font-bold text-[#FEC204]">Inglizcha</label>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    type="button" 
                    onClick={() => setIsTemplateMode(!isTemplateMode)}
                    className="text-[10px] uppercase font-bold text-[#FEC204] hover:text-white transition-colors underline"
                  >
                    {isTemplateMode ? 'Jadval orqali kiritish' : 'Shablon orqali kiritish'}
                  </button>
                  <label className="text-[10px] uppercase font-bold text-white/60">O'zbekcha</label>
                </div>
              </div>
              
              {isTemplateMode ? (
                <div className="space-y-3">
                  <textarea 
                    rows={8} 
                    placeholder="[#apple;+olma]
[#book;+kitob]" 
                    value={templateText} 
                    onChange={e => setTemplateText(e.target.value)} 
                    className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white resize-none font-mono" 
                  />
                  <button
                    type="button"
                    onClick={handleParseTemplate}
                    className="w-full py-2.5 rounded-lg font-bold bg-white/10 text-white hover:bg-white/20 transition-colors text-sm"
                  >
                    Tartiblash
                  </button>
                </div>
              ) : (
                <>
                  <div ref={vocabContainerRef} className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-2 pr-1">
                    {vocabForm.pairs.map((pair, idx) => (
                      <div key={idx} className="flex gap-3 items-center">
                        <div className="w-5 text-right text-xs font-bold text-white/40">
                          {idx + 1}.
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <input
                            placeholder="Apple"
                            value={pair.eng}
                            onChange={(e) => handleUpdateVocabPair(idx, 'eng', e.target.value)}
                            className="w-full glass-panel px-3 py-2 outline-none focus:border-[#FEC204]/50 text-sm text-white"
                          />
                          <input
                            placeholder="Olma"
                            value={pair.uz}
                            onChange={(e) => handleUpdateVocabPair(idx, 'uz', e.target.value)}
                            className="w-full glass-panel px-3 py-2 outline-none focus:border-[#FEC204]/50 text-sm text-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVocabPair}
                    className="w-full py-2 rounded-lg border border-white/10 text-white/70 hover:bg-white/5 hover:text-white transition-colors text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <span className="text-lg leading-none">+</span> Qator qo'shish
                  </button>
                </>
              )}
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsVocabModalOpen(false)} className="flex-1 py-3 px-4 rounded-xl font-bold text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                  Bekor qilish
                </button>
                <button type="submit" className="flex-1 py-3 px-4 rounded-xl font-bold bg-[#FEC204] text-black hover:bg-[#e5ae03] transition-colors shadow-[0_0_20px_rgba(254,194,4,0.3)]">
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingLessonResults && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setViewingLessonResults(null)}>
          <div className="bg-[#1a1a1a] rounded-[24px] w-full max-w-4xl max-h-[90vh] flex flex-col border border-white/10 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-[20px] font-black text-white">{viewingLessonResults.title} natijalari</h2>
                <p className="text-[13px] text-white/50 mt-1">Guruhlar: {viewingLessonResults.assignedGroups.map((gId: string) => groups.find(g => g.id === gId)?.name || gId).join(', ')}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDownloadResults(viewingLessonResults)}
                  className="px-4 py-2 rounded-xl bg-[rgba(254,194,4,0.1)] text-[#FEC204] border border-[#FEC204]/20 font-bold text-sm hover:bg-[rgba(254,194,4,0.2)] transition-colors flex items-center gap-2"
                >
                  <FileText size={16} /> Excelga yuklash
                </button>
                <button type="button" onClick={() => setViewingLessonResults(null)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {isLoadingResults ? (
                <div className="flex flex-col items-center justify-center h-40">
                  <div className="w-8 h-8 border-4 border-[#FEC204] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-white/50 mt-4 text-sm">Natijalar yuklanmoqda...</p>
                </div>
              ) : lessonResultsData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-white/40">
                  Bu darsga biriktirilgan guruhlarda o'quvchilar yo'q.
                </div>
              ) : (
                <div className="space-y-4">
                  {lessonResultsData.map((item, idx) => {
                    const student = item.student;
                    const results = item.results;
                    const hasSubmitted = results.length > 0;
                    const bestResult = hasSubmitted ? results.reduce((prev: any, current: any) => (prev.score > current.score) ? prev : current) : null;
                    
                    return (
                      <div key={student.id} className={`p-4 rounded-xl border ${hasSubmitted ? 'bg-white/5 border-white/10' : 'bg-red-500/5 border-red-500/20'}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-white text-[16px]">{student.fullName || 'Nomsiz o\'quvchi'}</span>
                              {!hasSubmitted && (
                                <span className="bg-red-500/20 text-red-400 text-[10px] uppercase font-bold px-2 py-1 rounded">Topshirmagan</span>
                              )}
                            </div>
                            <div className="text-[12px] text-white/40 mt-1">
                              Guruh: {student.uGroups.map((gId: string) => groups.find(g => g.id === gId)?.name || gId).join(', ')}
                            </div>
                          </div>
                          {hasSubmitted && (
                            <div className="text-right">
                              <div className="text-[12px] text-white/40 uppercase font-bold tracking-wider mb-1">Eng yuqori natija</div>
                              <div className="text-2xl font-black text-[#FEC204]">{bestResult.score} <span className="text-sm opacity-50 text-white font-bold">/ {bestResult.total}</span></div>
                            </div>
                          )}
                        </div>
                        
                        {hasSubmitted && (
                          <div className="mt-4">
                            <p className="text-[11px] uppercase tracking-wider font-bold text-white/30 mb-2">Barcha urinishlar ({results.length} marta):</p>
                            <div className="space-y-2">
                              {results.map((r: any, rIdx: number) => (
                                <div key={r.id || rIdx} className="flex justify-between items-center bg-black/40 px-3 py-2 rounded-lg text-sm">
                                  <span className="text-white/60 font-medium">
                                    {r.submittedAt ? new Date(r.submittedAt).toLocaleString('uz-UZ', {day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'}) : 'Sana yo\'q'}
                                  </span>
                                  <span className="font-bold text-white">{r.score} / {r.total}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
