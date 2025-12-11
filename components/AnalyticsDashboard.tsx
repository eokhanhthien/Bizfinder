import React, { useMemo, useState } from 'react';
import { Business } from '../types';
import { BarChart3, Star, X, Filter } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  data: Business[];
  onClose: () => void;
}

const AnalyticsDashboard: React.FC<Props> = ({ data, onClose }) => {
  const { t } = useLanguage();
  const [filterPhone, setFilterPhone] = useState(false);
  const [filterWebsite, setFilterWebsite] = useState(false);
  const [minRating, setMinRating] = useState(0);

  // Filter Data Logic
  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (filterPhone && !item.phone) return false;
      if (filterWebsite && !item.website) return false;
      if (item.rating && item.rating < minRating) return false;
      return true;
    });
  }, [data, filterPhone, filterWebsite, minRating]);

  // Statistics Logic
  const stats = useMemo(() => {
    const total = data.length;
    if (total === 0) return null;

    const hasPhoneCount = data.filter(b => b.phone).length;
    const hasWebsiteCount = data.filter(b => b.website).length;
    
    // Stats for FILTERED set
    const currentTotal = filteredData.length;
    const avgRating = currentTotal > 0 
      ? filteredData.reduce((acc, curr) => acc + (curr.rating || 0), 0) / currentTotal 
      : 0;

    // Rating Distribution (Filtered)
    const distribution = [0, 0, 0, 0, 0];
    filteredData.forEach(b => {
      const r = Math.round(b.rating || 0);
      if (r >= 1 && r <= 5) distribution[r-1]++;
    });

    return { total, hasPhoneCount, hasWebsiteCount, currentTotal, avgRating, distribution };
  }, [data, filteredData]);

  if (!stats) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-[#f8fafc] flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-300">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 flex justify-between items-center shadow-sm shrink-0">
        <div>
          <h2 className="text-xl font-bold text-[#005993] flex items-center gap-2">
            <BarChart3 className="w-6 h-6" /> 
            {t('market_intelligence')}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
             {t('analyzing_count')} {data.length} {t('businesses')}
          </p>
        </div>
        <button 
          onClick={onClose}
          className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
        >
          <X className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      {/* Content Scrollable Area */}
      <div className="flex-grow overflow-y-auto p-4 pb-20">
           <div className="space-y-6 max-w-4xl mx-auto">
              
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                 <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="text-slate-400 text-xs font-bold uppercase mb-1">{t('total_found')}</div>
                    <div className="text-2xl font-bold text-[#005993]">{stats.total}</div>
                 </div>
                 <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="text-slate-400 text-xs font-bold uppercase mb-1">{t('with_phone')}</div>
                    <div className="text-2xl font-bold text-[#005993]">{stats.hasPhoneCount} <span className="text-xs text-slate-400 font-medium">({Math.round(stats.hasPhoneCount/stats.total*100)}%)</span></div>
                 </div>
                 <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="text-slate-400 text-xs font-bold uppercase mb-1">{t('with_website')}</div>
                    <div className="text-2xl font-bold text-[#005993]">{stats.hasWebsiteCount} <span className="text-xs text-slate-400 font-medium">({Math.round(stats.hasWebsiteCount/stats.total*100)}%)</span></div>
                 </div>
                 <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="text-slate-400 text-xs font-bold uppercase mb-1">{t('avg_rating')}</div>
                    <div className="text-2xl font-bold text-amber-500 flex items-center gap-1">
                       {stats.avgRating.toFixed(1)} <Star className="w-5 h-5 fill-current" />
                    </div>
                 </div>
              </div>

              {/* Filters Section */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                 <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-4 h-4 text-[#005993]" />
                    <h3 className="font-bold text-slate-700">{t('filter_analysis')}</h3>
                 </div>
                 
                 <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                       <input type="checkbox" checked={filterPhone} onChange={e => setFilterPhone(e.target.checked)} className="w-4 h-4 rounded text-[#005993] focus:ring-[#7ED3F7]" />
                       <span className="text-sm font-medium text-slate-600">{t('has_phone')}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                       <input type="checkbox" checked={filterWebsite} onChange={e => setFilterWebsite(e.target.checked)} className="w-4 h-4 rounded text-[#005993] focus:ring-[#7ED3F7]" />
                       <span className="text-sm font-medium text-slate-600">{t('has_website')}</span>
                    </label>
                    <div className="flex items-center gap-2 ml-auto">
                       <span className="text-sm font-medium text-slate-600">{t('min_rating')}</span>
                       <select 
                          value={minRating} 
                          onChange={e => setMinRating(Number(e.target.value))}
                          className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-2 py-1 font-bold outline-none focus:border-[#005993]"
                       >
                          <option value="0">{t('all')}</option>
                          <option value="3">3.0+</option>
                          <option value="4">4.0+</option>
                          <option value="4.5">4.5+</option>
                       </select>
                    </div>
                 </div>

                 <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-sm font-bold text-slate-600">{t('rating_distribution')} ({filteredData.length})</span>
                    </div>
                    <div className="flex items-end gap-2 h-32">
                       {[1, 2, 3, 4, 5].map((star, idx) => {
                          const count = stats.distribution[idx];
                          const height = stats.currentTotal > 0 ? (count / stats.currentTotal) * 100 : 0;
                          return (
                             <div key={star} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                                <div className="text-[10px] font-bold text-slate-400">{count}</div>
                                <div 
                                  className="w-full bg-[#005993] rounded-t-sm transition-all duration-500"
                                  style={{ height: `${Math.max(height, 2)}%`, opacity: 0.3 + (idx * 0.15) }} 
                                />
                                <div className="text-xs font-bold text-slate-600 flex items-center gap-0.5">
                                   {star} <Star className="w-3 h-3 text-amber-400 fill-current" />
                                </div>
                             </div>
                          );
                       })}
                    </div>
                 </div>
              </div>
           </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
