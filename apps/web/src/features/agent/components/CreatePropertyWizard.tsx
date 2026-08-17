import React, { useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const CreatePropertyWizard = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    purpose: 'SALE',
    propertyTypeId: 'placeholder-type-id', // We should fetch actual types in a real app
    price: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    country: 'مصر',
    city: 'القاهرة',
    areaLocation: 'التجمع الخامس',
    status: 'DRAFT',
    paymentPlans: []
  });
  const [error, setError] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateQualityScore = () => {
    let score = 0;
    if (formData.title) score += 20;
    if (formData.price) score += 20;
    if (formData.area) score += 20;
    if (formData.bedrooms && formData.bathrooms) score += 20;
    if (formData.city && formData.areaLocation) score += 20;
    return score;
  };

  const handleSaveDraft = async () => {
    try {
      const res = await fetch('http://localhost:3333/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price) || 0,
          area: Number(formData.area) || 0,
          bedrooms: Number(formData.bedrooms) || 0,
          bathrooms: Number(formData.bathrooms) || 0,
          status: 'DRAFT'
        })
      });
      if (!res.ok) throw new Error('Failed to save draft');
      navigate('/agent/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSubmitReview = async () => {
    try {
      const res = await fetch('http://localhost:3333/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price) || 0,
          area: Number(formData.area) || 0,
          bedrooms: Number(formData.bedrooms) || 0,
          bathrooms: Number(formData.bathrooms) || 0,
          status: 'PENDING_REVIEW'
        })
      });
      if (!res.ok) throw new Error('Failed to submit');
      navigate('/agent/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-3xl">
      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-800">إضافة عقار جديد</h1>
          <div className="text-sm font-bold bg-accent/10 text-accent px-3 py-1 rounded-full">
            جودة البيانات: %{calculateQualityScore()}
          </div>
        </div>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}

        <div className="space-y-6">
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold mb-4">1. المعلومات الأساسية</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">عنوان العقار</label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full border rounded-lg p-2" placeholder="مثال: شقة مودرن بحديقة..." />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">الغرض</label>
                    <select name="purpose" value={formData.purpose} onChange={handleChange} className="w-full border rounded-lg p-2">
                      <option value="SALE">بيع</option>
                      <option value="RENT">إيجار</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">السعر (ج.م)</label>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full border rounded-lg p-2 text-left font-en" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold mb-4">2. المواصفات والموقع</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">المساحة (م²)</label>
                    <input type="number" name="area" value={formData.area} onChange={handleChange} className="w-full border rounded-lg p-2 text-left font-en" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">الغرف</label>
                    <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} className="w-full border rounded-lg p-2 text-left font-en" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">الحمامات</label>
                    <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} className="w-full border rounded-lg p-2 text-left font-en" />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">المدينة</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full border rounded-lg p-2" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">المنطقة</label>
                    <input type="text" name="areaLocation" value={formData.areaLocation} onChange={handleChange} className="w-full border rounded-lg p-2" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t">
            {step > 1 ? (
              <button onClick={() => setStep(step - 1)} className="px-6 py-2 border rounded-lg font-bold text-gray-600 hover:bg-gray-50 transition-colors">السابق</button>
            ) : <div />}
            
            <div className="flex gap-3">
              <button onClick={handleSaveDraft} className="px-6 py-2 border border-gray-300 text-gray-600 rounded-lg font-bold hover:bg-gray-50 transition-colors">
                حفظ كمسودة
              </button>
              
              {step < 2 ? (
                <button onClick={() => setStep(step + 1)} className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-opacity-90 transition-colors">التالي</button>
              ) : (
                <button onClick={handleSubmitReview} className="px-6 py-2 bg-accent text-white rounded-lg font-bold hover:bg-opacity-90 transition-colors">
                  إرسال للمراجعة
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
