export type LanguageCode = 'ml' | 'ta' | 'te' | 'kn' | 'hi' | 'en';
export type ReleaseType = 'OTT' | 'In Theaters';
export type Status = 'Released' | 'Upcoming';
export type Platform = 'Netflix' | 'Prime Video' | 'Disney+ Hotstar' | 'SonyLIV' | 'ZEE5' | 'Aha' | 'Sun NXT' | 'JioCinema' | 'Apple TV+';

export const LANGUAGE_MAP: Record<LanguageCode, string> = {
  ml: 'Malayalam',
  ta: 'Tamil',
  te: 'Telugu',
  kn: 'Kannada',
  hi: 'Hindi',
  en: 'English',
};

export interface Movie {
  id: string;
  title: string;
  transliteratedTitle?: string;
  language: LanguageCode;
  releaseType: ReleaseType;
  platform: Platform | string;
  releaseDate: string; // YYYY-MM-DD
  posterUrl: string;
  genres: string[];
  synopsis: string;
  rating?: number; // Out of 10
  status: Status;
  certification?: string; // e.g., U/A 13+, A
  mediaType?: 'movie' | 'tv';
  trailerKey?: string;
}
