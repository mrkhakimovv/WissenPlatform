import React, { useEffect, useState } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, where } from '../../lib/firebase';
import { db } from '../../lib/firebase';
import { Plus, Search, Users, Trash2 } from 'lucide-react';

export default function AdminGroups() {
  const [groups, setGroups] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Minimal mockup - normally fetch from db
  useEffect(() => {
    const unsubGroups = onSnapshot(query(collection(db, 'groups'), orderBy('createdAt', 'desc')), snap => {
      setGroups(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
    const unsubStudents = onSnapshot(query(collection(db, 'users'), where('role', '==', 'student')), snap => {
      setStudents(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
    return () => { unsubGroups(); unsubStudents(); }
  }, []);

  const getStudentCount = (groupId: string) => students.filter(s => s.groupId === groupId).length;
  
  const filteredGroups = groups.filter(g => g.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-[20px] font-black tracking-[-0.5px] text-white">Guruhlar</h1>
        <button className="w-10 h-10 rounded-[12px] bg-[#FEC204] flex items-center justify-center text-[#000] shadow-sm transform active:scale-95 transition-all">
          <Plus size={20} strokeWidth={3} />
        </button>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <Search size={16} className="text-white/40" />
        </div>
        <input 
          type="text"
          placeholder="Guruh nomini qidirish..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm text-white/90 pl-11 !rounded-[10px]"
        />
      </div>

      <div className="flex flex-col gap-3 mt-4 pb-20">
        {filteredGroups.length === 0 ? (
          <div className="glass-panel p-4 border-dashed flex flex-col items-center justify-center py-10 opacity-70">
            <Users size={32} className="text-white/40 mb-3" />
            <p className="text-[14px] font-bold text-white/40">Guruhlar topilmadi</p>
          </div>
        ) : (
          filteredGroups.map(group => (
            <div key={group.id} className="glass-panel p-4 !rounded-[8px] flex items-center justify-between p-4 active:border-[rgba(254,194,4,0.4)] transition-colors hover:border-[rgba(254,194,4,0.3)]">
              <div>
                <h3 className="text-[13px] font-[700] text-white">{group.name}</h3>
                <p className="text-[10px] text-white/40 mt-1 font-medium">{group.subject} • {group.teacherName}</p>
              </div>
              <div className="text-right">
                <span className="text-[18px] font-[800] text-[#FEC204] tracking-[-0.5px]">{getStudentCount(group.id)}</span>
                <p className="text-[9px] uppercase tracking-[1px] font-bold text-white/40">o'quvchi</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
