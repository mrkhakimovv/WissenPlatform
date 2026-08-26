import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Phone, Mail, BookOpen, CalendarIcon, Download, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { requestNotificationPermission } from '../../lib/messaging';
import { Bell, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

import { db, doc, getDoc, collection, query, where, getDocs } from '../../lib/firebase';
import { Group, Attendance } from '../../types';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function StudentProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [group, setGroup] = useState<Group | null>(null);
  const [attendanceRate, setAttendanceRate] = useState<number>(0);
  const [monthsCount, setMonthsCount] = useState<number>(0);
  const { isInstallable, installApp } = usePWAInstall();

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      
      // Load group(s)
      const userGroups = user.groups?.length ? user.groups : (user.groupId ? [user.groupId] : []);
      if (userGroups.length > 0) {
        try {
          const groupDocs = await Promise.all(userGroups.map(id => getDoc(doc(db, 'groups', id))));
          const fetchedGroups = groupDocs.filter(d => d.exists()).map(d => ({ id: d.id, ...d.data() } as Group));
          if (fetchedGroups.length > 0) {
            setGroup(fetchedGroups[0]); // Set the primary one for the state
          }
        } catch (e) {
          console.error('Error loading group', e);
        }
      }

      // Load attendance
      try {
        const q = query(collection(db, 'attendance'), where('studentId', '==', user.id));
        const snap = await getDocs(q);
        const records = snap.docs.map(d => d.data() as Attendance);
        const presentCount = records.filter(r => r.status === 'present').length;
        const totalCount = records.length;
        if (totalCount > 0) {
          setAttendanceRate(Math.round((presentCount / totalCount) * 100));
        } else {
          setAttendanceRate(0);
        }
      } catch (e) {
        console.error('Error loading attendance', e);
      }

      // Calculate months
      if (user.joinedDate) {
        const start = new Date(user.joinedDate);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - start.getTime());
        const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
        setMonthsCount(diffMonths);
      }
    }
    loadData();
  }, [user]);

  const userStatus = 'active'; // or based on a real field
  const joinedDateFormatted = user?.joinedDate ? format(new Date(user.joinedDate), 'dd.MM.yyyy') : 'Noma\'lum';
  const groupText = group ? `${group.subject} • ${group.name}` : (user?.subject ? user.subject : 'Biriktirilmagan');

  const handleInstallClick = () => {};
  
  const handleSwitchAccount = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="space-y-6 pt-4 pb-6">
      {/* Profile Header Block */}
      <div className="flex flex-col items-center relative">

        <div className="relative mb-4">
          <div className="w-[72px] h-[72px] rounded-full border-[2.5px] border-[#FEC204] p-[1.5px]">
            <div className="w-full h-full rounded-full bg-[#FEC204] flex items-center justify-center text-[22px] font-black text-[#000]">
              {user?.fullName?.substring(0, 2).toUpperCase() || 'ST'}
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#22c55e] border-[2.5px] border-[color:var(--surface-color)] -mr-0.5" />
        </div>
        
        <h1 className="text-[18px] font-[800] text-white mb-0.5 tracking-tight">{user?.fullName || "A. Rustamov"}</h1>
        <p className="text-[11px] text-white/40 font-bold mb-3">{user?.subject ? `${user.subject} o'quvchisi` : 'O\'quvchi'}</p>
        
        <span className="px-3 py-1 bg-[rgba(254,194,4,0.12)] border border-[rgba(254,194,4,0.3)] text-[#a07800] text-[10px] uppercase font-[900] tracking-[1px] rounded-full">
          ID: {user?.id?.substring(0,8).toUpperCase() || 'WSSN-102'}
        </span>
      </div>

      {/* Stats Row */}
      <div>
        <h2 className="text-[10px] uppercase tracking-[2px] font-bold text-white/40 mt-6 mb-2 px-2">Kunlik faollik vaqti (Daqiqa)</h2>
        <div className="glass-panel p-4 h-48 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
              <BarChart data={Array.from({length: 7}).map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - 6 + i);
                const ds = [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
                return { date: ds.slice(-5).replace('-', '.'), mins: user?.dailyUsage?.[ds] || 0 };
              })}>
                <XAxis dataKey="date" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: '#ffffff10'}} contentStyle={{backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff'}} itemStyle={{color: '#FEC204'}} labelStyle={{color: '#888'}} />
                <Bar dataKey="mins" name="Daqiqa" fill="#FEC204" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
      
      {/* Info Sections */}
      <div>
        <h2 className="text-[10px] uppercase tracking-[2px] font-bold text-white/40 mt-6 mb-2 px-2">Shaxsiy ma'lumotlar</h2>
        <div className="glass-panel p-4 !p-2 space-y-1">
          <div className="flex items-center gap-3 p-2 hover:bg-[color:var(--surface-color)] rounded-[10px] transition-colors">
            <div className="w-8 h-8 rounded-[8px] bg-blue-50 flex items-center justify-center text-blue-500"><Phone size={16} /></div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-white/40">Telefon</p>
              <p className="text-[13px] font-[700] text-white">{user?.phone || 'Ko\'rsatilmagan'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 hover:bg-[color:var(--surface-color)] rounded-[10px] transition-colors">
            <div className="w-8 h-8 rounded-[8px] bg-purple-50 flex items-center justify-center text-purple-500"><Mail size={16} /></div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-white/40">Login</p>
              <p className="text-[13px] font-[700] text-white">{user?.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 hover:bg-[color:var(--surface-color)] rounded-[10px] transition-colors">
            <div className="w-8 h-8 rounded-[8px] bg-red-50 flex items-center justify-center text-red-500"><Lock size={16} /></div>
            <div className="flex-1 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-white/40">Parol</p>
                <p className="text-[13px] font-[700] text-white">{user?.password || 'Ko\'rsatilmagan'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-[10px] uppercase tracking-[2px] font-bold text-white/40 mt-6 mb-2 px-2">Bildirishnomalar</h2>
        <div className="glass-panel p-4 !p-2 space-y-1">
          <button 
            onClick={() => requestNotificationPermission()}
            className="w-full flex items-center justify-between p-3 hover:bg-[color:var(--surface-color)] rounded-[10px] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[8px] bg-[#FEC204]/10 flex items-center justify-center text-[#FEC204]"><Bell size={16} /></div>
              <div className="flex-1 text-left">
                <p className="text-[13px] font-[700] text-white">Bildirishnomalarni yoqish</p>
                <p className="text-[10px] font-bold text-white/40">Yangi xabarlarni o'tkazib yubormaslik uchun</p>
              </div>
            </div>
          </button>
        </div>
      </div>
      
      <div>
        <h2 className="text-[10px] uppercase tracking-[2px] font-bold text-white/40 mt-6 mb-2 px-2">O'quv ma'lumotlari</h2>
        <div className="glass-panel p-4 !p-2 space-y-1">
          <div className="flex items-center gap-3 p-2 hover:bg-[color:var(--surface-color)] rounded-[10px] transition-colors">
            <div className="w-8 h-8 rounded-[8px] bg-orange-50 flex items-center justify-center text-orange-500"><BookOpen size={16} /></div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-white/40">Guruh</p>
              <p className="text-[13px] font-[700] text-white">{groupText}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 hover:bg-[color:var(--surface-color)] rounded-[10px] transition-colors">
            <div className="w-8 h-8 rounded-[8px] bg-teal-50 flex items-center justify-center text-teal-600"><CalendarIcon size={16} /></div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-white/40">O'quv kursi boshlandi</p>
              <p className="text-[13px] font-[700] text-white">{joinedDateFormatted}</p>
            </div>
          </div>
        </div>
      </div>




      <p className="text-center text-[10px] font-bold text-white/40 py-4">Wissen Edu v1.0.0</p>
    </div>
  );
}
