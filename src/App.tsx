import React, { useState, useMemo, useEffect } from 'react';
import { MovieCard } from './components/MovieCard';
import { LanguageCode, ReleaseType, Platform, LANGUAGE_MAP, Movie } from './types';
import { Menu, X, Loader2, Calendar, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type TimeView = 'Current Month' | 'Upcoming' | 'Custom';
type SortOption = 'date-desc' | 'date-asc' | 'alpha' | 'rating';

const getInitialDates = () => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const formatDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dStr = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dStr}`;
  };
  
  return { start: formatDate(firstDay), end: formatDate(lastDay), firstDay, lastDay };
};

const INITIAL_DATES = getInitialDates();

import { fetchMovies } from './lib/api';

export default function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [activeTab, setActiveTab] = useState<ReleaseType>('In Theaters');
  const [timeView, setTimeView] = useState<TimeView>('Current Month');
  
  const [selectedLanguages, setSelectedLanguages] = useState<Set<LanguageCode>>(
    new Set(Object.keys(LANGUAGE_MAP) as LanguageCode[])
  );
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<Platform | string>>(new Set());
  const [selectedGenres, setSelectedGenres] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState<string>(INITIAL_DATES.start);
  const [endDate, setEndDate] = useState<string>(INITIAL_DATES.end);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch from the TMDB API directly on the client
  useEffect(() => {
    fetchMovies()
      .then(data => {
        setMovies(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const allPlatforms = useMemo(() => Array.from(new Set(movies.map(m => m.platform))).sort(), [movies]);
  const allGenres = useMemo(() => {
     const g = new Set<string>();
     movies.forEach(m => m.genres.forEach(genre => g.add(genre)));
     return Array.from(g).sort();
  }, [movies]);

  const toggleLanguage = (lang: LanguageCode) => {
    const newSet = new Set(selectedLanguages);
    if (newSet.has(lang)) {
      newSet.delete(lang);
    } else {
      newSet.add(lang);
    }
    setSelectedLanguages(newSet);
  };

  const togglePlatform = (platform: Platform | string) => {
    const newSet = new Set(selectedPlatforms);
    if (newSet.has(platform)) {
      newSet.delete(platform);
    } else {
      newSet.add(platform);
    }
    setSelectedPlatforms(newSet);
  };

  const toggleGenre = (genre: string) => {
    const newSet = new Set(selectedGenres);
    if (newSet.has(genre)) {
      newSet.delete(genre);
    } else {
      newSet.add(genre);
    }
    setSelectedGenres(newSet);
  };

  // Determine the rolling 30-day window
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const currentMonthStart = INITIAL_DATES.firstDay;
  const currentMonthEnd = INITIAL_DATES.lastDay;
  
  const formatDateWindow = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const filteredMovies = useMemo(() => {
    return movies.filter(movie => {
      // 1. Filter by Tab (Release Type)
      if (movie.releaseType !== activeTab) return false;

      // 2. Parse movie release date
      const [year, month, day] = movie.releaseDate.split('-').map(Number);
      const releaseDate = new Date(year, month - 1, day);

      // 3. Filter by Time View
      if (timeView === 'Current Month') {
        if (movie.status !== 'Released') return false;
        // Current calendar month
        if (releaseDate < currentMonthStart || releaseDate > currentMonthEnd) return false;
      } else if (timeView === 'Custom') {
        if (startDate && releaseDate < new Date(startDate)) return false;
        if (endDate && releaseDate > new Date(endDate)) return false;
      } else {
        if (movie.status !== 'Upcoming') return false;
      }

      // 4. Filters (Language, Platform, Genre)
      if (!selectedLanguages.has(movie.language)) return false;
      
      if (selectedPlatforms.size > 0 && !selectedPlatforms.has(movie.platform)) return false;
      
      if (selectedGenres.size > 0) {
        const hasMatchingGenre = movie.genres.some(g => selectedGenres.has(g));
        if (!hasMatchingGenre) return false;
      }

      // 5. Search filter
      if (searchQuery.trim() !== '') {
        const lowerQuery = searchQuery.toLowerCase();
        if (!movie.title.toLowerCase().includes(lowerQuery) &&
            !movie.synopsis.toLowerCase().includes(lowerQuery)) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // 5. Sort logic
      if (timeView === 'Upcoming') {
        // Force ascending for upcoming as per requirements
        return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
      }

      switch (sortBy) {
        case 'date-desc':
          return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
        case 'date-asc':
          return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
        case 'alpha':
          return a.title.localeCompare(b.title);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });
  }, [movies, activeTab, timeView, selectedLanguages, selectedPlatforms, selectedGenres, sortBy, currentMonthStart, currentMonthEnd, searchQuery]);

  return (
    <div className="h-screen w-full bg-[#0A0A0C] text-slate-200 flex flex-col lg:flex-row overflow-hidden font-sans selection:bg-indigo-500/30">
      
      {/* Mobile Header */}
      <div className="lg:hidden p-4 border-b border-white/5 bg-[#0F0F12] flex items-center justify-between shrink-0">
        <h1 className="text-xl font-serif italic text-white tracking-tight">Film Atlas</h1>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-300 p-1">
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Filters */}
      <aside className={`shrink-0 border-r border-white/10 bg-[#0F0F12] flex flex-col absolute lg:relative z-40 inset-y-0 left-0 transform transition-all duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${isDesktopSidebarCollapsed ? 'lg:w-0 lg:overflow-hidden lg:border-r-0 lg:opacity-0' : 'lg:w-64 w-64 lg:opacity-100'}`}>
        
        <div className="p-6 border-b border-white/5 hidden lg:block shrink-0">
          <h1 className="text-2xl font-serif italic text-white tracking-tight">Film Atlas</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mt-1">OTT & Theatrical Tracker</p>
        </div>
        
        <div className="flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar">
          {/* Languages */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Languages</label>
              <button
                onClick={() => {
                  if (selectedLanguages.size === 0) {
                    setSelectedLanguages(new Set(Object.keys(LANGUAGE_MAP) as LanguageCode[]));
                  } else {
                    setSelectedLanguages(new Set());
                  }
                }}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium uppercase tracking-wider transition-colors"
              >
                {selectedLanguages.size === 0 ? 'Select All' : 'Clear All'}
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              {(Object.entries(LANGUAGE_MAP) as [LanguageCode, string][]).map(([code, name]) => (
                <label key={code} className="flex items-center gap-3 cursor-pointer group bg-[#16161D] border border-white/5 rounded-md px-3 py-2 hover:bg-[#1A1A24] transition-colors">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={selectedLanguages.has(code)}
                    onChange={() => toggleLanguage(code as LanguageCode)}
                  />
                  <div className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 transition-colors ${selectedLanguages.has(code) ? 'bg-amber-400 border-amber-400' : 'border-white/20 bg-white/5'}`}>
                    <svg className={`w-3 h-3 text-black pointer-events-none ${selectedLanguages.has(code) ? 'block' : 'hidden'}`} viewBox="0 0 14 14" fill="none">
                      <path d="M3 8L6 11L11 3.5" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">{name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Platforms */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-4">Platform</label>
            <div className="flex flex-wrap gap-2">
              {allPlatforms.map(platform => {
                const isActive = selectedPlatforms.has(platform);
                
                let baseColor = 'bg-white/5 text-slate-400 border-white/10';
                const p = platform.toLowerCase();
                if (p.includes('netflix')) baseColor = isActive ? 'bg-red-950/60 text-red-500 border-red-900/50' : 'bg-red-950/20 text-red-500/50 border-red-900/30';
                else if (p.includes('prime')) baseColor = isActive ? 'bg-blue-950/80 text-blue-400 border-blue-900/50' : 'bg-blue-950/30 text-blue-400/50 border-blue-900/30';
                else if (p.includes('aha')) baseColor = isActive ? 'bg-orange-950/60 text-orange-500 border-orange-900/50' : 'bg-orange-950/20 text-orange-500/50 border-orange-900/30';
                else if (p.includes('zee5')) baseColor = isActive ? 'bg-teal-950/60 text-teal-400 border-teal-900/50' : 'bg-teal-950/20 text-teal-400/50 border-teal-900/30';
                else if (p.includes('hotstar')) baseColor = isActive ? 'bg-indigo-950/60 text-indigo-400 border-indigo-900/50' : 'bg-indigo-950/20 text-indigo-400/50 border-indigo-900/30';
                else baseColor = isActive ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-white/5 text-slate-400 border-white/10';

                let platformLabel = platform.toUpperCase();
                if (platformLabel === 'PRIME VIDEO') platformLabel = 'PRIME';
                if (platformLabel === 'DISNEY+ HOTSTAR') platformLabel = 'HOTSTAR';

                return (
                  <button
                    key={platform}
                    onClick={() => togglePlatform(platform)}
                    className={`px-3 py-1.5 rounded flex items-center justify-center text-[10px] font-black tracking-wider transition-colors border ${baseColor} hover:brightness-125`}
                  >
                    {platformLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Genres */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-4">Genres</label>
            <div className="flex flex-wrap gap-2">
              {allGenres.map(genre => {
                const isActive = selectedGenres.has(genre);
                return (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={`px-2 py-1 rounded text-[10px] transition-colors ${
                      isActive 
                        ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-300'
                        : 'bg-white/5 border border-white/10 text-slate-400 hover:text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className={`p-5 bg-black/20 border-t border-white/5 shrink-0 hidden lg:block transition-opacity duration-300 ${isDesktopSidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}>
          <div className="flex items-center justify-between mb-3">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Release Window</label>
            {timeView === 'Custom' && (
              <button onClick={() => { setTimeView('Current Month'); setStartDate(INITIAL_DATES.start); setEndDate(INITIAL_DATES.end); }} className="text-[9px] text-indigo-400 hover:text-indigo-300 uppercase tracking-wider font-bold transition-colors">Reset</button>
            )}
          </div>
          
          <div className="space-y-3">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Calendar className="w-3.5 h-3.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              </div>
              <input 
                type="month" 
                value={startDate.substring(0, 7)}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) return;
                  const [y, m] = val.split('-');
                  const lastDay = new Date(Number(y), Number(m), 0);
                  const pad = (n: number) => String(n).padStart(2, '0');
                  setStartDate(`${y}-${pad(Number(m))}-01`);
                  setEndDate(`${y}-${pad(Number(m))}-${pad(lastDay.getDate())}`);
                  setTimeView('Custom');
                }}
                className="w-full bg-[#16161D] border border-white/10 rounded-md pl-9 pr-3 py-2 text-xs text-white [color-scheme:dark] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all cursor-pointer hover:bg-[#1A1A24] font-medium tracking-wide"
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-[#0A0A0C] min-w-0 overflow-hidden relative z-0">
        
        {/* Header */}
        <header className="p-4 sm:p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 bg-[#0A0A0C]">
          
          <div className="flex items-center gap-4">
            {/* Desktop Sidebar Toggle */}
            <button 
              onClick={() => setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)} 
              className="hidden lg:flex p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-md transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Tabs */}
            <div className="flex gap-6 sm:gap-8 overflow-x-auto no-scrollbar shrink-0">
              {(['OTT', 'In Theaters'] as ReleaseType[]).map(type => (
                <button
                  key={type}
                  onClick={() => setActiveTab(type)}
                  className={`font-medium pb-1 whitespace-nowrap transition-colors ${
                    activeTab === type
                      ? 'text-white border-b-2 border-indigo-500'
                      : 'text-slate-500 border-b-2 border-transparent hover:text-slate-300'
                  }`}
                >
                  {type === 'OTT' ? 'OTT Releases' : 'In Theaters'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
            
            {/* Search Bar */}
            <div className="relative group flex-1 sm:flex-none">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                <Search className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                placeholder="Search movies..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 bg-[#16161D] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
              />
            </div>

            {/* Sub-tabs */}
            <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 shrink-0">
              {(['Current Month', 'Upcoming', 'Custom'] as TimeView[]).map(view => (
                <button
                  key={view}
                  onClick={() => {
                    setTimeView(view);
                    if (view === 'Current Month') {
                      setStartDate(INITIAL_DATES.start);
                      setEndDate(INITIAL_DATES.end);
                    }
                  }}
                  className={`px-3 sm:px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                    timeView === view
                      ? 'bg-white/10 text-white shadow-lg'
                      : 'text-slate-400 hover:text-slate-200'
                  } ${view === 'Custom' ? 'hidden' : ''}`}
                >
                  {view}
                </button>
              ))}
            </div>
            
            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              disabled={timeView === 'Upcoming'}
              className="bg-white/5 border border-white/10 text-slate-300 text-xs rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 block px-2 py-1.5 outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="alpha">A-Z</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </header>

        {/* Content Grid */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Loading database...</p>
            </div>
          ) : filteredMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 content-start">
              {filteredMovies.map(movie => (
                <MovieCard key={movie.id} movie={movie} hidePlatform={activeTab === 'In Theaters'} onClick={(m) => setSelectedMovie(m)} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                 <span className="text-slate-500 font-serif italic text-2xl">?</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">No matches found</h3>
              <p className="text-[11px] text-slate-400 max-w-xs mb-4">
                Try adjusting your language, platform or genre filters to find more releases.
              </p>
              <button 
                onClick={() => {
                  setSelectedLanguages(new Set(Object.keys(LANGUAGE_MAP) as LanguageCode[]));
                  setSelectedPlatforms(new Set());
                  setSelectedGenres(new Set());
                }}
                className="px-3 py-1.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs rounded transition-colors hover:bg-indigo-500/30"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Trailer Modal */}
      <AnimatePresence>
        {selectedMovie && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedMovie(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedMovie(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors backdrop-blur-md"
              >
                <X className="w-5 h-5" />
              </button>
              
              {selectedMovie.trailerKey ? (
                <div className="relative aspect-video w-full bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedMovie.trailerKey}?autoplay=1&modestbranding=1&rel=0`}
                    title={`${selectedMovie.title} Trailer`}
                    className="absolute inset-0 w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center aspect-video w-full bg-slate-800 text-slate-400">
                  <p className="text-lg">Trailer not available</p>
                </div>
              )}
              
              <div className="p-6">
                <h2 className="text-xl font-semibold text-white mb-2">{selectedMovie.title}</h2>
                <p className="text-sm text-slate-400">{selectedMovie.synopsis}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

