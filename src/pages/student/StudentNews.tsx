import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useConfirm } from '../../contexts/ConfirmContext';
import { useAuth } from '../../contexts/AuthContext';
import { Megaphone, Calendar, Heart, MessageCircle, Send, Eye, Trash2, Smile } from 'lucide-react';
import toast from 'react-hot-toast';

interface Comment {
  reactions?: { [key: string]: string[] };
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

interface NewsItem {
  id: string;
  title: string;
  description: string;
  tag: string;
  color: string;
  publishedAt: string;
  active: boolean;
  likes?: string[];
  comments?: Comment[];
  viewedBy?: string[];
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | '';
}

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

export default function StudentNews() {
  const { confirm } = useConfirm();
  const { user } = useAuth();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
  const [openComments, setOpenComments] = useState<{ [key: string]: boolean }>({});
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);

  const toggleComments = (id: string) => {
    setOpenComments(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    if (!user) return;
    const markAsViewed = async () => {
      try {
        const q = query(collection(db, 'news'), where('active', '==', true));
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);
        let hasUpdates = false;
        snapshot.docs.forEach(docSnap => {
          const data = docSnap.data();
          const viewedBy = data.viewedBy || [];
          if (!viewedBy.includes(user.id)) {
            batch.update(docSnap.ref, { viewedBy: arrayUnion(user.id) });
            hasUpdates = true;
          }
        });
        if (hasUpdates) {
          await batch.commit();
        }
      } catch (e) {
        console.error("Error updating views", e);
      }
    };
    markAsViewed();
  }, [user]);

  useEffect(() => {
    const q = query(
      collection(db, 'news'),
      where('active', '==', true)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NewsItem[];
      
      // Sort by publishedAt descending (newest first)
      newsData.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      
      setNews(newsData);
      setLoading(false);
      
      if (user?.id && newsData.length > 0) {
        const currentRead = JSON.parse(localStorage.getItem(`readNews_${user.id}`) || '[]');
        const newIds = newsData.map(n => n.id);
        const merged = Array.from(new Set([...currentRead, ...newIds]));
        localStorage.setItem(`readNews_${user.id}`, JSON.stringify(merged));
      }
    }, (error) => {
      console.error('Error fetching news:', error);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [user]);

  const handleLike = async (newsId: string, currentLikes: string[] = []) => {
    if (!user) return;
    const isLiked = currentLikes.includes(user.id);
    const newsRef = doc(db, 'news', newsId);
    try {
      if (isLiked) {
        await updateDoc(newsRef, {
          likes: arrayRemove(user.id)
        });
      } else {
        await updateDoc(newsRef, {
          likes: arrayUnion(user.id)
        });
      }
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Xatolik yuz berdi');
    }
  };

    const handleDeleteComment = async (newsId: string, commentId: string, comments: Comment[]) => {
    if (await confirm({ title: 'Diqqat', message: "Fikrni o'chirishni tasdiqlaysizmi?" })) {
      try {
        const updatedComments = comments.filter(c => c.id !== commentId);
        await updateDoc(doc(db, 'news', newsId), { comments: updatedComments });
        toast.success("Fikr o'chirildi");
      } catch (error) {
        toast.error("Xatolik yuz berdi");
      }
    }
  };

  const handleReact = async (newsId: string, commentId: string, emoji: string, comments: Comment[]) => {
    if (!user) return;
    try {
      const updatedComments = comments.map(c => {
        if (c.id === commentId) {
          const reactions = ((c as any).reactions) || {};
          const usersWithEmoji = reactions[emoji] || [];
          const hasReacted = usersWithEmoji.includes(user.id);
          
          if (hasReacted) {
            reactions[emoji] = usersWithEmoji.filter(id => id !== user.id);
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

  const handleComment = async (newsId: string) => {
    if (!user) return;
    const text = commentText[newsId]?.trim();
    if (!text) return;

    const newComment: Comment = {
      id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      userId: user.id,
      userName: user.fullName || user.username,
      text: text,
      createdAt: new Date().toISOString()
    };

    try {
      const newsRef = doc(db, 'news', newsId);
      await updateDoc(newsRef, {
        comments: arrayUnion(newComment)
      });
      setCommentText(prev => ({ ...prev, [newsId]: '' }));
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Fikr qoldirishda xatolik');
    }
  };

  return (
    <div className="space-y-6 pb-6 max-w-2xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-[24px] font-black tracking-tight text-white flex items-center gap-2">
          <Megaphone className="text-[#FEC204]" size={28} />
          Yangiliklar
        </h1>
        <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">
          O'quv markazi e'lonlari va xabarlari
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-[#FEC204] border-t-transparent animate-spin"></div>
        </div>
      ) : news.length === 0 ? (
        <div className="glass-panel p-6 flex flex-col items-center justify-center opacity-70 border-dashed border-2 px-12 py-16">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <span className="text-[24px]">📢</span>
          </div>
          <h3 className="text-[18px] font-bold text-white mb-2">Hozircha yangiliklar yo'q</h3>
          <p className="text-[13px] text-white/40 text-center max-w-sm font-medium">Yangi e'lonlar shu yerda paydo bo'ladi.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {news.map(item => {
            const likesCount = item.likes?.length || 0;
            const isLiked = user ? item.likes?.includes(user.id) : false;
            const comments = item.comments || [];

            return (
              <div key={item.id} className="glass-panel p-5 relative flex flex-col overflow-hidden hover:shadow-[0_0_20px_rgba(255,255,255,0.02)] transition-all">
                <div 
                  className="absolute top-0 left-0 w-1 h-full" 
                  style={{ backgroundColor: item.color || '#FEC204' }} 
                />
                <div className="pl-3 flex flex-col h-full">
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span 
                      className="px-2 py-1 rounded-[6px] text-[10px] font-bold uppercase tracking-wider text-black"
                      style={{ backgroundColor: item.color || '#FEC204' }}
                    >
                      {item.tag || 'Xabar'}
                    </span>
                    <div className="flex items-center gap-1.5 text-white/40 text-[11px] font-bold">
                      <Calendar size={13} />
                      {new Date(item.publishedAt).toLocaleDateString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  
                  {item.mediaUrl && (
                    <div className="w-full bg-black/40 rounded-xl mb-4 overflow-hidden relative">
                      {item.mediaType === 'video' ? (
                        <video src={item.mediaUrl} className="w-full max-h-[300px] object-cover" controls preload="metadata" />
                      ) : (
                        <img src={item.mediaUrl} alt={item.title} className="w-full max-h-[300px] object-cover" />
                      )}
                    </div>
                  )}
                  <h3 className="text-[18px] font-bold text-white leading-snug mb-2">
                    {item.title}
                  </h3>
                  
                  <p className="text-[14px] text-white/70 leading-relaxed font-medium whitespace-pre-wrap mb-4 flex-1">
                    {item.description}
                  </p>

                  <div className="h-[1px] w-full bg-white/10 mb-4" />

                  {/* Actions */}
                  <div className="flex items-center gap-6 mb-4">
                    <button 
                      onClick={() => handleLike(item.id, item.likes)}
                      className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
                    >
                      <Heart 
                        size={20} 
                        className={`transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'group-hover:text-red-400'}`} 
                      />
                      <span className="text-[13px] font-bold">{likesCount}</span>
                    </button>
                    <button onClick={() => toggleComments(item.id)} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                      <MessageCircle size={20} />
                      <span className="text-[13px] font-bold">{comments.length}</span>
                    </button>
                    
                    <div className="flex items-center gap-2 text-white/40 ml-2">
                      <Eye size={20} />
                      <span className="text-[13px] font-bold">{item.viewedBy?.length || 0}</span>
                    </div>
                  </div>

                  {/* Comments Section */}
                  {openComments[item.id] && (
                  <div className="bg-black/20 rounded-xl p-4 mt-4">
                    {comments.length > 0 ? (
                      <div className="space-y-4 mb-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                        {comments.map((c, index) => {
                          const isMe = c.userId === user?.id;
                          const currentCommentDate = new Date(c.createdAt).toDateString();
                          const prevCommentDate = index > 0 ? new Date(comments[index - 1].createdAt).toDateString() : null;
                          const showDateSeparator = currentCommentDate !== prevCommentDate;
                          
                          const reactionsList = Object.entries(((c as any).reactions) || {}).filter(([_, users]) => (users as string[]).length > 0);
                          
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
                                  {!isMe && (
                                    <div className="text-[11px] font-bold opacity-70 mb-1">
                                      {c.userName}
                                    </div>
                                  )}
                                  
                                  <div className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-1  ${isMe ? '-left-16' : '-right-16'}`}>
                                    {isMe && (
                                      <button onClick={() => handleDeleteComment(item.id, c.id, comments)} className="p-1.5 text-white/40 hover:text-red-500 rounded-full hover:bg-white/5">
                                        <Trash2 size={14} />
                                      </button>
                                    )}
                                    <div className="relative">
                                      <button onClick={() => setShowReactionPicker(showReactionPicker === c.id ? null : c.id)} className="p-1.5 text-white/40 hover:text-[#FEC204] rounded-full hover:bg-white/5">
                                        <Smile size={14} />
                                      </button>
                                      {showReactionPicker === c.id && (
                                        <div className={`absolute top-full ${isMe ? 'right-0' : 'left-0'} mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl p-2 flex gap-1 z-10 shadow-xl`}>
                                          {STICKERS.map(emoji => (
                                            <button 
                                              key={emoji}
                                              onClick={() => handleReact(item.id, c.id, emoji, comments)}
                                              className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded text-[16px] transition-colors"
                                            >
                                              {emoji}
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <p className="text-[13px] leading-relaxed break-words">{c.text}</p>
                                  <div className={`text-[10px] mt-1 text-right ${isMe ? 'opacity-60' : 'opacity-40'}`}>
                                    {new Date(c.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                  
                                  {reactionsList.length > 0 && (
                                    <div className={`absolute -bottom-3 ${isMe ? 'right-2' : 'left-2'} flex items-center gap-1 bg-[#1a1a1a] border border-white/10 rounded-full px-1.5 py-0.5 shadow-sm`}>
                                      {reactionsList.map(([emoji, users]) => (
                                        <button 
                                          key={emoji}
                                          onClick={() => handleReact(item.id, c.id, emoji, comments)}
                                          className={`flex items-center gap-1 text-[11px] ${(users as string[]).includes(user?.id || '') ? 'text-[#FEC204] bg-[#FEC204]/10' : 'text-white/70'} hover:bg-white/5 px-1 rounded-full transition-colors`}
                                        >
                                          <span>{emoji}</span>
                                          <span className="font-medium text-[10px]">{((users as string[]).length)}</span>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </React.Fragment>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[12px] text-white/30 font-medium mb-4">Hali fikrlar yo'q. Birinchi bo'lib fikr bildiring!</p>
                    )}

                    {/* Comment Input */}
                    <div className="relative mt-2">
                      <textarea
                        value={commentText[item.id] || ''}
                        onChange={(e) => setCommentText(prev => ({ ...prev, [item.id]: e.target.value }))}
                        placeholder="Fikringizni yozing..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-24 py-3 text-[13px] text-white placeholder-white/30 focus:outline-none focus:border-[#FEC204]/50 focus:bg-white/10 transition-all resize-none min-h-[44px] max-h-[120px]"
                        rows={1}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleComment(item.id);
                          }
                        }}
                      />
                      <div className="absolute right-2 bottom-2 flex items-center gap-1">
                        <div className="relative">
                          <button 
                            onClick={() => setShowEmojiPicker(showEmojiPicker === item.id ? null : item.id)}
                            className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white rounded-lg transition-colors"
                          >
                            <Smile size={18} />
                          </button>
                          {showEmojiPicker === item.id && (
                            <div className="absolute bottom-full right-0 mb-2 bg-[#1a1a1a] border border-white/10 rounded-xl p-2 grid grid-cols-4 gap-1 z-10 shadow-xl w-[160px]">
                              {STICKERS.map(emoji => (
                                <button 
                                  key={emoji}
                                  onClick={() => {
                                    setCommentText(prev => ({ ...prev, [item.id]: (prev[item.id] || '') + emoji }));
                                    setShowEmojiPicker(null);
                                  }}
                                  className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded text-[16px] transition-colors"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <button 
                          onClick={() => handleComment(item.id)}
                          disabled={!commentText[item.id]?.trim()}
                          className="w-8 h-8 flex items-center justify-center bg-[#FEC204] text-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#ffcf33] transition-colors"
                        >
                          <Send size={14} className="ml-0.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
