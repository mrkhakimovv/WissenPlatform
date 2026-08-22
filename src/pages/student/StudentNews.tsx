import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Megaphone, Calendar } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  tag: string;
  color: string;
  publishedAt: string;
}

export default function StudentNews() {
  const { user } = useAuth();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

  return (
    <div className="space-y-6 pb-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {news.map(item => (
            <div key={item.id} className="glass-panel p-5 relative flex flex-col overflow-hidden hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all group">
              <div 
                className="absolute top-0 left-0 w-1 h-full" 
                style={{ backgroundColor: item.color || '#FEC204' }} 
              />
              <div className="pl-3">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span 
                      className="px-2 py-1 rounded-[6px] text-[10px] font-bold uppercase tracking-wider text-black"
                      style={{ backgroundColor: item.color || '#FEC204' }}
                    >
                      {item.tag || 'Xabar'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/30 text-[10px] font-bold bg-white/5 px-2 py-1 rounded-[6px]">
                    <Calendar size={12} />
                    {new Date(item.publishedAt).toLocaleDateString('uz-UZ')}
                  </div>
                </div>
                
                <h3 className="text-[18px] font-bold text-white leading-snug mb-3">
                  {item.title}
                </h3>
                
                <p className="text-[13px] text-white/60 leading-relaxed font-medium whitespace-pre-wrap">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
