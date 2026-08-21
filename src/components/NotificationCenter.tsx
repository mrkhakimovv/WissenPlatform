import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { collection, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const unsub = onSnapshot(collection(db, 'notifications'), (snap) => {
      let all = snap.docs.map(d => ({id: d.id, ...d.data()}));
      
      // Filter for this user
      const myGroups = user.groups?.length ? user.groups : (user.groupId ? [user.groupId] : []);
      
      all = all.filter(n => {
        if (user.role === 'admin') return true; // admin sees all
        if (n.target === 'all') return true;
        if (n.target === 'group' && myGroups.includes(n.targetId)) return true;
        if (n.target === 'user' && n.targetId === user.id) return true;
        return false;
      });
      
      all.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotifications(all.slice(0, 30));
    });
    
    return () => unsub();
  }, [user]);

  const unreadCount = notifications.filter(n => !n.readBy?.includes(user?.id)).length;

  const handleNotificationClick = async (notif: any) => {
    setIsOpen(false);
    
    // Mark as read
    if (user && !notif.readBy?.includes(user.id)) {
      try {
        await updateDoc(doc(db, 'notifications', notif.id), {
          readBy: arrayUnion(user.id)
        });
      } catch(e) {
        console.error("Failed to mark as read", e);
      }
    }
    
    if (notif.link) {
      navigate(notif.link);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors relative"
      >
        <Bell size={20} className={unreadCount > 0 ? "text-[#FEC204] animate-pulse" : "text-white/70"} />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#1a1a1a]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 max-h-[400px] bg-[#1a1a1a] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col z-50"
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
              <h3 className="text-[14px] font-bold text-white">Xabarnomalar</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold text-[#FEC204] bg-[#FEC204]/10 px-2 py-1 rounded-full">
                  {unreadCount} ta yangi
                </span>
              )}
            </div>
            
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-white/40 text-[12px]">
                  Xabarnomalar yo'q
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.map(n => {
                    const isUnread = !n.readBy?.includes(user?.id);
                    return (
                      <div 
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-4 cursor-pointer hover:bg-white/5 transition-colors ${isUnread ? 'bg-[rgba(254,194,4,0.05)]' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`text-[13px] font-bold ${isUnread ? 'text-white' : 'text-white/70'}`}>
                            {n.title}
                          </h4>
                          {isUnread && <div className="w-2 h-2 rounded-full bg-[#FEC204] shrink-0 mt-1" />}
                        </div>
                        <p className={`text-[12px] mt-1 line-clamp-2 ${isUnread ? 'text-white/80' : 'text-white/50'}`}>
                          {n.body}
                        </p>
                        <p className="text-[10px] text-white/30 mt-2">
                          {new Date(n.createdAt).toLocaleString('uz-UZ')}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
