import { Movie, LanguageCode, Platform } from './types';

// Helper to generate dynamic dates relative to today so the prototype always works
const getOffsetDate = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export const MOCK_MOVIES: Movie[] = [
  // MALAYALAM
  {
    id: 'm1',
    title: 'Aavesham',
    language: 'ml',
    releaseType: 'Streaming',
    platform: 'Prime Video',
    releaseDate: getOffsetDate(-15),
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=400&h=600',
    genres: ['Action', 'Comedy'],
    synopsis: 'Three college students seek the help of a local gangster to exact revenge on their seniors.',
    rating: 8.2,
    status: 'Released'
  },
  {
    id: 'm2',
    title: 'Manjummel Boys',
    language: 'ml',
    releaseType: 'Streaming',
    platform: 'Disney+ Hotstar',
    releaseDate: getOffsetDate(-5),
    posterUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=400&h=600',
    genres: ['Survival', 'Thriller'],
    synopsis: 'A group of friends experience a life-changing event while vacationing at Guna Caves.',
    rating: 8.5,
    status: 'Released'
  },
  {
    id: 'm3',
    title: 'Bramayugam',
    language: 'ml',
    releaseType: 'OTT',
    platform: 'SonyLIV',
    releaseDate: getOffsetDate(10),
    posterUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=400&h=600',
    genres: ['Horror', 'Mystery'],
    synopsis: 'A folklore horror film set in the dark ages of Kerala.',
    status: 'Upcoming'
  },

  // TAMIL
  {
    id: 't1',
    title: 'Leo',
    language: 'ta',
    releaseType: 'Streaming',
    platform: 'Netflix',
    releaseDate: getOffsetDate(-25),
    posterUrl: 'https://images.unsplash.com/photo-1616530940355-351fabd9524b?auto=format&fit=crop&q=80&w=400&h=600',
    genres: ['Action', 'Thriller'],
    synopsis: 'A cafe owner becomes a local hero, drawing the attention of a drug cartel who think he was once part of them.',
    rating: 7.8,
    status: 'Released'
  },
  {
    id: 't2',
    title: 'Maharaja',
    language: 'ta',
    releaseType: 'OTT',
    platform: 'Netflix',
    releaseDate: getOffsetDate(-2),
    posterUrl: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=400&h=600',
    genres: ['Drama', 'Revenge'],
    synopsis: 'A barber seeks revenge after his house is burgled and a crucial item is stolen.',
    rating: 8.6,
    status: 'Released'
  },
  {
    id: 't3',
    title: 'Kanguva',
    language: 'ta',
    releaseType: 'Streaming',
    platform: 'Prime Video',
    releaseDate: getOffsetDate(15),
    posterUrl: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&q=80&w=400&h=600',
    genres: ['Fantasy', 'Action'],
    synopsis: 'A warrior from the past and a modern-day researcher share a mysterious connection.',
    status: 'Upcoming'
  },

  // TELUGU
  {
    id: 'te1',
    title: 'Kalki 2898 AD',
    language: 'te',
    releaseType: 'Streaming',
    platform: 'Prime Video',
    releaseDate: getOffsetDate(-12),
    posterUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=400&h=600',
    genres: ['Sci-Fi', 'Mythology'],
    synopsis: 'A modern avatar of Vishnu descends to protect the world from evil forces in a dystopian future.',
    rating: 8.0,
    status: 'Released'
  },
  {
    id: 'te2',
    title: 'Family Star',
    language: 'te',
    releaseType: 'Streaming',
    platform: 'Prime Video',
    releaseDate: getOffsetDate(-28),
    posterUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=400&h=600',
    genres: ['Family', 'Drama'],
    synopsis: 'A middle-class architect goes to great lengths to protect his family.',
    rating: 6.5,
    status: 'Released'
  },
  {
    id: 'te3',
    title: 'Pushpa 2: The Rule',
    language: 'te',
    releaseType: 'Streaming',
    platform: 'Netflix',
    releaseDate: getOffsetDate(40), // > 30 days ahead
    posterUrl: 'https://images.unsplash.com/photo-1560109947-543149eceb16?auto=format&fit=crop&q=80&w=400&h=600',
    genres: ['Action', 'Crime'],
    synopsis: 'The clash between Pushpa Raj and Bhanwar Singh continues.',
    status: 'Upcoming'
  },
  {
    id: 'te4',
    title: 'Guntur Kaaram',
    language: 'te',
    releaseType: 'OTT',
    platform: 'Netflix',
    releaseDate: getOffsetDate(8),
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=400&h=600',
    genres: ['Action', 'Drama'],
    synopsis: 'A local don distances himself from his family until they are threatened.',
    status: 'Upcoming'
  },

  // KANNADA
  {
    id: 'k1',
    title: 'Sapta Sagaradaache Ello',
    language: 'kn',
    releaseType: 'Streaming',
    platform: 'Prime Video',
    releaseDate: getOffsetDate(-20),
    posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400&h=600',
    genres: ['Romance', 'Drama'],
    synopsis: 'An intense love story between two individuals navigating a complex web of circumstances.',
    rating: 8.4,
    status: 'Released'
  },
  {
    id: 'k2',
    title: 'Ghost',
    language: 'kn',
    releaseType: 'OTT',
    platform: 'ZEE5',
    releaseDate: getOffsetDate(5),
    posterUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=400&h=600',
    genres: ['Action', 'Heist'],
    synopsis: 'A mysterious man hijacks a prison, demanding justice.',
    status: 'Upcoming'
  },

  // HINDI
  {
    id: 'h1',
    title: 'Fighter',
    language: 'hi',
    releaseType: 'Streaming',
    platform: 'Netflix',
    releaseDate: getOffsetDate(-18),
    posterUrl: 'https://images.unsplash.com/photo-1540810166299-6577319e7db7?auto=format&fit=crop&q=80&w=400&h=600',
    genres: ['Action', 'Thriller'],
    synopsis: 'Top IAF aviators come together in the face of imminent danger.',
    rating: 7.2,
    status: 'Released'
  },
  {
    id: 'h2',
    title: 'Heeramandi',
    language: 'hi',
    releaseType: 'OTT',
    platform: 'Netflix',
    releaseDate: getOffsetDate(-8),
    posterUrl: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=400&h=600',
    genres: ['Drama', 'History'],
    synopsis: 'The lives of courtesans in pre-independence India.',
    rating: 7.5,
    status: 'Released'
  },
  {
    id: 'h3',
    title: 'Singham Again',
    language: 'hi',
    releaseType: 'Streaming',
    platform: 'Prime Video',
    releaseDate: getOffsetDate(20),
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=400&h=600',
    genres: ['Action', 'Cop Drama'],
    synopsis: 'Bajirao Singham returns for his most dangerous mission yet.',
    status: 'Upcoming'
  },

  // ENGLISH
  {
    id: 'e1',
    title: 'Dune: Part Two',
    language: 'en',
    releaseType: 'Streaming',
    platform: 'JioCinema',
    releaseDate: getOffsetDate(-29),
    posterUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=400&h=600',
    genres: ['Sci-Fi', 'Adventure'],
    synopsis: 'Paul Atreides unites with Chani and the Fremen while on a warpath of revenge.',
    rating: 8.8,
    status: 'Released'
  },
  {
    id: 'e2',
    title: 'The Fall Guy',
    language: 'en',
    releaseType: 'Streaming',
    platform: 'Prime Video',
    releaseDate: getOffsetDate(-10),
    posterUrl: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&q=80&w=400&h=600',
    genres: ['Action', 'Comedy'],
    synopsis: 'A stuntman must track down a missing movie star and win back the love of his life.',
    rating: 7.0,
    status: 'Released'
  },
  {
    id: 'e3',
    title: 'Atlas',
    language: 'en',
    releaseType: 'OTT',
    platform: 'Netflix',
    releaseDate: getOffsetDate(-2),
    posterUrl: 'https://images.unsplash.com/photo-1616530940355-351fabd9524b?auto=format&fit=crop&q=80&w=400&h=600',
    genres: ['Sci-Fi', 'Action'],
    synopsis: 'A data analyst with a deep distrust of AI finds it may be her only hope when a mission goes awry.',
    rating: 5.8,
    status: 'Released'
  },
  {
    id: 'e4',
    title: 'Deadpool & Wolverine',
    language: 'en',
    releaseType: 'Streaming',
    platform: 'Disney+ Hotstar',
    releaseDate: getOffsetDate(12),
    posterUrl: 'https://images.unsplash.com/photo-1560109947-543149eceb16?auto=format&fit=crop&q=80&w=400&h=600',
    genres: ['Action', 'Comedy', 'Superhero'],
    synopsis: 'Deadpool teams up with Wolverine on a mission that will change the history of the MCU.',
    status: 'Upcoming'
  }
];

export const getUniquePlatforms = (): Platform[] => {
  return Array.from(new Set(MOCK_MOVIES.map(m => m.platform))).sort();
};

export const getUniqueGenres = (): string[] => {
  const genres = new Set<string>();
  MOCK_MOVIES.forEach(m => m.genres.forEach(g => genres.add(g)));
  return Array.from(genres).sort();
};
