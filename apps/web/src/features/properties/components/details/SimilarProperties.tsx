import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Building, MapPin } from 'lucide-react';

interface SimilarPropertiesProps {
  propertyId: string;
}

export const SimilarProperties: React.FC<SimilarPropertiesProps> = ({ propertyId }) => {
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSimilar = async () => {
      try {
        const res = await fetch(`http://localhost:3333/properties/${propertyId}/similar`);
        const data = await res.json();
        setProperties(data);
      } catch (error) {
        console.error('Failed to fetch similar properties', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSimilar();
  }, [propertyId]);

  if (isLoading) return <div className="animate-pulse h-64 bg-gray-100 rounded-3xl mt-12"></div>;
  if (!properties || properties.length === 0) return null;

  return (
    <div className="mt-16 pt-12 border-t border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">عقارات مشابهة قد تعجبك</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((prop) => (
          <Link key={prop.id} to={`/properties/${prop.id}`} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group">
            <div className="relative h-48 bg-gray-200 overflow-hidden">
              {prop.media && prop.media.length > 0 ? (
                <img src={prop.media[0].url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">لا توجد صورة</div>
              )}
            </div>
            <div className="p-5">
              <div className="font-en font-bold text-2xl text-primary mb-2">
                {prop.price.toLocaleString()} <span className="text-sm font-ar">ج.م</span>
              </div>
              <h3 className="font-bold text-gray-800 mb-1 line-clamp-1">{prop.title}</h3>
              <p className="text-gray-500 text-sm mb-4 flex items-center gap-1"><MapPin size={14}/> {prop.city}</p>
              
              <div className="flex items-center justify-between text-gray-600 font-en text-sm pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1.5"><Home size={16}/> {prop.bedrooms}</div>
                <div className="flex items-center gap-1.5"><Building size={16}/> {prop.bathrooms}</div>
                <div className="flex items-center gap-1.5">{prop.area} م²</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
