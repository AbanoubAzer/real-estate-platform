import React from 'react';
import { Bed, Bath, Maximize, Layers, CheckCircle2, Home } from 'lucide-react';

interface Props {
  property: any;
}

export const PropertySpecifications = ({ property }: Props) => {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Home className="text-primary" size={24} />
        مواصفات العقار
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {property.bedrooms && (
          <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
            <Bed className="text-accent mb-2" size={28} />
            <span className="font-bold text-gray-800">{property.bedrooms} غرف</span>
          </div>
        )}
        
        {property.bathrooms && (
          <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
            <Bath className="text-accent mb-2" size={28} />
            <span className="font-bold text-gray-800">{property.bathrooms} حمام</span>
          </div>
        )}
        
        {property.area && (
          <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
            <Maximize className="text-accent mb-2" size={28} />
            <span className="font-bold text-gray-800 font-en">{property.area} <span className="font-ar font-normal text-sm">م²</span></span>
          </div>
        )}
        
        {property.floor && (
          <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
            <Layers className="text-accent mb-2" size={28} />
            <span className="font-bold text-gray-800">الدور الـ {property.floor}</span>
          </div>
        )}
        
        {property.furnishingStatus && (
          <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
            <CheckCircle2 className="text-accent mb-2" size={28} />
            <span className="font-bold text-gray-800">
              {property.furnishingStatus === 'FURNISHED' ? 'مفروش' : 'غير مفروش'}
            </span>
          </div>
        )}
        
        {property.finishingStatus && (
          <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
            <CheckCircle2 className="text-accent mb-2" size={28} />
            <span className="font-bold text-gray-800">
              {property.finishingStatus === 'FULLY_FINISHED' ? 'تشطيب كامل' : 'نصف تشطيب'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
