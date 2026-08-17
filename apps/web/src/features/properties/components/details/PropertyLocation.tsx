import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface Props {
  property: any;
}

export const PropertyLocation = ({ property }: Props) => {
  const privacy = property.locationPrivacy || 'EXACT';

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <MapPin className="text-primary" size={24} />
        الموقع الجغرافي
      </h2>
      
      <div className="relative w-full h-[300px] bg-blue-50 rounded-2xl overflow-hidden border border-blue-100">
        {/* Decorative Map Background */}
        <div 
          className="absolute inset-0 opacity-40 mix-blend-multiply"
          style={{ backgroundImage: 'radial-gradient(circle at center, #3b82f6 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        ></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {privacy === 'EXACT' ? (
            <div className="flex flex-col items-center animate-bounce">
              <Navigation size={48} className="text-red-500 drop-shadow-md rotate-180" />
              <div className="bg-white px-4 py-2 rounded-xl shadow-lg font-bold text-gray-800 mt-2 flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                {property.areaLocation}، {property.city}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-48 h-48 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
                <div className="w-24 h-24 bg-primary/30 rounded-full flex items-center justify-center">
                  <MapPin size={32} className="text-primary" />
                </div>
              </div>
              <div className="bg-white px-4 py-2 rounded-xl shadow-lg font-bold text-gray-800 mt-4 text-sm z-10 text-center">
                موقع تقريبي للمنطقة
                <p className="text-xs text-gray-500 font-normal mt-1">{property.city}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
