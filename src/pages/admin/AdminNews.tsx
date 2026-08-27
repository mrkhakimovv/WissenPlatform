import { useAuth } from '../../contexts/AuthContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, doc, where, getDocs } from '../../lib/firebase';
import { db } from '../../lib/firebase';
import { Plus, X, Edit2, Trash2, Megaphone, Heart, MessageCircle, Send, Check, Eye, Image as ImageIcon, Video, Link, UploadCloud, Smile } from 'lucide-react';
import toast from 'react-hot-toast';
import { NewsItem } from '../../types';
import { sendAutoNotification } from '../../lib/notificationSender';

const formatDateSeparator = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Bugun';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Kecha';
  } else {
    return date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' });
  }
};

const STICKERS = ['👍', '❤️', '😂', '🔥', '🎉', '😢', '👏', '🙌'];

export default function AdminNews() {
  const { confirm } = useConfirm();
  const { user } = useAuth();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [editingComment, setEditingComment] = useState<{ newsId: string, commentId: string, text: string } | null>(null);
  const [openComments, setOpenComments] = useState<{ [key: string]: boolean }>({});
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);

  const toggleComments = (id: string) => {
    setOpenComments(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDeleteComment = async (newsId: string, commentId: string, comments: any[]) => {
    if (await confirm({ title: 'Diqqat', message: "Fikrni o'chirishni tasdiqlaysizmi?" })) {
      try {
        const updatedComments = comments.filter(c => c.id !== commentId);
        await updateDoc(doc(db, 'news', newsId), { comments: updatedComments });
        toast.success("Fikr o'chirildi");
      } catch (error) {
        toast.error("Xatolik");
      }
    }
  };

  const handleReact = async (newsId: string, commentId: string, emoji: string, comments: any[]) => {
    if (!user) return;
    try {
      const updatedComments = comments.map(c => {
        if (c.id === commentId) {
          const reactions = ((c as any).reactions) || ({} as Record<string, string[]>);
          const usersWithEmoji = reactions[emoji] || [];
          const hasReacted = usersWithEmoji.includes(user.id);
          
          if (hasReacted) {
            reactions[emoji] = usersWithEmoji.filter((id: string) => id !== user.id);
            if (reactions[emoji].length === 0) delete reactions[emoji];
          } else {
            reactions[emoji] = [...usersWithEmoji, user.id];
          }
          
          return { ...c, reactions };
        }
        return c;
      });
      await updateDoc(doc(db, 'news', newsId), { comments: updatedComments });
      setShowReactionPicker(null);
    } catch (err) {
      console.error(err);
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleSaveComment = async (newsId: string, comments: any[]) => {
    if (!editingComment || !editingComment.text.trim()) return;
    try {
      const updatedComments = comments.map(c => 
        c.id === editingComment.commentId ? { ...c, text: editingComment.text.trim() } : c
      );
      await updateDoc(doc(db, 'news', newsId), { comments: updatedComments });
      setEditingComment(null);
      toast.success("Fikr yangilandi");
    } catch (error) {
      toast.error("Xatolik");
    }
  };

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    tag: string;
    color: string;
    active: boolean;
    mediaUrl: string;
    mediaType: 'image' | 'video' | '';
  }>({
    title: '',
    description: '',
    tag: '',
    color: '#FEC204',
    active: true,
    mediaUrl: '',
    mediaType: ''
  });
  const [mediaTab, setMediaTab] = useState<'upload' | 'url'>('url');
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check size limit (max ~700KB for firestore doc)
    if (file.size > 700 * 1024) {
      toast.error("Fayl hajmi juda katta! Iltimos, kichikroq fayl yuklang yoki havola (URL) dan foydalaning.");
      return;
    }
    
    const isVideo = file.type.startsWith('video/');
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData({
        ...formData,
        mediaUrl: event.target?.result as string,
        mediaType: isVideo ? 'video' : 'image'
      });
      toast.success("Fayl yuklandi");
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'news'), orderBy('publishedAt', 'desc')), snap => {
      setNews(snap.docs.map(d => ({ id: d.id, ...d.data() } as NewsItem)));
    });
    return () => unsub();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setFormData({ title: '', description: '', tag: 'Yangilik', color: '#FEC204', active: true, mediaUrl: '', mediaType: '' });
    setIsModalOpen(true);
  };

  const openEdit = (item: NewsItem) => {
    setEditingId(item.id);
    setFormData({
      title: item.title || '',
      description: item.description || '',
      tag: item.tag || '',
      color: item.color || '#FEC204',
      active: item.active !== undefined ? item.active : true,
      mediaUrl: item.mediaUrl || '',
      mediaType: item.mediaType || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (item: NewsItem) => {
    if (await confirm({ title: 'Diqqat', message: "Yangilikni o'chirishni tasdiqlaysizmi?" })) {
      try {
        await deleteDoc(doc(db, 'news', item.id));
        
        try {
          const q = query(
            collection(db, 'notifications'),
            where('title', '==', "Yangi e'lon: " + item.title),
            where('link', '==', '/student/news')
          );
          const snap = await getDocs(q);
          const deletePromises = snap.docs.map(d => deleteDoc(doc(db, 'notifications', d.id)));
          await Promise.all(deletePromises);
        } catch (notifErr) {
          console.error("Xabarnomalarni o'chirishda xato:", notifErr);
        }

        toast.success("O'chirildi");
      } catch (err) {
        console.error('Kontekst:', err);
        const msg = err instanceof Error ? err.message : "Noma'lum xatolik";
        toast.error(msg);
      }
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      await updateDoc(doc(db, 'news', id), { active: !currentActive });
    } catch (err) {
      console.error('Kontekst:', err);
      const msg = err instanceof Error ? err.message : "Noma'lum xatolik";
      toast.error(msg);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, 'news', editingId), formData);
        toast.success("Yangilandi");
      } else {
        await addDoc(collection(db, 'news'), {
          ...formData,
          publishedAt: new Date().toISOString()
        });
        toast.success("Qo'shildi");
        
        // Auto push notification for new news
        const notifRes = await sendAutoNotification({
          title: "Yangi e'lon: " + formData.title,
          body: formData.description.substring(0, 100) + (formData.description.length > 100 ? '...' : ''),
          link: '/student/news',
          target: 'all'
        });
        
        if (notifRes?.success && notifRes.data?.sent !== undefined) {
          toast.success(`Xabarnoma ${notifRes.data.sent} ta kishiga yuborildi. (${notifRes.data.failed} ta xato)`);
        } else {
          toast.error("Xabarnoma yuborilmadi: " + (notifRes?.error || "Xatolik"));
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Kontekst:', err);
      const msg = err instanceof Error ? err.message : "Noma'lum xatolik";
      toast.error(msg);
    }
  };

  const presetColors = ['#FEC204', '#22c55e', '#3b82f6', '#ef4444', '#a855f7', '#ec4899'];

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-black tracking-tight text-white mb-1">Yangiliklar</h1>
          <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">O'quvchilarga e'lon va yangiliklar</p>
        </div>
        <button onClick={openAdd} className="glass-panel px-6 py-3 font-bold text-[#FEC204] hover:bg-[#FEC204] hover:text-black transition-colors rounded-[12px]">
          Yangilik yozish
        </button>
      </div>

      {news.length === 0 ? (
        <div className="glass-panel p-6 flex flex-col items-center justify-center opacity-70 border-dashed border-2 px-12 py-16">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <span className="text-[24px]">📢</span>
          </div>
          <h3 className="text-[18px] font-bold text-white mb-2">Hali yangiliklar yo'q</h3>
          <p className="text-[13px] text-white/40 text-center max-w-sm font-medium">Barcha o'quvchilarga ko'rinadigan xabarlar va e'lonlar markazini ishlating.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {news.map(item => (
            <div key={item.id} className={`glass-panel p-5 relative transition-opacity ${item.active ? '' : 'opacity-60'}`}>
              <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={() => toggleActive(item.id, item.active)} className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${item.active ? 'bg-green-500/20 text-green-500' : 'bg-white/10 text-white/40'}`}>
                  {item.active ? 'Faol' : 'Nofaol'}
                </button>
                <button onClick={() => openEdit(item)} className="w-7 h-7 rounded bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors">
                  <Edit2 size={12} />
                </button>
                <button onClick={() => handleDelete(item)} className="w-7 h-7 rounded bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>
              
              {item.mediaUrl && (
                <div className="w-full h-[180px] bg-black/40 rounded-xl mb-4 overflow-hidden relative">
                  {item.mediaType === 'video' ? (
                    <video src={item.mediaUrl} className="w-full h-full object-cover" controls preload="metadata" />
                  ) : (
                    <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover" />
                  )}
                </div>
              )}
              
              <div className="mb-2 pr-24">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-[10px] uppercase tracking-[1.5px] font-bold text-white/60">{item.tag}</span>
                  <span className="text-[10px] text-white/30 ml-2">{new Date(item.publishedAt).toLocaleDateString('uz-UZ')}</span>
                </div>
                <h3 className="text-[16px] font-bold text-white leading-snug">{item.title}</h3>
              </div>
              
              <p className="text-[13px] text-white/60 leading-relaxed">
                {item.description}
              </p>
              
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-white/60 group">
                    <Heart size={16} className={item.likes?.length ? 'fill-red-500 text-red-500' : ''} />
                    <span className="text-[12px] font-bold">{item.likes?.length || 0}</span>
                  </div>
                  <button onClick={() => toggleComments(item.id)} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                    <MessageCircle size={16} />
                    <span className="text-[12px] font-bold">{item.comments?.length || 0}</span>
                  </button>
                  <div className="flex items-center gap-2 text-white/40 ml-2">
                    <Eye size={16} />
                    <span className="text-[12px] font-bold">{item.viewedBy?.length || 0}</span>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              {openComments[item.id] && item.comments && item.comments.length > 0 && (
                <div className="mt-4 bg-black/20 rounded-xl p-4">
                  <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {item.comments.map((c, index) => {
                      const isMe = c.userId === user?.id;
                      const currentCommentDate = new Date(c.createdAt).toDateString();
                      const prevCommentDate = index > 0 && item.comments ? new Date(item.comments[index - 1].createdAt).toDateString() : null;
                      const showDateSeparator = currentCommentDate !== prevCommentDate;
                      
                      const reactionsList = Object.entries(((c as any).reactions) || ({} as Record<string, string[]>)).filter(([_, users]) => (users as string[]).length > 0);
                      
                      return (
                      <React.Fragment key={c.id}>
                        {showDateSeparator && (
                          <div className="w-full flex justify-center my-3">
                            <span className="bg-black/30 text-white/50 text-[10px] px-3 py-1 rounded-full font-medium">
                              {formatDateSeparator(c.createdAt)}
                            </span>
                          </div>
                        )}
                        <div className={`flex w-full group relative ${isMe ? 'justify-end' : 'justify-start'} ${showDateSeparator ? 'mt-1' : ''} mb-2`}>
                          <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 relative ${
                            isMe 
                              ? 'bg-[#FEC204] text-black rounded-tr-sm' 
                              : 'bg-white/10 text-white rounded-tl-sm'
                          }`}>
                            <div className="flex justify-between items-start mb-1">
                              {!isMe && (
                                <div className="text-[11px] font-bold opacity-70">
                                  {c.userName}
                                </div>
                              )}
                              {isMe && <div className="text-[11px] font-bold opacity-70">{c.userName}</div>}
                              
                              <div className="flex items-center gap-2  ml-2">
                                <button onClick={() => setEditingComment({ newsId: item.id, commentId: c.id, text: c.text })} className={`${isMe ? 'text-black/50 hover:text-black' : 'text-white/40 hover:text-[#FEC204]'} transition-colors p-1`}>
                                  <Edit2 size={12} />
                                </button>
                                <button onClick={() => handleDeleteComment(item.id, c.id, item.comments || [])} className={`${isMe ? 'text-black/50 hover:text-red-600' : 'text-white/40 hover:text-red-500'} transition-colors p-1`}>
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                            
                            <div className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-1  ${isMe ? '-left-8' : '-right-8'}`}>
                              <div className="relative">
                                <button onClick={() => setShowReactionPicker(showReactionPicker === c.id ? null : c.id)} className="p-1.5 text-white/40 hover:text-[#FEC204] rounded-full hover:bg-white/5">
                                  <Smile size={14} />
                                </button>
                                {showReactionPicker === c.id && (
                                  <div className={`absolute top-full ${isMe ? 'right-0' : 'left-0'} mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl p-2 flex gap-1 z-10 shadow-xl`}>
                                    {STICKERS.map(emoji => (
                                      <button 
                                        key={emoji}
                                        onClick={() => handleReact(item.id, c.id, emoji, item.comments || [])}
                                        className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded text-[16px] transition-colors"
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {editingComment?.commentId === c.id ? (
                              <div className="flex items-center gap-2 mt-1">
                                <input
                                  value={editingComment.text}
                                  onChange={(e) => setEditingComment({ ...editingComment, text: e.target.value })}
                                  className={`flex-1 border rounded px-2 py-1 text-[12px] focus:outline-none ${isMe ? 'bg-black/10 border-black/20 text-black focus:border-black/50' : 'bg-white/5 border-white/10 text-white focus:border-[#FEC204]/50'}`}
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveComment(item.id, item.comments || []);
                                    if (e.key === 'Escape') setEditingComment(null);
                                  }}
                                />
                                <button onClick={() => handleSaveComment(item.id, item.comments || [])} className={`p-1 rounded ${isMe ? 'text-black hover:bg-black/10' : 'text-[#FEC204] hover:bg-white/10'}`}>
                                  <Check size={14} />
                                </button>
                                <button onClick={() => setEditingComment(null)} className={`p-1 rounded ${isMe ? 'text-red-600 hover:bg-black/10' : 'text-red-500 hover:bg-white/10'}`}>
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <p className="text-[13px] leading-relaxed break-words">{c.text}</p>
                            )}
                            
                            <div className={`text-[10px] mt-1 text-right ${isMe ? 'opacity-60' : 'opacity-40'}`}>
                              {new Date(c.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            
                            {reactionsList.length > 0 && (
                              <div className={`absolute -bottom-3 ${isMe ? 'right-2' : 'left-2'} flex items-center gap-1 bg-[#1a1a1a] border border-white/10 rounded-full px-1.5 py-0.5 shadow-sm`}>
                                {reactionsList.map(([emoji, users]) => (
                                  <button 
                                    key={emoji}
                                    onClick={() => handleReact(item.id, c.id, emoji, item.comments || [])}
                                    className={`flex items-center gap-1 text-[11px] ${(users as string[]).includes(user?.id || '') ? 'text-[#FEC204] bg-[#FEC204]/10' : 'text-white/70'} hover:bg-white/5 px-1 rounded-full transition-colors`}
                                  >
                                    <span>{emoji}</span>
                                    <span className="font-medium text-[10px]">{(users as string[]).length}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </React.Fragment>
                    );})}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-end md:justify-center animate-in fade-in duration-200">
          <div className="w-full md:w-[500px] bg-[#0d0d0d] border border-white/10 rounded-t-[20px] md:rounded-[20px] p-5 animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-0 md:zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-[18px] font-black tracking-tight text-white">{editingId ? 'Yangilikni tahrirlash' : 'Yangi e\'lon'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white/5 rounded-full text-white/40"><X size={16} /></button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              <input required placeholder="Sarlavha" value={formData.title || ""} onChange={e=>setFormData({...formData, title: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30 font-bold" />
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Teg</label>
                  <input required placeholder="Masalan: Yangilik" value={formData.tag || ""} onChange={e=>setFormData({...formData, tag: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Rangi</label>
                  <div className="flex gap-2 p-1 pt-2">
                    {presetColors.map(c => (
                      <button key={c} type="button" onClick={() => setFormData({...formData, color: c})} className={`w-8 h-8 rounded-full border-2 transition-transform ${formData.color === c ? 'border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Batafsil matn</label>
                <textarea required placeholder="Yangilik matnini kiriting..." value={formData.description || ""} onChange={e=>setFormData({...formData, description: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30 min-h-[120px] custom-scrollbar" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] uppercase font-bold text-white/40 ml-1 block">Media (Rasm/Video) - Ixtiyoriy</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setMediaTab('url')} className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${mediaTab === 'url' ? 'bg-[#FEC204] text-black' : 'bg-white/10 text-white/50'}`}>URL Havola</button>
                    <button type="button" onClick={() => setMediaTab('upload')} className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${mediaTab === 'upload' ? 'bg-[#FEC204] text-black' : 'bg-white/10 text-white/50'}`}>Yuklash</button>
                  </div>
                </div>
                
                <div className="glass-panel p-3 rounded-xl">
                  {mediaTab === 'url' ? (
                    <div className="space-y-2">
                      <input placeholder="Rasm yoki video havolasini kiriting (https://...)" value={formData.mediaUrl || ""} onChange={e=>setFormData({...formData, mediaUrl: e.target.value})} className="w-full bg-white/5 border border-white/10 p-2 rounded outline-none focus:border-[#FEC204]/50 text-sm text-white placeholder-white/30" />
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setFormData({...formData, mediaType: 'image'})} className={`flex items-center gap-1 text-[11px] px-3 py-1.5 rounded ${formData.mediaType === 'image' ? 'bg-white/20 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}><ImageIcon size={12}/> Rasm</button>
                        <button type="button" onClick={() => setFormData({...formData, mediaType: 'video'})} className={`flex items-center gap-1 text-[11px] px-3 py-1.5 rounded ${formData.mediaType === 'video' ? 'bg-white/20 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}><Video size={12}/> Video</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-white/10 rounded-lg hover:border-white/20 transition-colors relative">
                      <input type="file" accept="image/*,video/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                      <UploadCloud size={24} className="text-white/40 mb-2" />
                      <p className="text-[12px] text-white/60 font-medium">Faylni tanlang yoki shu yerga tashlang</p>
                      <p className="text-[10px] text-white/40 mt-1">Maksimal hajm: 700KB</p>
                    </div>
                  )}
                  
                  {formData.mediaUrl && (
                    <div className="mt-3 relative rounded overflow-hidden bg-black/50 aspect-video flex items-center justify-center">
                      <button type="button" onClick={() => setFormData({...formData, mediaUrl: '', mediaType: ''})} className="absolute top-2 right-2 w-6 h-6 bg-red-500/80 text-white rounded flex items-center justify-center z-10"><X size={14} /></button>
                      {formData.mediaType === 'video' ? (
                        <video src={formData.mediaUrl} controls className="max-w-full max-h-[200px] object-contain" />
                      ) : (
                        <img src={formData.mediaUrl} alt="Preview" className="max-w-full max-h-[200px] object-contain" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 glass-panel cursor-pointer" onClick={() => setFormData({...formData, active: !formData.active})}>
                <div className={`w-5 h-5 flex items-center justify-center rounded-[6px] border ${formData.active ? 'bg-[#FEC204] border-[#FEC204]' : 'border-white/20'}`}>
                  {formData.active && <div className="w-2.5 h-2.5 bg-black rounded-sm"></div>}
                </div>
                <span className="text-sm font-bold text-white">Faol (o'quvchilarga ko'rinadi)</span>
              </div>
              
              <div className="pt-2">
                <button type="submit" className="w-full py-3 bg-[#FEC204] text-black font-bold rounded-[12px] text-sm active:scale-[0.98] transition-transform">
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}