import React, { useMemo } from 'react';
import { Star, MapPin, Phone, Navigation, ArrowRight } from 'lucide-react';
import { Business } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  data: Business;
  onUpdate: (id: string, updates: Partial<Business>) => void;
  onSelect?: (business: Business) => void;
}

const BusinessCard: React.FC<Props> = ({ data, onSelect }) => {
  const { t } = useLanguage();
  
  // Zalo Link
  const zaloLink = useMemo(() => {
    if (!data.phone) return null;
    let cleanPhone = data.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('84')) {
        cleanPhone = '0' + cleanPhone.slice(2);
    }
    const isVnMobile = /^(03|05|07|08|09)[0-9]{8}$/.test(cleanPhone);
    if (!isVnMobile) return null;
    return `https://zalo.me/${cleanPhone}`;
  }, [data.phone]);

  return (
    <div 
      className="bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-200/50 flex flex-col h-full relative overflow-hidden transition-all duration-200 group md:hover:shadow-lg md:hover:-translate-y-1"
    >
      <div className="p-5 flex-grow flex flex-col">
          {/* Header Area: Name */}
          <div className="flex justify-between items-start mb-2 gap-3">
            <h3 className="text-lg font-bold text-[#005993] leading-snug pr-2 line-clamp-2 md:group-hover:text-[#004d7a] transition-colors" title={data.name}>
              {data.name}
            </h3>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center shrink-0 bg-[#f0f9ff] text-[#005993] px-2.5 py-1 rounded-lg text-xs font-bold border border-[#7ED3F7]/30">
              {data.rating?.toFixed(1)} <Star className="w-3 h-3 ml-1 fill-amber-400 text-amber-400" />
            </span>
            <span className="text-xs text-slate-400">({data.reviewCount} {t('reviews_count')})</span>
            {data.priceLevel && (
                 <span className="text-xs text-slate-500 font-bold px-2 border-l border-slate-200">{data.priceLevel}</span>
            )}
          </div>

          <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed">
            {data.description}
          </p>

          <div className="space-y-3 mt-auto pt-2 border-t border-slate-50">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 md:group-hover:bg-[#f0f9ff] transition-colors">
                 <MapPin className="w-4 h-4 text-[#D71249]" />
              </div>
              <span className="text-sm text-slate-600 leading-tight py-1.5 line-clamp-2">{data.address}</span>
            </div>
            
            {data.phone && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 md:group-hover:bg-[#f0f9ff] transition-colors">
                    <Phone className="w-4 h-4 text-[#005993]" />
                  </div>
                  <a 
                    href={`tel:${data.phone}`} 
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm text-slate-700 font-medium md:hover:text-[#005993] md:hover:underline active:text-[#005993]"
                  >
                    {data.phone}
                  </a>
                </div>
              </div>
            )}
          </div>
      </div>
      
      {/* Footer Actions */}
      <div className="px-5 pb-5 pt-0 flex justify-between items-center gap-3">
         <button 
            onClick={() => onSelect && onSelect(data)}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-50 text-[#005993] border border-slate-200 text-xs font-bold py-2.5 px-3 rounded-xl transition-all md:hover:bg-[#005993] md:hover:text-white md:hover:border-[#005993] active:scale-95 active:bg-[#005993] active:text-white"
         >
            {t('view_details')} <ArrowRight className="w-3 h-3" />
         </button>
         
         {data.googleMapsUri && (
          <a 
            href={data.googleMapsUri}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center p-2.5 bg-[#f0f9ff] text-[#005993] border border-[#7ED3F7]/50 rounded-xl transition-all md:hover:bg-[#005993] md:hover:text-white active:scale-95 active:bg-[#005993] active:text-white"
            title={t('open_maps')}
          >
            <Navigation className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
};

export default BusinessCard;