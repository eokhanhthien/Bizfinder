import React from 'react';
import { Compass, Menu, Languages, ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  onOpenSidebar: () => void;
}

const Header: React.FC<Props> = ({ onOpenSidebar }) => {
  const { t, language, setLanguage } = useLanguage();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-white/90 backdrop-blur-md border-b border-slate-200/50 shadow-sm"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <div className="flex items-center gap-3">
            {/* Custom Logo Design */}
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#005993] to-[#004d7a] shadow-lg shadow-blue-900/20">
              <Compass className="w-6 h-6 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#34D259] rounded-full border-2 border-white"></div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-xl font-bold text-[#005993] tracking-tight leading-none">
                {t('app_name')}
              </span>
              <span className="text-[10px] font-medium text-slate-400 tracking-wider uppercase mt-0.5">
                {t('app_subtitle')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher - Select */}
            <div className="relative group">
               <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Languages className="w-3.5 h-3.5 text-slate-500" />
               </div>
               <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'vi' | 'en')}
                  className="appearance-none pl-7 pr-6 py-1.5 rounded-lg text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 focus:border-[#7ED3F7] focus:ring-2 focus:ring-[#7ED3F7]/20 outline-none transition-all cursor-pointer hover:bg-white"
               >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
               </select>
               <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronDown className="w-3 h-3 text-slate-400" />
               </div>
            </div>

            {/* Right Side Controls - Menu Button */}
            <button 
              onClick={onOpenSidebar}
              className="relative flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 active:scale-95 bg-slate-50 text-[#005993] border border-slate-200 active:bg-[#f0f9ff] active:border-[#7ED3F7]"
              title={t('menu')}
            >
              <span className="text-xs font-bold hidden sm:block">{t('menu')}</span>
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;