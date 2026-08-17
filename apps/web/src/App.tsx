import React, { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { AddPropertyForm } from './features/properties/components/forms/AddPropertyForm';
import { Search, MapPin, Building, ShieldCheck, Users, Home as HomeIcon, Bell, Heart, PieChart, Sparkles } from 'lucide-react';
import { RecentSearches } from './features/personalization/components/RecentSearches';
import { ContinueViewing } from './features/personalization/components/ContinueViewing';
import { AISearchBar } from './features/ai-search/components/AISearchBar';
import { ConversationalSearchWidget } from './features/ai-search/components/ConversationalSearchWidget';
import { PersonalizedRecommendations } from './features/ai-search/components/PersonalizedRecommendations';
import { AIMatchBadge } from './features/ai-search/components/AIMatchBadge';
import { PersonalizedHomeFeed } from './features/personalization/components/PersonalizedHomeFeed';
import { RecentlyViewedCarousel } from './features/personalization/components/RecentlyViewedCarousel';
import { SavedSearchesPanel } from './features/personalization/components/SavedSearchesPanel';
import { OnboardingWizard } from './features/personalization/components/OnboardingWizard';
import { useAuth } from './features/auth/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';

// Code-split pages for performance optimization
const PropertySearchPage = lazy(() => import('./pages/PropertySearchPage').then(m => ({ default: m.PropertySearchPage })));
const PropertyDetailsPage = lazy(() => import('./pages/PropertyDetailsPage').then(m => ({ default: m.PropertyDetailsPage })));
const LoginForm = lazy(() => import('./features/auth/components/LoginForm').then(m => ({ default: m.LoginForm })));
const RegisterForm = lazy(() => import('./features/auth/components/RegisterForm').then(m => ({ default: m.RegisterForm })));
const DashboardPage = lazy(() => import('./features/dashboard/components/DashboardPage').then(m => ({ default: m.DashboardPage })));
const AgentDashboard = lazy(() => import('./features/agent/components/AgentDashboard').then(m => ({ default: m.AgentDashboard })));
const CreatePropertyWizard = lazy(() => import('./features/agent/components/CreatePropertyWizard').then(m => ({ default: m.CreatePropertyWizard })));
const AdminDashboard = lazy(() => import('./features/admin/components/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const LeadPipeline = lazy(() => import('./features/leads/components/LeadPipeline').then(m => ({ default: m.LeadPipeline })));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

function HomePage() {
  const { token, user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  const { data: propertiesResult, isLoading } = useQuery({
    queryKey: ['featuredProperties'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3333/properties?limit=4');
      if (!res.ok) throw new Error('Failed to fetch properties');
      return res.json();
    }
  });

  // Check if user needs onboarding (E11.21 Cold Start)
  const { data: userPref } = useQuery({
    queryKey: ['userPreferences'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3333/me/preferences', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!token,
  });

  const handleOnboardingComplete = async (preferences: any) => {
    try {
      await fetch('http://localhost:3333/me/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...preferences, onboardingCompleted: true }),
      });
    } catch (e) { console.error(e); }
    setShowOnboarding(false);
  };

  // Get greeting based on time of day
  const hour = new Date().getHours();
  const greetingAr = hour < 12 ? 'صباح الخير' : hour < 17 ? 'مساء الخير' : 'مساء الخير';
  const greetingEmoji = hour < 12 ? '☀️' : hour < 17 ? '🌤️' : '🌙';

  const featuredProperties = propertiesResult?.data || [];

  // Show onboarding for new logged-in users
  const needsOnboarding = token && userPref && !userPref.onboardingCompleted;

  return (
    <>
      {/* E11.21 Cold Start Onboarding */}
      {(needsOnboarding || showOnboarding) && (
        <OnboardingWizard
          onComplete={handleOnboardingComplete}
          onSkip={() => setShowOnboarding(false)}
        />
      )}

      {/* Hero Section with Personalized Greeting */}
      <section className="relative h-[80vh] flex items-center justify-center pt-20">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2675&auto=format&fit=crop" 
            alt="Hero Background" 
            className="w-full h-full object-cover brightness-[0.65]"
            loading="eager"
          />
        </div>

        <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto space-y-6">
          {/* Personalized Greeting (E11.29) */}
          {user && (
            <p className="text-lg text-gray-200 font-medium">
              {greetingEmoji} {greetingAr}، {user.firstName || 'مستخدم'}
            </p>
          )}
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-md">
            {user ? 'إيه اللي بتدور عليه النهاردة؟ 🔎' : 'ابحث عن منزل أحلامك بالذكاء الاصطناعي 🤖'}
          </h1>
          <p className="text-lg md:text-xl text-gray-200 font-medium drop-shadow">
            اكتب طلبك باللغة الطبيعية وسيقوم النظام باستخراج الفلاتر وترشيح أفضل العقارات لك
          </p>

          {/* Natural Language AI Search Bar (E10.1) */}
          <AISearchBar />
        </div>
      </section>

      {/* E11 Personalized Sections */}
      <section className="container mx-auto px-6 py-8 space-y-8">
        {/* Recently Viewed + Continue Exploring (E11.5 & E11.6) */}
        <RecentlyViewedCarousel />

        {/* Saved Searches with Alert Badges (E11.9 & E11.10) */}
        <SavedSearchesPanel />

        {/* Personalized Home Feed — 5 sections (E11.13 & E11.14) */}
        {token && <PersonalizedHomeFeed />}

        {/* Fallback: E10 generic recommendations for anonymous */}
        {!token && <PersonalizedRecommendations titleAr="توصيات الذكاء الاصطناعي لك" limit={4} />}
      </section>

      {/* Floating AI Search Assistant Widget (E10.4) */}
      <ConversationalSearchWidget />

      {/* Floating Features Bar */}
      <div className="container mx-auto px-6 relative z-20 -mt-16 mb-16">
        <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-wrap md:flex-nowrap items-center justify-between gap-6 border border-gray-100">
          
          <div className="flex items-center gap-4 flex-1 justify-center md:justify-start">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-sm">
              <HomeIcon size={22} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">عقارات موثوقة</h3>
              <p className="text-gray-500 text-sm font-en">+ 12,000 عقار</p>
            </div>
          </div>

          <div className="hidden md:block w-px h-12 bg-gray-100" />

          <div className="flex items-center gap-4 flex-1 justify-center">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white shadow-sm">
              <Users size={22} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">وكلاء معتمدون</h3>
              <p className="text-gray-500 text-sm font-en">+ 1,200 وكيل</p>
            </div>
          </div>

          <div className="hidden md:block w-px h-12 bg-gray-100" />

          <div className="flex items-center gap-4 flex-1 justify-center">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-sm">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">معاملات آمنة</h3>
              <p className="text-gray-500 text-sm font-en">100% حماية</p>
            </div>
          </div>

          <div className="hidden md:block w-px h-12 bg-gray-100" />

          <div className="flex items-center gap-4 flex-1 justify-center md:justify-end">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white shadow-sm">
              <Building size={22} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">مشروعات مميزة</h3>
              <p className="text-gray-500 text-sm font-en">+ 150 مشروع</p>
            </div>
          </div>

        </div>
      </div>

      {/* Featured Properties Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800">عقارات مميزة</h2>
            <Link to="/search" className="text-gray-500 hover:text-primary font-bold flex items-center gap-2 transition-colors">
              <span className="text-lg">&lsaquo;</span> عرض جميع العقارات
            </Link>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProperties.map((property: any) => (
                <Link to={`/properties/${property.slug}`} key={property.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group block">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={property.media?.[0]?.url || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop"} 
                      alt={property.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <button onClick={(e) => { e.preventDefault(); /* Handle Favorite */ }} className="absolute top-3 left-3 w-8 h-8 bg-black/20 hover:bg-red-500 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors">
                      <Heart size={16} />
                    </button>
                    <div className="absolute top-3 right-3 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">
                      {property.purpose === 'SALE' ? 'للبيع' : 'للإيجار'}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="font-en font-bold text-2xl text-primary mb-2">
                      {property.price?.toLocaleString()} <span className="text-sm font-ar">ج.م</span>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-1 line-clamp-1">{property.title}</h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-1">{property.areaLocation}, {property.city}</p>
                    <div className="flex items-center justify-between text-gray-600 font-en text-sm pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-1.5"><HomeIcon size={16}/> {property.bedrooms || 1}</div>
                      <div className="flex items-center gap-1.5"><Building size={16}/> {property.bathrooms || 1}</div>
                      <div className="flex items-center gap-1.5">{property.area} م²</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bottom Features Banners */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="bg-[#f8f9fa] rounded-3xl border border-gray-100 p-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            
            <div className="flex items-center gap-4 text-right">
              <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center text-accent flex-shrink-0">
                <Sparkles size={28} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg mb-1">بحث ذكي</h3>
                <p className="text-gray-500 text-sm">استخدم الذكاء الاصطناعي للعثور على ما يناسبك</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-right">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
                <Bell size={28} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg mb-1">تنبيهات فورية</h3>
                <p className="text-gray-500 text-sm">احصل على تنبيهات للعقارات الجديدة المناسبة لك</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-right">
              <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center text-accent flex-shrink-0">
                <Heart size={28} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg mb-1">احفظ مفضلاتك</h3>
                <p className="text-gray-500 text-sm">احفظ العقارات التي تعجبك بسهولة</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-right">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
                <PieChart size={28} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg mb-1">تحليلات متقدمة</h3>
                <p className="text-gray-500 text-sm">تقرير شامل عن السوق وأسعار العقارات</p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Main Layout */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="search" element={<PropertySearchPage />} />
            <Route path="properties/:slug" element={<PropertyDetailsPage />} />
            <Route path="properties/new" element={
              <div className="py-12">
                <AddPropertyForm />
              </div>
            } />
            <Route path="login" element={<LoginForm />} />
            <Route path="register" element={<RegisterForm />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="agent/dashboard" element={<AgentDashboard />} />
            <Route path="agent/properties/new" element={<CreatePropertyWizard />} />
            <Route path="agent/leads" element={<LeadPipeline />} />
            <Route path="admin/dashboard" element={<AdminDashboard />} />
          </Route>

          {/* Secure Admin Layout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="properties" element={
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between mb-6">
                  <h2 className="text-2xl font-bold text-primary">Manage Properties</h2>
                  <Link to="/properties/new" className="bg-accent text-white px-4 py-2 rounded font-bold hover:bg-opacity-90">
                    + Add Property
                  </Link>
                </div>
                <p className="text-gray-500">List of properties will go here...</p>
              </div>
            } />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
