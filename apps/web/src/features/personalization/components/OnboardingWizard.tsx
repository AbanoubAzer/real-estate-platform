import React, { useState } from 'react';
import { Home, TrendingUp, Umbrella, Building2, MapPin, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: (preferences: any) => void;
  onSkip: () => void;
}

const STEPS = ['purpose', 'locations', 'budget', 'type'] as const;

const PURPOSE_OPTIONS = [
  { id: 'LIVING', icon: <Home size={32} />, labelAr: 'سكن', labelEn: 'Living', emoji: '🏠' },
  { id: 'INVESTMENT', icon: <TrendingUp size={32} />, labelAr: 'استثمار', labelEn: 'Investment', emoji: '📈' },
  { id: 'VACATION', icon: <Umbrella size={32} />, labelAr: 'مصيف / إجازة', labelEn: 'Vacation', emoji: '🏖️' },
  { id: 'COMMERCIAL', icon: <Building2 size={32} />, labelAr: 'تجاري', labelEn: 'Commercial', emoji: '🏢' },
];

const LOCATION_OPTIONS = [
  { id: 'Hurghada', labelAr: 'الغردقة', emoji: '🌊' },
  { id: 'El Gouna', labelAr: 'الجونة', emoji: '⛵' },
  { id: 'Sahl Hasheesh', labelAr: 'سهل حشيش', emoji: '🏝️' },
  { id: 'Makadi', labelAr: 'مكادي', emoji: '🌴' },
  { id: 'Cairo', labelAr: 'القاهرة', emoji: '🏛️' },
  { id: 'New Cairo', labelAr: 'القاهرة الجديدة', emoji: '🏙️' },
  { id: 'Alexandria', labelAr: 'الإسكندرية', emoji: '⚓' },
  { id: 'North Coast', labelAr: 'الساحل الشمالي', emoji: '🌅' },
];

