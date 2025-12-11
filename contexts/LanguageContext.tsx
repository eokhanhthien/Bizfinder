import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'vi' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  vi: {
    // Header & General
    'app_name': 'BizFinder',
    'app_subtitle': 'Intelligence',
    'menu': 'Menu',
    
    // Search Form
    'industry_label': 'NGÀNH NGHỀ / LĨNH VỰC',
    'location_label': 'KHU VỰC / ĐỊA ĐIỂM',
    'industry_placeholder': 'VD: Quán Cà Phê, Spa, Phòng Khám...',
    'location_placeholder': 'VD: Quận 1, TP.HCM',
    'start_search': 'Bắt đầu tìm',
    'searching': 'Đang tìm kiếm...',
    'loading_deep_data': 'Đang tải dữ liệu sâu...',
    'load_more': 'Tải thêm kết quả',
    'found_all': 'Đã tìm thấy tất cả doanh nghiệp trong khu vực này.',
    'all_loaded': 'Tất cả doanh nghiệp đã có trong danh sách.',
    'api_error': 'Lỗi API: Key không hợp lệ hoặc đã hết hạn.',
    'no_results_maps': 'Không tìm thấy kết quả nào.',

    // Empty State
    'ready_explore': 'Sẵn sàng khám phá',
    'ready_desc': 'Nhập ngành nghề và địa điểm để bắt đầu. Hệ thống sẽ trích xuất dữ liệu thực tế ngay lập tức.',

    // Sidebar
    'start_new_search': 'Tìm kiếm mới',
    'current_session': 'PHIÊN HIỆN TẠI',
    'results_found': 'Kết quả',
    'view_layout': 'Giao diện',
    'sort_by': 'Sắp xếp',
    'sort_rating': 'Đánh giá cao nhất',
    'sort_reviews': 'Nhiều đánh giá nhất',
    'sort_name': 'Tên (A-Z)',
    'analysis': 'Phân tích',
    'excel': 'Xuất Excel',
    'search_history': 'Lịch sử tìm kiếm',
    'no_history': 'Chưa có lịch sử.',
    'delete_confirm': 'Bạn có chắc chắn muốn xóa toàn bộ lịch sử?',

    // Business Card
    'closed': 'ĐÓNG CỬA',
    'open': 'MỞ CỬA',
    'view_details': 'Xem chi tiết',
    'reviews_count': 'đánh giá',
    
    // Modal Details
    'rating': 'ĐÁNH GIÁ',
    'price': 'MỨC GIÁ',
    'service_options': 'Tùy chọn dịch vụ',
    'dine_in': 'Tại chỗ',
    'takeout': 'Mang đi',
    'delivery': 'Giao hàng',
    'curbside': 'Lấy bên lề',
    'open_maps': 'Mở bản đồ',
    'call': 'Gọi điện',
    'zalo': 'Chat Zalo',
    'visit_website': 'Xem Website',
    'opening_hours': 'Giờ mở cửa',
    'hours_na': 'Chưa có thông tin giờ',
    'representative': 'NGƯỜI ĐẠI DIỆN / CHỦ SỞ HỮU',
    
    // Analytics
    'market_intelligence': 'Thống kê tóm tắt',
    'analyzing_count': 'Đang phân tích',
    'businesses': 'doanh nghiệp',
    'total_found': 'TỔNG TÌM THẤY',
    'with_phone': 'CÓ SĐT',
    'with_website': 'CÓ WEBSITE',
    'avg_rating': 'ĐIỂM TB',
    'filter_analysis': 'Bộ lọc phân tích',
    'has_phone': 'Có số điện thoại',
    'has_website': 'Có Website',
    'min_rating': 'Điểm tối thiểu:',
    'all': 'Tất cả',
    'rating_distribution': 'Phân bổ đánh giá',

    // Progress
    'scanning': 'Đang quét dữ liệu...',
    'analyzing_density': 'Phân tích mật độ...',
    'extracting': 'Trích xuất dữ liệu...',
    'finalizing': 'Hoàn tất...',
  },
  en: {
    // Header & General
    'app_name': 'BizFinder',
    'app_subtitle': 'Intelligence',
    'menu': 'Menu',

    // Search Form
    'industry_label': 'INDUSTRY',
    'location_label': 'LOCATION',
    'industry_placeholder': 'e.g. Coffee Shop, Spa, Clinic',
    'location_placeholder': 'e.g. District 1, Ho Chi Minh City',
    'start_search': 'Start Search',
    'searching': 'Searching...',
    'loading_deep_data': 'Loading Deep Data...',
    'load_more': 'Load More Results',
    'found_all': 'Found all available businesses in this specific area.',
    'all_loaded': 'All businesses found are already in your list.',
    'api_error': 'API Key Error: Key is invalid or expired.',
    'no_results_maps': 'No results found.',

    // Empty State
    'ready_explore': 'Ready to explore',
    'ready_desc': 'Enter a business type and location to start. The system will extract real-time data instantly.',

    // Sidebar
    'start_new_search': 'New Search',
    'current_session': 'CURRENT SESSION',
    'results_found': 'Results Found',
    'view_layout': 'View Layout',
    'sort_by': 'Sort By',
    'sort_rating': 'Highest Rated',
    'sort_reviews': 'Most Reviewed',
    'sort_name': 'Name (A-Z)',
    'analysis': 'Analysis',
    'excel': 'Excel',
    'search_history': 'Search History',
    'no_history': 'No history saved yet.',
    'delete_confirm': 'Are you sure you want to clear all search history?',

    // Business Card
    'closed': 'CLOSED',
    'open': 'OPEN',
    'view_details': 'View Details',
    'reviews_count': 'reviews',

    // Modal Details
    'rating': 'RATING',
    'price': 'PRICE',
    'service_options': 'Service Options',
    'dine_in': 'Dine-in',
    'takeout': 'Takeout',
    'delivery': 'Delivery',
    'curbside': 'Curbside',
    'open_maps': 'Open Map',
    'call': 'Call',
    'zalo': 'Zalo',
    'visit_website': 'Visit Website',
    'opening_hours': 'Opening Hours',
    'hours_na': 'Hours not available',
    'representative': 'REPRESENTATIVE / OWNER',

    // Analytics
    'market_intelligence': 'Market Intelligence',
    'analyzing_count': 'Analyzing',
    'businesses': 'businesses',
    'total_found': 'TOTAL FOUND',
    'with_phone': 'WITH PHONE',
    'with_website': 'WITH WEBSITE',
    'avg_rating': 'AVG RATING',
    'filter_analysis': 'Filter Analysis',
    'has_phone': 'Has Phone Number',
    'has_website': 'Has Website',
    'min_rating': 'Min Rating:',
    'all': 'All',
    'rating_distribution': 'Rating Distribution',

    // Progress
    'scanning': 'Scanning data...',
    'analyzing_density': 'Analyzing density...',
    'extracting': 'Extracting metadata...',
    'finalizing': 'Finalizing results...',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bizfinder_lang');
      return (saved === 'en' || saved === 'vi') ? saved : 'vi'; // Default to VI
    }
    return 'vi';
  });

  useEffect(() => {
    localStorage.setItem('bizfinder_lang', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};