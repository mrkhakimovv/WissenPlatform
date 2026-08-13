import { useConfirm } from '../../contexts/ConfirmContext';
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, doc, where, getDocs, getDoc } from '../../lib/firebase';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Group } from '../../types';
import { FileText, Loader2, Image as ImageIcon, CheckCircle, XCircle, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentHomeworks() {
  const { user } = useAuth();
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedHW, setSelectedHW] = useState<any | null>(null);
  
  const [studentImages, setStudentImages] = useState<{data: string, mimeType: string}[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    const userGroups = user?.groups?.length ? user.groups : (user?.groupId ? [user.groupId] : []);
    if (userGroups.length === 0) return;
    const queryGroups = userGroups.slice(0, 10);
    
    
    const fetchGroups = async () => {
      try {
        const groupDocs = await Promise.all(userGroups.map(id => getDoc(doc(db, 'groups', id))));
        const fetchedGroups = groupDocs.filter(d => d.exists()).map(d => ({ id: d.id, ...d.data() } as Group));
        setGroups(fetchedGroups);
      } catch (err) {
        console.error("Error fetching groups", err);
      }
    };
    fetchGroups();

    const unsubHW = onSnapshot(query(collection(db, 'homeworks'), where('groupId', 'in', queryGroups)), snap => {
      setHomeworks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubSub = onSnapshot(query(collection(db, 'submissions'), where('studentId', '==', user.id)), snap => {
      setSubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubHW(); unsubSub(); };
  }, [user]);

  
  const getGroupName = (groupId: string) => {
    const g = groups.find(x => x.id === groupId);
    return g ? g.name : '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newImages: {data: string, mimeType: string}[] = [];
    let processed = 0;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        const [header, base64] = result.split(',');
        const mimeType = header.split(':')[1].split(';')[0];
        
        newImages.push({ data: base64, mimeType });
        processed++;
        if (processed === files.length) {
          setStudentImages(newImages);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleEvaluate = async () => {
    if (studentImages.length === 0) return toast.error("Rasmlar tanlanmagan");
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/vazifa-baholash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          images: studentImages, 
          taskReference: selectedHW.teacherAnalysis 
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Noma\'lum xatolik');
      
      // Save submission
      await addDoc(collection(db, 'submissions'), {
        studentId: user?.id,
        homeworkId: selectedHW.id,
        result: data,
        createdAt: new Date().toISOString()
      });
      
      toast.success("Vazifa muvaffaqiyatli baholandi!");
      setSelectedHW(null);
      setStudentImages([]);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsEvaluating(false);
    }
  };

  if (selectedHW) {
    const existingSubmission = submissions.find(s => s.homeworkId === selectedHW.id);
    return (
      <div className="space-y-6 pb-6 relative h-full">
        <button onClick={() => { setSelectedHW(null); setStudentImages([]); }} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-4">
          <ChevronLeft size={20} /> Orqaga
        </button>
        
        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="text-xl font-bold text-white mb-2">{selectedHW.title}</h2>
          <p className="text-sm text-white/60 mb-6">{selectedHW.description}</p>
          
          {existingSubmission ? (
            <div className="space-y-6">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-white/50 font-bold mb-1">Natija</p>
                  <p className="text-2xl font-black text-[#FEC204]">{existingSubmission.result.score} / 100</p>
                </div>
                {existingSubmission.result.isCorrect ? (
                  <CheckCircle size={32} className="text-green-400" />
                ) : (
                  <XCircle size={32} className="text-red-400" />
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">Fikr-mulohaza (Feedback)</h3>
                <p className="text-sm text-white/70 p-4 bg-white/5 rounded-xl">{existingSubmission.result.feedback}</p>
              </div>
              
              {existingSubmission.result.errorSteps && existingSubmission.result.errorSteps.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-red-400 mb-2 uppercase tracking-wide">Xatolar va To'g'ri yechimlar</h3>
                  <div className="space-y-3">
                    {existingSubmission.result.errorSteps.map((errStep: string, i: number) => (
                      <div key={i} className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-100 whitespace-pre-wrap">
                        {errStep}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div>
                <label className="block text-[11px] uppercase tracking-[1px] font-bold text-[#FEC204] mb-1.5 ml-1">Vazifa yechimi rasmlari</label>
                <input type="file" multiple accept="image/*" onChange={handleFileChange} className="w-full text-sm text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-white/5 file:text-white hover:file:bg-white/10 transition-colors mb-3" />
              </div>
              
              <button 
                onClick={handleEvaluate} 
                disabled={isEvaluating || studentImages.length === 0} 
                className="w-full py-4 btn-primary rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEvaluating ? <Loader2 size={18} className="animate-spin mr-2" /> : <ImageIcon size={18} className="mr-2" />}
                {isEvaluating ? 'AI tekshirmoqda (15-30 soniya kutishingiz mumkin)...' : 'Topshirish va tekshirish'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6 relative">
      <div className="flex flex-col gap-1 mb-6 px-1">
        <h1 className="text-[20px] font-black text-white tracking-[-0.5px]">Vazifalar</h1>
        <p className="text-[12px] font-bold text-white/40 uppercase tracking-[1px]">Sizning uy vazifalaringiz</p>
      </div>

      <div className="space-y-3">
        {homeworks.map(hw => {
          const submission = submissions.find(s => s.homeworkId === hw.id);
          return (
            <div key={hw.id} onClick={() => setSelectedHW(hw)} className="glass-panel-list p-4 rounded-xl border border-white/5 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-[15px] font-bold text-white">{hw.title}</h3>
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-[#FEC204] font-bold">{getGroupName(hw.groupId)}</span>
                </div>
                <p className="text-[11px] font-bold text-white/40 uppercase tracking-wider">
                  Muddati: {hw.deadline ? new Date(hw.deadline).toLocaleString('uz-UZ') : "Noma'lum"}
                </p>
              </div>
              <div>
                {submission ? (
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">Tekshirilgan: {submission.result.score} ball</span>
                ) : (
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">Yangi</span>
                )}
              </div>
            </div>
          );
        })}
        {homeworks.length === 0 && <p className="text-center text-white/40 py-6 text-sm">Vazifalar yo'q</p>}
      </div>
    </div>
  );
}
