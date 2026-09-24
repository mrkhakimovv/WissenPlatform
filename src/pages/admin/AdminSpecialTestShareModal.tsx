import React, { useState } from 'react';
import { X, Copy, Check, Share2, Send, ExternalLink, Smartphone, Globe, MessageSquare, Bot } from 'lucide-react';
import toast from 'react-hot-toast';

interface AdminSpecialTestShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  test: {
    id: string;
    title: string;
    questionsCount?: number;
  };
}

export default function AdminSpecialTestShareModal({
  isOpen,
  onClose,
  test
}: AdminSpecialTestShareModalProps) {
  const [copiedType, setCopiedType] = useState<'tg_bot' | 'web' | 'template' | null>(null);

  if (!isOpen) return null;

  const botUsername = 'wissenedu_bot';
  // 1. Telegram Bot Link (Ishonchli va xatoliksiz ishlaydi)
  const tgBotLink = `https://t.me/${botUsername}?start=special_${test.id}`;
  // 2. Web direct link
  const webLink = `${window.location.origin}/maxsus-test/${test.id}`;

  const messageTemplate = `🎯 ${test.title} — Milliy Sertifikat Testi\n\n📋 Savollar: 45 ta (55 birlik)\n📊 Baholash: Rasch modeli (A+, A, B+, B, C+, C)\n\n👇 Testni Telegram orqali yechish uchun bosing:\n${tgBotLink}\n\n🌐 Brauzerda ochish:\n${webLink}`;

  const copyToClipboard = (text: string, type: 'tg_bot' | 'web' | 'template') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    toast.success(
      type === 'tg_bot'
        ? "Telegram havolasi nusxalandi!"
        : type === 'web'
        ? "Veb havola nusxalandi!"
        : "Tayyor xabar matni nusxalandi!"
    );
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleShareToTelegram = () => {
    const text = `🎯 ${test.title}\n\nMilliy sertifikat formati (Rasch modeli). Testni topshirish uchun quyidagi havolani bosing:`;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(tgBotLink)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121212] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0088cc]/15 text-[#0088cc] flex items-center justify-center border border-[#0088cc]/30">
              <Send size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg leading-tight line-clamp-1">
                {test.title}
              </h3>
              <p className="text-xs text-white/50">Test havolasini o'quvchilarga ulashish</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Main Option: Telegram Bot Link */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0088cc]/20 to-[#0088cc]/5 border-2 border-[#0088cc]/50 relative overflow-hidden shadow-lg shadow-[#0088cc]/10">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0088cc] text-white text-[11px] font-black uppercase tracking-wider shadow">
                <Bot size={13} /> Telegram Bot Havolasi (Asosiy)
              </span>
            </div>
            <p className="text-xs text-white/90 mb-3 leading-relaxed">
              O'quvchi ushbu havolani bosganda botga o'tadi va <b>«🚀 Testni boshlash (Mini App)»</b> tugmasi orqali test Telegram ichida ochiladi.
            </p>

            <div className="flex items-center gap-2 bg-black/50 border border-[#0088cc]/40 rounded-xl p-2 mb-3">
              <input
                type="text"
                readOnly
                value={tgBotLink}
                className="bg-transparent text-xs text-[#38bdf8] font-mono font-medium w-full outline-none select-all"
              />
              <button
                onClick={() => copyToClipboard(tgBotLink, 'tg_bot')}
                className="shrink-0 px-3.5 py-1.5 rounded-lg bg-[#0088cc] hover:bg-[#0088cc]/90 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-lg active:scale-95"
              >
                {copiedType === 'tg_bot' ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedType === 'tg_bot' ? "Nusxalandi" : "Nusxalash"}</span>
              </button>
            </div>

            <button
              onClick={handleShareToTelegram}
              className="w-full py-2.5 px-4 rounded-xl bg-[#0088cc] hover:bg-[#0088cc]/90 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99]"
            >
              <Share2 size={15} />
              <span>Telegram guruh yoki kanalga to'g'ridan-to'g'ri yuborish</span>
            </button>
          </div>

          {/* Option 2: Direct Web Link */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center justify-between mb-1.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white/80">
                <Globe size={14} className="text-[#FEC204]" /> To'g'ridan-to'g'ri havola (Brauzer / Telegram)
              </span>
            </div>
            <p className="text-[11px] text-white/40 mb-2">
              Telegramda yoki telefon/kompyuter brauzerida to'g'ridan-to'g'ri ochish uchun.
            </p>
            <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl p-2">
              <input
                type="text"
                readOnly
                value={webLink}
                className="bg-transparent text-xs text-white/70 font-mono w-full outline-none select-all"
              />
              <button
                onClick={() => copyToClipboard(webLink, 'web')}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                {copiedType === 'web' ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedType === 'web' ? "Nusxalandi" : "Nusxalash"}</span>
              </button>
            </div>
          </div>

          {/* Option 3: Ready-made text message for students */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white/80">
                <MessageSquare size={14} className="text-emerald-400" /> O'quvchilarga yuborish uchun tayyor xabar
              </span>
              <button
                onClick={() => copyToClipboard(messageTemplate, 'template')}
                className="text-xs text-[#FEC204] hover:underline font-bold flex items-center gap-1"
              >
                {copiedType === 'template' ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedType === 'template' ? "Nusxalandi!" : "Xabarni nusxalash"}</span>
              </button>
            </div>
            <pre className="text-[11px] text-white/60 bg-black/30 p-2.5 rounded-xl border border-white/5 font-sans whitespace-pre-wrap leading-relaxed">
              {messageTemplate}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}
