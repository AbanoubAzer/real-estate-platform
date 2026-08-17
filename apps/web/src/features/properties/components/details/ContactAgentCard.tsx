import React, { useState } from 'react';
import { Phone, MessageCircle, User, Calendar, Mail } from 'lucide-react';

interface ContactAgentCardProps {
  propertyId: string;
}

export const ContactAgentCard: React.FC<ContactAgentCardProps> = ({ propertyId }) => {
  const [activeTab, setActiveTab] = useState<'CONTACT' | 'VIEWING'>('CONTACT');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
    preferredDate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent, inquiryType = activeTab === 'VIEWING' ? 'BOOK_VIEWING' : 'CALLBACK') => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // POST /leads (E11.1 & E11.2 Smart Lead Upsert)
      await fetch('http://localhost:3333/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          propertyId,
          inquiryType,
          source: 'PROPERTY_PAGE',
        }),
      });
      
      setIsSuccess(true);
      setFormData({ name: '', phone: '', email: '', message: '', preferredDate: '' });
    } catch (error) {
      console.error('Failed to submit lead inquiry', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sticky top-24">
      {/* Agent Info */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop" alt="Agent" className="w-full h-full object-cover" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-lg">أحمد محمود</h3>
          <p className="text-gray-500 text-sm">مستشار عقاري</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <a href="tel:+201000000000" className="flex items-center justify-center gap-2 bg-primary/5 text-primary py-3 rounded-xl font-bold hover:bg-primary/10 transition-colors">
          <Phone size={18} />
          اتصال
        </a>
        <a href="https://wa.me/201000000000" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-[#25D366]/10 text-[#25D366] py-3 rounded-xl font-bold hover:bg-[#25D366]/20 transition-colors">
          <MessageCircle size={18} />
          واتساب
        </a>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-50 p-1 rounded-xl mb-6">
        <button 
          onClick={() => setActiveTab('CONTACT')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'CONTACT' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
        >
          تواصل معنا
        </button>
        <button 
          onClick={() => setActiveTab('VIEWING')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'VIEWING' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
        >
          طلب معاينة
        </button>
      </div>

      {/* Form */}
      {isSuccess ? (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl text-center">
          <p className="font-bold mb-1">تم الإرسال بنجاح!</p>
          <p className="text-sm">سيتواصل معك الوكيل في أقرب وقت.</p>
          <button onClick={() => setIsSuccess(false)} className="mt-4 text-sm font-bold text-green-800 underline">إرسال طلب آخر</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User size={18} className="absolute right-4 top-3.5 text-gray-400" />
            <input 
              required
              type="text" 
              placeholder="الاسم كامل" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-11 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
          <div className="relative">
            <Phone size={18} className="absolute right-4 top-3.5 text-gray-400" />
            <input 
              required
              type="tel" 
              placeholder="رقم الهاتف" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-11 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-right"
              dir="ltr"
            />
          </div>
          <div className="relative">
            <Mail size={18} className="absolute right-4 top-3.5 text-gray-400" />
            <input 
              type="email" 
              placeholder="البريد الإلكتروني (اختياري)" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-11 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-right"
              dir="ltr"
            />
          </div>
          
          {activeTab === 'VIEWING' && (
            <div className="relative">
              <Calendar size={18} className="absolute right-4 top-3.5 text-gray-400" />
              <input 
                required
                type="datetime-local" 
                value={formData.preferredDate}
                onChange={(e) => setFormData({...formData, preferredDate: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-11 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          )}

          <textarea 
            placeholder={activeTab === 'CONTACT' ? "رسالتك..." : "ملاحظات إضافية..."}
            rows={3}
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
          />

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-opacity-90 transition-all disabled:opacity-70"
          >
            {isSubmitting ? 'جاري الإرسال...' : activeTab === 'CONTACT' ? 'إرسال الرسالة' : 'تأكيد موعد المعاينة'}
          </button>
        </form>
      )}
    </div>
  );
};
