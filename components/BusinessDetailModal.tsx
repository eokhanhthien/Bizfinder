import React, { useMemo } from 'react';
import { X, MapPin, Phone, Star, Clock, Info, CheckCircle2, XCircle, Navigation, Truck, Utensils, ShoppingBag, Briefcase } from 'lucide-react';
import { Business } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  data: Business;
  onClose: () => void;
}

const BusinessDetailModal: React.FC<Props> = ({ data, onClose }) => {
  const { t } = useLanguage();
  
  // Zalo Link Generator
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

  // Stable Fallback Photos
  const fallbackPhotos = [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80', // Office
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80', // Office 2
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80'  // Building
  ];

  // Logic: Use data photos if available, otherwise use fallbacks. 
  // Note: Even if data.photos exist, they might be broken URLs from AI. 
  // The img onError handler below handles individual broken links.
  const displayPhotos = (data.photos && data.photos.length > 0) 
    ? data.photos 
    : fallbackPhotos;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* Modal Container with Slide Up Animation */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-16 fade-in duration-500">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/50 md:hover:bg-black/70 active:bg-black/80 active:scale-95 text-white rounded-full backdrop-blur-md transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image Swiper / Slider (CSS Scroll Snap) */}
        <div className="relative h-64 sm:h-80 shrink-0 bg-slate-200">
           <div className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
              {displayPhotos.map((url, idx) => (
                  <div key={idx} className="flex-shrink-0 w-full h-full snap-center relative">
                      <img 
                        src={url} 
                        alt={`Gallery ${idx}`} 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                            const target = e.currentTarget;
                            // Prevent infinite loop
                            target.onerror = null; 
                            // Fallback to a random fallback photo based on index
                            target.src = fallbackPhotos[idx % fallbackPhotos.length];
                        }} 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>
              ))}
           </div>
           
           {/* Overlaid Info */}
           <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex flex-wrap gap-2 mb-2">
                    {data.types?.slice(0, 3).map((t, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-semibold">
                            {t}
                        </span>
                    ))}
                </div>
                <h2 className="text-3xl font-bold drop-shadow-md leading-tight">{data.name}</h2>
                <div className="flex items-center gap-2 mt-2 text-sm font-medium text-white/90">
                     <MapPin className="w-4 h-4" />
                     <span className="truncate">{data.address}</span>
                </div>
           </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto bg-slate-50">
           <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
               
               {/* Left Column: Main Info */}
               <div className="md:col-span-2 space-y-6">
                   
                   {/* Ratings & Price */}
                   <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex flex-col">
                            <span className="text-xs text-slate-400 font-bold uppercase">{t('rating')}</span>
                            <div className="flex items-center gap-1.5 text-2xl font-bold text-[#005993]">
                                {data.rating?.toFixed(1)} <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                            </div>
                            <span className="text-xs text-slate-500">{data.reviewCount} {t('reviews_count')}</span>
                        </div>
                        <div className="w-px h-10 bg-slate-200"></div>
                        <div className="flex flex-col">
                             <span className="text-xs text-slate-400 font-bold uppercase">{t('price')}</span>
                             <div className="text-2xl font-bold text-slate-700">{data.priceLevel || 'N/A'}</div>
                        </div>
                   </div>

                   {/* Service Options */}
                   {data.serviceOptions && (
                       <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                           <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                               <Info className="w-4 h-4 text-[#005993]" /> {t('service_options')}
                           </h3>
                           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                               <ServiceBadge label={t('dine_in')} active={data.serviceOptions.dineIn} icon={<Utensils className="w-3.5 h-3.5" />} />
                               <ServiceBadge label={t('takeout')} active={data.serviceOptions.takeout} icon={<ShoppingBag className="w-3.5 h-3.5" />} />
                               <ServiceBadge label={t('delivery')} active={data.serviceOptions.delivery} icon={<Truck className="w-3.5 h-3.5" />} />
                               <ServiceBadge label={t('curbside')} active={data.serviceOptions.curbsidePickup} icon={<CarIcon className="w-3.5 h-3.5" />} />
                           </div>
                       </div>
                   )}
                   
               </div>

               {/* Right Column: Contact & Hours */}
               <div className="space-y-6">
                   
                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3">
                        {data.googleMapsUri && (
                            <a href={data.googleMapsUri} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-[#005993] md:hover:bg-[#004d7a] active:bg-[#004d7a] active:scale-95 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/10 transition-all">
                                <Navigation className="w-4 h-4" /> {t('open_maps')}
                            </a>
                        )}
                        {data.phone && (
                            <div className="grid grid-cols-2 gap-3">
                                <a href={`tel:${data.phone}`} className="py-2.5 bg-white border border-slate-200 md:hover:border-[#005993] active:bg-slate-50 text-slate-700 md:hover:text-[#005993] rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95">
                                    <Phone className="w-4 h-4" /> {t('call')}
                                </a>
                                {zaloLink && (
                                    <a href={zaloLink} target="_blank" rel="noopener noreferrer" className="py-2.5 bg-blue-50 border border-blue-100 md:hover:bg-blue-100 active:bg-blue-200 text-[#0068FF] rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95">
                                        <img 
                                            src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" 
                                            alt="Zalo" 
                                            className="w-5 h-5 object-contain" 
                                        /> 
                                        {t('zalo')}
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Opening Hours */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                             <Clock className="w-4 h-4 text-[#005993]" /> {t('opening_hours')}
                        </h3>
                        {data.openingHours && data.openingHours.length > 0 ? (
                            <ul className="space-y-2">
                                {data.openingHours.map((hour, idx) => (
                                    <li key={idx} className="text-sm text-slate-600 flex justify-between border-b border-slate-50 last:border-0 pb-1 last:pb-0">
                                        <span>{hour}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-slate-400 italic">{t('hours_na')}</p>
                        )}
                    </div>
                    
                    {/* Owner Info / Representation */}
                    {data.ownerName && (
                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                             <h4 className="text-xs font-bold uppercase text-amber-600 mb-2 flex items-center gap-1.5">
                                <Briefcase className="w-3.5 h-3.5" /> {t('representative')}
                             </h4>
                             <div className="text-sm font-semibold text-slate-800">
                                {data.ownerName}
                             </div>
                        </div>
                    )}

               </div>

           </div>
        </div>
      </div>
    </div>
  );
};

// Helper Subcomponents
const ServiceBadge = ({ label, active, icon }: { label: string, active: boolean, icon: React.ReactNode }) => (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold ${active ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-50 border-slate-100 text-slate-400 opacity-60'}`}>
        {active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
        <div className="flex items-center gap-1.5">
            {icon} {label}
        </div>
    </div>
);

const CarIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
);

export default BusinessDetailModal;