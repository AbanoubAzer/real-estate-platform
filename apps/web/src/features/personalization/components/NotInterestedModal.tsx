import React, { useState } from 'react';
import { X, Ban } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';

interface NotInterestedModalProps {
  propertyId: string;
  onClose: () => void;
  onSubmitted?: () => void;
}

const REASONS = [
  { id: 'TOO_EXPENSIVE', labelAr: 'السعر غالي', emoji: '💰' },
  { id: 'WRONG_LOCATION', labelAr: 'المنطقة مش مناسبة', emoji: '📍' },
  { id: 'WRONG_TYPE', labelAr: 'نوع العقار مش مطلوب', emoji: '🏠' },
  { id: 'TOO_SMALL', labelAr: 'المساحة صغيرة', emoji: '📐' },
  { id: 'NOT_INVESTMENT', labelAr: 'مش مهتم بالاستثمار', emoji: '📊' },
  { id: 'OTHER', labelAr: 'سبب آخر', emoji: '💬' },
];

export const NotInterestedModal: React.FC<NotInterestedModalProps> = ({ propertyId, onClose, onSubmitted }) => {
  const { token } = useAuth();
  const [selectedReason, setSelectedReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) return;
    setSubmitting(true);
    try {
      await fetch(`http://localhost:3333/me/properties/${propertyId}/not-interested`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: selectedReason }),
      });
      onSubmitted?.();
      onClose();
    } catch (e) {
      console.error('Failed to submit', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl text-right space-y-5 animate-in slide-in-from-bottom">
        <div className="flex justify-between items-center">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
          <div className="flex items-center gap-2">
            <Ban size={18} className="text-red-500" />
            <h3 className="font-bold text-lg text-gray-800">ليه مش مهتم؟</h3>
          </div>
        </div>

        <p className="text-sm text-gray-500">ساعدنا نفهمك أحسن عشان نعرض لك عقارات أنسب 🎯</p>

        <div className="grid grid-cols-2 gap-3">
          {REASONS.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedReason(r.id)}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                selectedReason === r.id
                  ? 'border-red-500 bg-red-50 scale-[1.02]'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <span className="text-2xl">{r.emoji}</span>
              <p className="text-xs font-bold mt-1.5 text-gray-800">{r.labelAr}</p>
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!selectedReason || submitting}
          className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-bold transition-all"
        >
          {submitting ? 'جاري الإرسال...' : 'تأكيد — لن نعرض لك عقارات مشابهة'}
        </button>
      </div>
    </div>
  );
};
