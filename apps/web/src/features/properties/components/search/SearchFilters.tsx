import React from 'react';
import { useSearchFilters } from '../../hooks/useSearchFilters';
import { Search, MapPin, Building, DollarSign, Maximize, Bed, Bath, Filter, X } from 'lucide-react';

export const SearchFilters = () => {
  const { filters, updateFilter, clearAllFilters } = useSearchFilters();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Filter size={20} className="text-primary" />
          تصفية النتائج
        </h2>
        <button 
          onClick={clearAllFilters}
          className="text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          إعادة ضبط
        </button>
      </div>

      <div className="space-y-6">
        {/* Purpose */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">الغرض</label>
          <div className="flex gap-2">
            <button 
              onClick={() => updateFilter('purpose', 'SALE')}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${filters.purpose === 'SALE' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              شراء
            </button>
            <button 
              onClick={() => updateFilter('purpose', 'RENT')}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${filters.purpose === 'RENT' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              إيجار
            </button>
          </div>
        </div>

        {/* Keyword Search */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">كلمات البحث</label>
          <div className="relative">
            <input 
              type="text" 
              placeholder="ابحث بالاسم، المدينة..."
              value={filters.q || ''}
              onChange={(e) => updateFilter('q', e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-right outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <Search size={16} className="absolute left-3 top-3.5 text-gray-400" />
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">السعر (ج.م)</label>
          <div className="flex gap-2">
            <input 
              type="number" 
              placeholder="من"
              value={filters.minPrice || ''}
              onChange={(e) => updateFilter('minPrice', e.target.value)}
              className="w-1/2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-right outline-none focus:border-primary"
            />
            <input 
              type="number" 
              placeholder="إلى"
              value={filters.maxPrice || ''}
              onChange={(e) => updateFilter('maxPrice', e.target.value)}
              className="w-1/2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-right outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Area Range */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">المساحة (م²)</label>
          <div className="flex gap-2">
            <input 
              type="number" 
              placeholder="من"
              value={filters.minArea || ''}
              onChange={(e) => updateFilter('minArea', e.target.value)}
              className="w-1/2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-right outline-none focus:border-primary"
            />
            <input 
              type="number" 
              placeholder="إلى"
              value={filters.maxArea || ''}
              onChange={(e) => updateFilter('maxArea', e.target.value)}
              className="w-1/2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-right outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Beds & Baths */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">غرف النوم</label>
            <select 
              value={filters.bedrooms || ''}
              onChange={(e) => updateFilter('bedrooms', e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-right outline-none focus:border-primary"
            >
              <option value="">الكل</option>
              <option value="1">+1</option>
              <option value="2">+2</option>
              <option value="3">+3</option>
              <option value="4">+4</option>
              <option value="5">+5</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">الحمامات</label>
            <select 
              value={filters.bathrooms || ''}
              onChange={(e) => updateFilter('bathrooms', e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-right outline-none focus:border-primary"
            >
              <option value="">الكل</option>
              <option value="1">+1</option>
              <option value="2">+2</option>
              <option value="3">+3</option>
              <option value="4">+4</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-sm font-bold text-gray-700 mb-4">فلاتر متقدمة</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">طريقة الدفع</label>
              <select 
                value={filters.paymentMethod || ''}
                onChange={(e) => updateFilter('paymentMethod', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-right outline-none focus:border-primary"
              >
                <option value="">الكل</option>
                <option value="CASH">كاش</option>
                <option value="INSTALLMENTS">تقسيط</option>
                <option value="BOTH">كاش أو تقسيط</option>
              </select>
            </div>

            {filters.paymentMethod === 'INSTALLMENTS' && (
              <>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">الحد الأقصى للمقدم (ج.م)</label>
                  <input 
                    type="number" 
                    value={filters.maxDownPayment || ''}
                    onChange={(e) => updateFilter('maxDownPayment', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-right outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">الحد الأقصى للقسط الشهري (ج.م)</label>
                  <input 
                    type="number" 
                    value={filters.maxMonthlyInstallment || ''}
                    onChange={(e) => updateFilter('maxMonthlyInstallment', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-right outline-none focus:border-primary"
                  />
                </div>
              </>
            )}

            {filters.purpose === 'INVESTMENT' && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">نوع الاستثمار</label>
                <select 
                  value={filters.investmentType || ''}
                  onChange={(e) => updateFilter('investmentType', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-right outline-none focus:border-primary"
                >
                  <option value="">الكل</option>
                  <option value="RENTAL_YIELD">عائد إيجاري</option>
                  <option value="CAPITAL_APPRECIATION">زيادة رأس المال</option>
                  <option value="BOTH">كلاهما</option>
                </select>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
