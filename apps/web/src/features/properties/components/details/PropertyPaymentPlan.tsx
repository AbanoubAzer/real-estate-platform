import React from 'react';
import { CreditCard, CalendarDays, Wallet } from 'lucide-react';

interface Props {
  property: any;
}

export const PropertyPaymentPlan = ({ property }: Props) => {
  if (property.paymentMethod === 'CASH') {
    return (
      <div className="bg-green-50 rounded-3xl p-6 border border-green-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
            <Wallet size={24} />
          </div>
          <div>
            <h3 className="font-bold text-green-800 text-lg">كاش فقط</h3>
            <p className="text-green-600 text-sm">هذا العقار متاح للدفع الكاش فقط.</p>
          </div>
        </div>
        <div className="font-en font-bold text-2xl text-green-700">
          {property.price.toLocaleString()} <span className="font-ar text-sm">ج.م</span>
        </div>
      </div>
    );
  }

  // If Installments
  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <CreditCard className="text-primary" size={24} />
        خطة الدفع
      </h3>
      
      <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
        
        <div className="flex-1 w-full space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <span className="text-gray-500 font-medium">السعر الإجمالي</span>
            <span className="font-bold text-primary font-en text-xl">{property.price.toLocaleString()} <span className="font-ar text-sm">ج.م</span></span>
          </div>
          
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <span className="text-gray-500 font-medium">المقدم</span>
            <span className="font-bold text-gray-800 font-en text-lg">{(property.downPayment || 0).toLocaleString()} <span className="font-ar text-sm">ج.م</span></span>
          </div>

          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <span className="text-gray-500 font-medium">القسط الشهري</span>
            <span className="font-bold text-accent font-en text-lg">{(property.monthlyInstallment || 0).toLocaleString()} <span className="font-ar text-sm">ج.م</span></span>
          </div>
        </div>
        
        <div className="w-48 h-48 rounded-full border-8 border-gray-50 flex flex-col items-center justify-center bg-white shadow-inner relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5"></div>
          <CalendarDays size={32} className="text-primary mb-2 relative z-10" />
          <span className="font-bold text-2xl text-gray-800 font-en relative z-10">{Math.floor((property.installmentDuration || 0) / 12)}</span>
          <span className="text-gray-500 font-medium relative z-10">سنوات</span>
        </div>
        
      </div>
    </div>
  );
};
