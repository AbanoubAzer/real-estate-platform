import React from 'react';
import { Sparkles, CheckCircle } from 'lucide-react';

interface Props {
  matchScore: number;
}

export const AiMatchExplanation = ({ matchScore }: Props) => {
  return (
    <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-3xl p-1 mb-8 shadow-lg">
      <div className="bg-white rounded-[22px] p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
            <Sparkles size={28} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">لماذا يناسبك هذا العقار؟</h3>
            <p className="text-gray-500 text-sm">مبني على بحثك الأخير</p>
          </div>
          <div className="mr-auto bg-green-500 text-white font-bold font-en text-xl px-4 py-2 rounded-xl flex items-center gap-2">
            {matchScore}% Match
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mock Explanations */}
          <div className="flex items-center gap-3 text-gray-700">
            <CheckCircle className="text-green-500" size={20} />
            يقع في المنطقة المفضلة لك (التجمع الخامس)
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <CheckCircle className="text-green-500" size={20} />
            يناسب ميزانيتك (أقل من 4 مليون)
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <CheckCircle className="text-green-500" size={20} />
            يحتوي على 3 غرف نوم كما طلبت
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <CheckCircle className="text-green-500" size={20} />
            طريقة الدفع المناسبة (كاش)
          </div>
        </div>
      </div>
    </div>
  );
};
