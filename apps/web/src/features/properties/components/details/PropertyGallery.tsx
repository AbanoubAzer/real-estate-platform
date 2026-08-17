import React, { useState } from 'react';
import { Maximize2, ChevronRight, ChevronLeft } from 'lucide-react';

interface PropertyGalleryProps {
  media: { id: string; url: string; isCover: boolean }[];
}

export const PropertyGallery: React.FC<PropertyGalleryProps> = ({ media }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!media || media.length === 0) {
    return (
      <div className="w-full h-[400px] md:h-[500px] bg-gray-100 rounded-3xl flex items-center justify-center">
        <span className="text-gray-400">لا توجد صور متاحة</span>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  return (
    <div className="space-y-4">
      {/* Main Hero Image */}
      <div className="relative w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden group bg-black">
        <img 
          src={media[currentIndex].url} 
          alt={`Property image ${currentIndex + 1}`} 
          className="w-full h-full object-cover transition-opacity duration-300"
        />
        
        {/* Navigation Arrows */}
        {media.length > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors opacity-0 group-hover:opacity-100"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        <button className="absolute top-4 left-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors">
          <Maximize2 size={20} />
        </button>
        
        <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-en">
          {currentIndex + 1} / {media.length}
        </div>
      </div>

      {/* Thumbnails */}
      {media.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {media.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setCurrentIndex(index)}
              className={`relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                currentIndex === index ? 'border-primary opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={item.url} className="w-full h-full object-cover" alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
