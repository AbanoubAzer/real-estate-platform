import React, { useState } from 'react';
import { Sparkles, MessageCircle, Send, Copy, Check, X } from 'lucide-react';

interface AIFollowupModalProps {
  lead: any;
  onClose: () => void;
}

export const AIFollowupModal: React.FC<AIFollowupModalProps> = ({ lead, onClose }) => {
  const [copied, setCopied] = useState(false);
  const defaultText = `أهلاً أ/ ${lead.name || 'العميل'}، يسعدنا تواصلك معنا بخصوص العقار المطلوب. هل تفضل إرسال التفاصيل كاملة وأنظمة السداد المتاحة عبر الواتساب؟`;
  const [messageText, setMessageText] = useState(lead.followupSuggestion?.templateAr || defaultText);

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppSend = () => {
    if (lead.phone) {
      const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-100 text-right">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-navy p-5 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="text-accent animate-pulse" size={22} />
            <h3 className="font-bold text-lg">مساعد المتابعة الذكي (AI Follow-up Assistant)</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white text-xl font-bold">
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-blue-50/60 border border-blue-100 p-3 rounded-2xl text-xs text-blue-900">
            <p className="font-bold mb-1">ملخص الذكاء الاصطناعي للعميل:</p>
            <p>{lead.followupSuggestion?.contextSummaryAr || `العميل مهتم بالشراء وميزانيته مرنة. النية: ${lead.intent || 'شراء'}`}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              الرسالة المقترحة (يمكنك التعديل قبل الإرسال):
            </label>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={4}
              className="w-full p-4 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-right resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleWhatsAppSend}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 transition-all"
            >
              <MessageCircle size={18} />
              إرسال عبر الواتساب
            </button>
            <button
              onClick={handleCopy}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all"
            >
              {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
              <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
