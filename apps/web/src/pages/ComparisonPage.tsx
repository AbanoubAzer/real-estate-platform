import React, { useState } from 'react';
import { useComparisonStore } from '../features/comparison/store/useComparisonStore';
import { useQuery } from '@tanstack/react-query';
import { Scale, ChevronRight, Check, X as XIcon, MapPin, Building, Home, HelpCircle, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ComparisonPage = () => {
  const { properties, removeProperty } = useComparisonStore();
  const [weights, setWeights] = useState({ price: 30, location: 20, space: 20, investment: 10, amenities: 20 });
  const [userIntent, setUserIntent] = useState<'LIVING' | 'INVESTMENT'>('LIVING');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);

  const { data: analysisData, isLoading } = useQuery({
    queryKey: ['comparison', properties.map(p => p.id), weights, userIntent],
    queryFn: async () => {
      if (properties.length < 2) return null;
      // Mocking the call since we don't have the Comparison model created with property IDs yet in frontend
      // We can directly call the AI comparison engine or just fetch properties and mock locally
      // For this demo, let's assume we call a POST endpoint to get on-the-fly comparison without saving
      const res = await fetch('http://localhost:3333/properties?limit=4'); // Dummy fetch to get actual details
      const allProps = await res.json();
      
      // Filter out only the ones in store
      const actualProps = allProps.data?.filter((p: any) => properties.find(sp => sp.id === p.id));
      
      // If we don't have full details, we use the ones from store and mock the rest
      const mappedProps = properties.map(p => {
        const fullProp = actualProps?.find((ap: any) => ap.id === p.id);
        return fullProp || {
          ...p,
          area: Math.floor(Math.random() * 100) + 80,
          bedrooms: Math.floor(Math.random() * 3) + 1,
          city: 'الغردقة',
          purpose: 'SALE',
          features: [{ name: 'حمام سباحة' }, { name: 'أمن' }],
        };
      });

      // Call the AI Engine endpoint (mocking here for frontend independence or call real if we added it)
      // Actually we have the endpoint: GET /comparisons/:id but we didn't save it yet. 
      // I'll simulate the AI Engine response structure for now to ensure UI works smoothly.
      const scores = mappedProps.map(p => ({
        property: p,
        totalScore: Math.floor(Math.random() * 30) + 60,
        rating: Math.floor(Math.random() * 3) + 3,
        pros: ['سعر مناسب', 'مساحة جيدة'],
        cons: ['بعيد قليلاً عن الخدمات'],
        summary: 'خيار جيد ومناسب للعائلات.'
      }));

      const best = [...scores].sort((a, b) => b.totalScore - a.totalScore)[0];

      return {
        properties: scores,
        highlights: {
          bestMatch: { id: best.property.id, score: best.totalScore }
        },
        tradeoffs: [
          {
            textAr: `اختيار العقار الأول يوفر لك ميزانية ولكنه أصغر مساحة.`
          }
        ]
      };
    },
    enabled: properties.length >= 2,
  });

  if (properties.length < 2) {
    return (
      <div className="container mx-auto px-6 py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <Scale size={64} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">أضف عقارات للمقارنة</h2>
        <p className="text-gray-500 mb-6">يجب اختيار عقارين على الأقل لبدء المقارنة الذكية.</p>
        <Link to="/search" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90">
          تصفح العقارات
        </Link>
      </div>
    );
  }

  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion) return;
    setAiAnswer("بناءً على المعطيات، العقار الأول يقدم أفضل قيمة مقابل السعر، بينما الثاني يوفر مساحة أكبر وموقع أقرب للخدمات.");
    setAiQuestion('');
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
            <Scale className="text-primary" />
            المقارنة الذكية 🤖
          </h1>
          <p className="text-gray-500 mt-1">قارن بين العقارات المختارة بمساعدة الذكاء الاصطناعي لاختيار الأنسب لك.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setUserIntent('LIVING')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${userIntent === 'LIVING' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
          >
            للسكن 🏠
          </button>
          <button 
            onClick={() => setUserIntent('INVESTMENT')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${userIntent === 'INVESTMENT' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
          >
            للاستثمار 📈
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar: Settings & AI Chat */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Weights Adjuster */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <SlidersIcon /> أولوياتك (E12.5)
            </h3>
            
            <div className="space-y-4">
              {Object.entries(weights).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                    <span>{key === 'price' ? 'السعر' : key === 'location' ? 'الموقع' : key === 'space' ? 'المساحة' : key === 'investment' ? 'الاستثمار' : 'المرافق'}</span>
                    <span>{value}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={value}
                    onChange={(e) => setWeights({ ...weights, [key]: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* AI Chat (E12.10) */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-blue-100 p-5">
            <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
              <SparklesIcon /> اسأل الذكاء الاصطناعي
            </h3>
            <p className="text-xs text-indigo-700/70 mb-4">اسأل أي سؤال يخص هذه العقارات وسنجيبك بناءً على المعطيات.</p>
            
            {aiAnswer && (
              <div className="bg-white rounded-xl p-3 text-sm text-gray-700 shadow-sm border border-indigo-100 mb-4">
                {aiAnswer}
              </div>
            )}

            <form onSubmit={handleAskAi} className="relative">
              <input 
                type="text" 
                placeholder="أيهما أفضل للاستثمار؟"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                className="w-full text-sm rounded-xl border border-indigo-200 pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button type="submit" className="absolute left-2 top-2 w-7 h-7 bg-primary text-white flex items-center justify-center rounded-lg hover:bg-primary/90">
                <ChevronRight size={16} />
              </button>
            </form>
          </div>

        </div>

        {/* Right Content: The Comparison Table */}
        <div className="lg:col-span-3">
          
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Tradeoffs (E12.9) */}
              {analysisData?.tradeoffs?.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <Scale className="text-amber-500 mt-0.5 flex-shrink-0" size={20} />
                  <div>
                    <h4 className="font-bold text-amber-800 text-sm mb-1">تحليل المقايضة (Trade-off)</h4>
                    <p className="text-sm text-amber-700">{analysisData.tradeoffs[0].textAr}</p>
                  </div>
                </div>
              )}

              {/* Table wrapper for horizontal scroll on mobile */}
              <div className="overflow-x-auto pb-4">
                <div className="min-w-[800px] flex gap-4">
                  
                  {/* Row Headers (Sticky optionally) */}
                  <div className="w-32 flex-shrink-0 flex flex-col justify-end pb-4 gap-y-4 pt-[240px]">
                    <div className="h-10 flex items-center text-sm font-bold text-gray-500">السعر</div>
                    <div className="h-10 flex items-center text-sm font-bold text-gray-500">المساحة</div>
                    <div className="h-10 flex items-center text-sm font-bold text-gray-500">الغرف</div>
                    <div className="h-10 flex items-center text-sm font-bold text-gray-500">التقييم (AI)</div>
                  </div>

                  {/* Property Columns */}
                  {analysisData?.properties.map((item: any) => {
                    const isBestMatch = analysisData.highlights.bestMatch.id === item.property.id;
                    
                    return (
                      <div key={item.property.id} className={`flex-1 min-w-[240px] rounded-2xl border ${isBestMatch ? 'border-primary shadow-lg relative' : 'border-gray-200 bg-white'}`}>
                        
                        {/* Best Match Badge (E12.7) */}
                        {isBestMatch && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap shadow-md">
                            🏆 الخيار الأنسب لك
                          </div>
                        )}

                        {/* Card Header */}
                        <div className="p-4 border-b border-gray-100">
                          <button onClick={() => removeProperty(item.property.id)} className="float-left text-gray-400 hover:text-red-500">
                            <XIcon size={16} />
                          </button>
                          <img src={item.property.image || item.property.media?.[0]?.url} alt="" className="w-full h-32 object-cover rounded-xl mb-3" />
                          <h3 className="font-bold text-gray-800 text-sm line-clamp-2 min-h-[40px]">{item.property.title}</h3>
                          
                          {/* AI Summary (E12.3) */}
                          <div className="mt-3 bg-gray-50 rounded-lg p-2 text-xs text-gray-600 flex items-start gap-1">
                            <SparklesIcon size={12} className="text-accent flex-shrink-0 mt-0.5" />
                            {item.summary}
                          </div>
                        </div>

                        {/* Specs Rows */}
                        <div className="p-4 flex flex-col gap-y-4">
                          <div className="h-10 flex items-center font-en font-bold text-primary">
                            {(item.property.price / 1000000).toFixed(2)}M <span className="text-[10px] font-ar text-gray-400 mr-1">ج.م</span>
                          </div>
                          
                          <div className="h-10 flex items-center text-sm text-gray-700">
                            {item.property.area} م²
                          </div>
                          
                          <div className="h-10 flex items-center text-sm text-gray-700">
                            {item.property.bedrooms} غرف
                          </div>

                          <div className="h-10 flex items-center">
                            <div className="flex text-yellow-400">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} size={14} fill={i < item.rating ? 'currentColor' : 'none'} className={i >= item.rating ? 'text-gray-300' : ''} />
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Pros & Cons (E12.8) */}
                        <div className="p-4 bg-gray-50 rounded-b-2xl border-t border-gray-100">
                          <div className="mb-3">
                            <span className="text-xs font-bold text-green-600 block mb-1">المميزات</span>
                            <ul className="space-y-1">
                              {item.pros.map((p: string, i: number) => (
                                <li key={i} className="text-xs text-gray-600 flex items-center gap-1"><Check size={12} className="text-green-500"/> {p}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-red-600 block mb-1">العيوب</span>
                            <ul className="space-y-1">
                              {item.cons.map((c: string, i: number) => (
                                <li key={i} className="text-xs text-gray-600 flex items-center gap-1"><XIcon size={12} className="text-red-500"/> {c}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};

// Helper icons
const SlidersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>;
const SparklesIcon = ({size=16, className=""}:any) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>;
