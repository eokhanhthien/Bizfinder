export interface Review {
  author: string;
  rating: number;
  text: string;
  publishTime?: string;
}

export interface BusinessPhoto {
  url: string;
  author?: string;
}

export interface ServiceOptions {
  dineIn: boolean;
  delivery: boolean;
  takeout: boolean;
  curbsidePickup: boolean;
}

export interface Business {
  id: string;
  googleId?: string; // Internal Google ID
  name: string;
  address: string;
  rating?: number;
  reviewCount?: number;
  website?: string;
  phone?: string;
  internationalPhone?: string; // +84...
  businessType?: string;
  types?: string[]; // Detailed types array
  description?: string;
  googleMapsUri?: string;
  lat?: number;
  lng?: number;
  
  // New Rich Data fields
  businessStatus?: 'OPERATIONAL' | 'CLOSED_TEMPORARILY' | 'CLOSED_PERMANENTLY' | 'UNKNOWN';
  priceLevel?: string; // $, $$, $$$
  openingHours?: string[]; // Array of strings e.g. "Monday: 9AM-5PM"
  photos?: string[]; // Array of URLs
  reviews?: Review[];
  serviceOptions?: ServiceOptions;
  ownerName?: string; // Name of the business owner or representative
}

export interface SearchState {
  isSearching: boolean;
  error: string | null;
  data: Business[];
  hasSearched: boolean;
  progress?: {
    current: number;
    total: number;
    currentArea: string;
  };
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  industry: string;
  location: string;
  count: number;
  data: Business[];
}

export enum SortOption {
  RATING_DESC = 'RATING_DESC',
  REVIEWS_DESC = 'REVIEWS_DESC',
  NAME_ASC = 'NAME_ASC',
}