const TYPE_OPTIONS = [
  { id: 'APARTMENT', labelAr: 'شقة', emoji: '🏢' },
  { id: 'VILLA', labelAr: 'فيلا', emoji: '🏡' },
  { id: 'CHALET', labelAr: 'شاليه', emoji: '🏖️' },
  { id: 'STUDIO', labelAr: 'استوديو', emoji: '🛏️' },
  { id: 'DUPLEX', labelAr: 'دوبلكس', emoji: '🏘️' },
  { id: 'PENTHOUSE', labelAr: 'بنتهاوس', emoji: '🌆' },
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete, onSkip }) => {
  const [step, setStep] = useState(0);
  const [preferences, setPreferences] = useState({
    purpose: '',
    preferredLocations: [] as string[],
    budgetMax: 5000000,
    preferredPropertyTypes: [] as string[],
  });

  const currentStep = STEPS[step];

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(preferences);
    }
  };

  const toggleLocation = (loc: string) => {
    setPreferences((prev) => ({
      ...prev,
      preferredLocations: prev.preferredLocations.includes(loc)
        ? prev.preferredLocations.filter((l) => l !== loc)
        : [...prev.preferredLocations, loc],
    }));
  };

  const toggleType = (type: string) => {
    setPreferences((prev) => ({
      ...prev,
      preferredPropertyTypes: prev.preferredPropertyTypes.includes(type)
        ? prev.preferredPropertyTypes.filter((t) => t !== type)
        : [...prev.preferredPropertyTypes, type],
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-[#152D5B] via-[#1a3a6e] to-[#0d1f42] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 text-white shadow-2xl text-right">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-xs font-bold mb-4">
            <Sparkles size={14} className="text-[#EF8D00]" />
            <span>خطوة {step + 1} من {STEPS.length}</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {currentStep === 'purpose' && 'إيه اللي بتدور عليه؟'}
            {currentStep === 'locations' && 'فين تفضل؟'}
            {currentStep === 'budget' && 'كام ميزانيتك؟'}
            {currentStep === 'type' && 'نوع العقار؟'}
          </h2>
          <p className="text-white/60 text-sm">
            {currentStep === 'purpose' && 'اختر الهدف من البحث'}
            {currentStep === 'locations' && 'اختر المناطق المفضلة (يمكنك اختيار أكثر من واحدة)'}
            {currentStep === 'budget' && 'حدد الحد الأقصى لميزانيتك'}
            {currentStep === 'type' && 'اختر أنواع العقارات اللي تفضلها'}
          </p>
        </div>

        {/* Step: Purpose */}
        {currentStep === 'purpose' && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            {PURPOSE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setPreferences((p) => ({ ...p, purpose: opt.id }))}
                className={`p-6 rounded-2xl border-2 transition-all text-center space-y-2 ${
                  preferences.purpose === opt.id
                    ? 'border-[#EF8D00] bg-[#EF8D00]/20 scale-[1.03]'
                    : 'border-white/20 hover:border-white/40 bg-white/5'
                }`}
              >
                <span className="text-3xl">{opt.emoji}</span>
                <p className="font-bold text-sm">{opt.labelAr}</p>
                <p className="text-xs text-white/50">{opt.labelEn}</p>
              </button>
            ))}
          </div>
        )}

        {/* Step: Locations */}
        {currentStep === 'locations' && (
          <div className="grid grid-cols-2 gap-3 mb-8">
            {LOCATION_OPTIONS.map((loc) => (
              <button
                key={loc.id}
                onClick={() => toggleLocation(loc.id)}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  preferences.preferredLocations.includes(loc.id)
                    ? 'border-[#EF8D00] bg-[#EF8D00]/20'
                    : 'border-white/20 hover:border-white/40 bg-white/5'
                }`}
              >
                <span className="text-xl">{loc.emoji}</span>
                <p className="font-bold text-sm mt-1">{loc.labelAr}</p>
              </button>
            ))}
          </div>
        )}

        {/* Step: Budget */}
        {currentStep === 'budget' && (
          <div className="mb-8 space-y-6">
            <div className="text-center">
              <p className="text-4xl font-bold font-en text-[#EF8D00]">
                {(preferences.budgetMax / 1_000_000).toFixed(1)}M
              </p>
              <p className="text-sm text-white/60 mt-1">جنيه مصري</p>
            </div>
            <input
              type="range"
              min={500000}
              max={20000000}
              step={500000}
              value={preferences.budgetMax}
              onChange={(e) => setPreferences((p) => ({ ...p, budgetMax: parseInt(e.target.value) }))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#EF8D00]"
            />
            <div className="flex justify-between text-xs text-white/40 font-en">
              <span>500K</span>
              <span>20M+</span>
            </div>
          </div>
        )}

        {/* Step: Property Type */}
        {currentStep === 'type' && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {TYPE_OPTIONS.map((type) => (
              <button
                key={type.id}
                onClick={() => toggleType(type.id)}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  preferences.preferredPropertyTypes.includes(type.id)
                    ? 'border-[#EF8D00] bg-[#EF8D00]/20'
                    : 'border-white/20 hover:border-white/40 bg-white/5'
                }`}
              >
                <span className="text-2xl">{type.emoji}</span>
                <p className="font-bold text-xs mt-1">{type.labelAr}</p>
              </button>
            ))}
          </div>
        )}

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {STEPS.map((_, i) => (
            <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${i === step ? 'bg-[#EF8D00] w-8' : i < step ? 'bg-[#EF8D00]/50' : 'bg-white/20'}`} />
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="flex-1 py-3 rounded-xl border border-white/20 text-white/80 font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-1">
              <ChevronRight size={18} /> السابق
            </button>
          )}
          <button onClick={handleNext} className="flex-1 py-3 rounded-xl bg-[#EF8D00] hover:bg-[#d67f00] text-white font-bold shadow-lg shadow-[#EF8D00]/30 transition-all flex items-center justify-center gap-1">
            {step === STEPS.length - 1 ? 'ابدأ الاستكشاف ✨' : 'التالي'}
            {step < STEPS.length - 1 && <ChevronLeft size={18} />}
          </button>
        </div>

        <button onClick={onSkip} className="w-full text-center text-white/40 hover:text-white/60 text-xs mt-4 transition-colors">
          تخطي ← سأختار لاحقاً
        </button>
      </div>
    </div>
  );
};
