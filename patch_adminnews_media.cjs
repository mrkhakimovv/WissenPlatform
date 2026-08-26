const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminNews.tsx', 'utf8');

code = code.replace(
  "import { Plus, X, Edit2, Trash2, Megaphone, Heart, MessageCircle, Send, Check, Eye } from 'lucide-react';",
  "import { Plus, X, Edit2, Trash2, Megaphone, Heart, MessageCircle, Send, Check, Eye, Image as ImageIcon, Video, Link, UploadCloud } from 'lucide-react';"
);

// update formData state
const stateToReplace = `  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tag: '',
    color: '#FEC204',
    active: true
  });`;

const stateReplacement = `  const [formData, setFormData] = useState<{
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
  };`;

code = code.replace(stateToReplace, stateReplacement);

// reset formData in openAdd
code = code.replace(
  "setFormData({ title: '', description: '', tag: 'Yangilik', color: '#FEC204', active: true });",
  "setFormData({ title: '', description: '', tag: 'Yangilik', color: '#FEC204', active: true, mediaUrl: '', mediaType: '' });"
);

// reset formData in openEdit
code = code.replace(
  "      active: item.active\n    });",
  "      active: item.active,\n      mediaUrl: item.mediaUrl || '',\n      mediaType: item.mediaType || ''\n    });"
);

// Update UI inside Modal
const uiToReplace = `              <div>
                <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Batafsil matn</label>
                <textarea required placeholder="Yangilik matnini kiriting..." value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30 min-h-[120px] custom-scrollbar" />
              </div>`;

const uiReplacement = `              <div>
                <label className="text-[10px] uppercase font-bold text-white/40 ml-1 mb-1 block">Batafsil matn</label>
                <textarea required placeholder="Yangilik matnini kiriting..." value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="w-full glass-panel p-3 outline-none focus:border-[#FEC204]/50 text-sm placeholder-white/30 min-h-[120px] custom-scrollbar" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] uppercase font-bold text-white/40 ml-1 block">Media (Rasm/Video) - Ixtiyoriy</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setMediaTab('url')} className={\`text-[10px] uppercase font-bold px-2 py-1 rounded \${mediaTab === 'url' ? 'bg-[#FEC204] text-black' : 'bg-white/10 text-white/50'}\`}>URL Havola</button>
                    <button type="button" onClick={() => setMediaTab('upload')} className={\`text-[10px] uppercase font-bold px-2 py-1 rounded \${mediaTab === 'upload' ? 'bg-[#FEC204] text-black' : 'bg-white/10 text-white/50'}\`}>Yuklash</button>
                  </div>
                </div>
                
                <div className="glass-panel p-3 rounded-xl">
                  {mediaTab === 'url' ? (
                    <div className="space-y-2">
                      <input placeholder="Rasm yoki video havolasini kiriting (https://...)" value={formData.mediaUrl} onChange={e=>setFormData({...formData, mediaUrl: e.target.value})} className="w-full bg-white/5 border border-white/10 p-2 rounded outline-none focus:border-[#FEC204]/50 text-sm text-white placeholder-white/30" />
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setFormData({...formData, mediaType: 'image'})} className={\`flex items-center gap-1 text-[11px] px-3 py-1.5 rounded \${formData.mediaType === 'image' ? 'bg-white/20 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}\`}><ImageIcon size={12}/> Rasm</button>
                        <button type="button" onClick={() => setFormData({...formData, mediaType: 'video'})} className={\`flex items-center gap-1 text-[11px] px-3 py-1.5 rounded \${formData.mediaType === 'video' ? 'bg-white/20 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}\`}><Video size={12}/> Video</button>
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
              </div>`;

code = code.replace(uiToReplace, uiReplacement);


// Update Card UI
const cardUiToReplace = `              <div className="mb-2 pr-24">
                <div className="flex items-center gap-2 mb-2">`;
const cardUiReplacement = `              {item.mediaUrl && (
                <div className="w-full h-[180px] bg-black/40 rounded-xl mb-4 overflow-hidden relative">
                  {item.mediaType === 'video' ? (
                    <video src={item.mediaUrl} className="w-full h-full object-cover" controls preload="metadata" />
                  ) : (
                    <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover" />
                  )}
                </div>
              )}
              
              <div className="mb-2 pr-24">
                <div className="flex items-center gap-2 mb-2">`;
code = code.replace(cardUiToReplace, cardUiReplacement);

fs.writeFileSync('src/pages/admin/AdminNews.tsx', code);
console.log("Patched admin news media");
