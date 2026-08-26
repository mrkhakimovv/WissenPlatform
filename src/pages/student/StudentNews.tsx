import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Megaphone, Calendar, Heart, MessageCircle, Send } from 'lucide-react';
import toast from 'react-hot-toast';

interface Comment {
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
}

export default function StudentNews() {
  const { user } = useAuth();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
  const [openComments, setOpenComments] = useState<{ [key: string]: boolean }>({});

  const toggleComments = (id: string) => {
    setOpenComments(prev => ({ ...prev, [id]: !prev[id] }));
  };

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
                  </div>

                  {/* Comments Section */}
                  {openComments[item.id] && (
                  <div className="bg-black/20 rounded-xl p-4 mt-4">
                    {comments.length > 0 ? (
                      <div className="space-y-4 mb-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                        {comments.map(c => (
                          <div key={c.id} className="flex flex-col">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[13px] font-bold text-white/90">{c.userName}</span>
                              <span className="text-[10px] text-white/30">{new Date(c.createdAt).toLocaleDateString('uz-UZ', { hour: '2-digit', minute: '2-digit'})}</span>
                            </div>
                            <p className="text-[13px] text-white/70">{c.text}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[12px] text-white/30 font-medium mb-4">Hali fikrlar yo'q. Birinchi bo'lib fikr bildiring!</p>
                    )}

                    {/* Comment Input */}
                    <div className="relative">
                      <textarea
                        value={commentText[item.id] || ''}
                        onChange={(e) => setCommentText(prev => ({ ...prev, [item.id]: e.target.value }))}
                        placeholder="Fikringizni yozing..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-[13px] text-white placeholder-white/30 focus:outline-none focus:border-[#FEC204]/50 focus:bg-white/10 transition-all resize-none min-h-[44px] max-h-[120px]"
                        rows={1}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleComment(item.id);
                          }
                        }}
                      />
                      <button 
                        onClick={() => handleComment(item.id)}
                        disabled={!commentText[item.id]?.trim()}
                        className="absolute right-2 bottom-2 w-8 h-8 flex items-center justify-center bg-[#FEC204] text-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#ffcf33] transition-colors"
                      >
                        <Send size={14} className="ml-0.5" />
                      </button>
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
