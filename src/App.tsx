import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_MOVIES, getUniquePlatforms, getUniqueGenres } from './data';
import { MovieCard } from './components/MovieCard';
import { LanguageCode, ReleaseType, Platform, LANGUAGE_MAP, Movie } from './types';
import { Menu, X, Loader2 } from 'lucide-react';

type TimeView = 'Current Month' | 'Upcoming';
type SortOption = 'date-desc' | 'date-asc' | 'alpha' | 'rating';

export default function App() {
  const [activeTab, setActiveTab] = useState<ReleaseType>('OTT');
  const [timeView, setTimeView] = useState<TimeView>('Current Month');
  
  const [selectedLanguages, setSelectedLanguages] = useState<Set<LanguageCode>>(
    new Set(Object.keys(LANGUAGE_MAP) as LanguageCode[])
  );
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<Platform>>(new Set());
  const [selectedGenres, setSelectedGenres] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial data fetch
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const allPlatforms = useMemo(() => getUniquePlatforms(), []);
  const allGenres = useMemo(() => getUniqueGenres(), []);

  const toggleLanguage = (lang: LanguageCode) => {
    const newSet = new Set(selectedLanguages);
    if (newSet.has(lang)) {
      newSet.delete(lang);
    } else {
      newSet.add(lang);
    }
    setSelectedLanguages(newSet);
  };

  const togglePlatform = (platform: Platform) => {
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
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  const formatDateWindow = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const filteredMovies = useMemo(() => {
    return MOCK_MOVIES.filter(movie => {
      // 1. Filter by Tab (Release Type)
      if (movie.releaseType !== activeTab) return false;

      // 2. Parse movie release date
      const [year, month, day] = movie.releaseDate.split('-').map(Number);
      const releaseDate = new Date(year, month - 1, day);

      // 3. Filter by Time View
      if (timeView === 'Current Month') {
        // Must be in [today - 30, today] AND status = Released
        if (movie.status !== 'Released') return false;
        if (releaseDate < thirtyDaysAgo || releaseDate > today) return false;
      } else {
        // Upcoming: release_date > today
        if (releaseDate <= today) return false;
      }

      // 4. Filters (Language, Platform, Genre)
      if (!selectedLanguages.has(movie.language)) return false;
      
      if (selectedPlatforms.size > 0 && !selectedPlatforms.has(movie.platform)) return false;
      
      if (selectedGenres.size > 0) {
        const hasMatchingGenre = movie.genres.some(g => selectedGenres.has(g));
        if (!hasMatchingGenre) return false;
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
  }, [activeTab, timeView, selectedLanguages, selectedPlatforms, selectedGenres, sortBy, thirtyDaysAgo, today]);

  return (
    <div className="h-screen w-full bg-[#0A0A0C] text-slate-200 flex flex-col lg:flex-row overflow-hidden font-sans selection:bg-indigo-500/30">
      
      {/* Mobile Header */}
      <div className="lg:hidden p-4 border-b border-white/5 bg-[#0F0F12] flex items-center justify-between shrink-0">
        <h1 className="text-xl font-serif italic text-white tracking-tight">StreamTrack</h1>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-300 p-1">
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Filters */}
      <aside className={`lg:w-64 shrink-0 border-r border-white/10 bg-[#0F0F12] flex flex-col absolute lg:relative z-40 inset-y-0 left-0 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} w-64`}>
        
        <div className="p-6 border-b border-white/5 hidden lg:block shrink-0">
          <h1 className="text-2xl font-serif italic text-white tracking-tight">StreamTrack</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mt-1">OTT & Streaming Tracker</p>
        </div>
        
        <div className="flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar">
          {/* Languages */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-4">Languages</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(LANGUAGE_MAP) as [LanguageCode, string][]).map(([code, name]) => (
                <label key={code} className="flex items-center gap-2 cursor-pointer group bg-[#16161D] border border-white/5 rounded-md px-3 py-2 hover:bg-[#1A1A24] transition-colors">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={selectedLanguages.has(code)}
                    onChange={() => toggleLanguage(code)}
                  />
                  <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${selectedLanguages.has(code) ? 'bg-amber-400 border-amber-400' : 'border-white/20 bg-white/5'}`}>
                    <svg className={`w-3 h-3 text-black pointer-events-none ${selectedLanguages.has(code) ? 'block' : 'hidden'}`} viewBox="0 0 14 14" fill="none">
                      <path d="M3 8L6 11L11 3.5" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-white uppercase">{code}</span>
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
                if (platform === 'Netflix') baseColor = isActive ? 'bg-red-950/60 text-red-500 border-red-900/50' : 'bg-red-950/20 text-red-500/50 border-red-900/30';
                else if (platform === 'Prime Video') baseColor = isActive ? 'bg-blue-950/80 text-blue-400 border-blue-900/50' : 'bg-blue-950/30 text-blue-400/50 border-blue-900/30';
                else if (platform === 'Aha') baseColor = isActive ? 'bg-orange-950/60 text-orange-500 border-orange-900/50' : 'bg-orange-950/20 text-orange-500/50 border-orange-900/30';
                else if (platform === 'ZEE5') baseColor = isActive ? 'bg-teal-950/60 text-teal-400 border-teal-900/50' : 'bg-teal-950/20 text-teal-400/50 border-teal-900/30';
                else baseColor = isActive ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-white/5 text-slate-400 border-white/10';

                let platformLabel = platform.toUpperCase();
                if (platformLabel === 'PRIME VIDEO') platformLabel = 'PRIME';

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

        <div className="p-6 bg-black/20 border-t border-white/5 shrink-0 hidden lg:block">
          <div className="text-[10px] text-slate-500">Rolling 30-Day Window:</div>
          <div className="text-xs font-medium text-slate-300 mt-1">
            {formatDateWindow(thirtyDaysAgo)} — {formatDateWindow(today)}
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
          
          {/* Tabs */}
          <div className="flex gap-6 sm:gap-8 overflow-x-auto no-scrollbar shrink-0">
            {(['OTT', 'Streaming'] as ReleaseType[]).map(type => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`font-medium pb-1 whitespace-nowrap transition-colors ${
                  activeTab === type
                    ? 'text-white border-b-2 border-indigo-500'
                    : 'text-slate-500 border-b-2 border-transparent hover:text-slate-300'
                }`}
              >
                {type === 'OTT' ? 'OTT Releases' : 'Streaming'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
            {/* Sub-tabs */}
            <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 shrink-0">
              {(['Current Month', 'Upcoming'] as TimeView[]).map(view => (
                <button
                  key={view}
                  onClick={() => setTimeView(view)}
                  className={`px-3 sm:px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                    timeView === view
                      ? 'bg-white/10 text-white shadow-lg'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {view === 'Current Month' ? 'Current Month' : 'Upcoming'}
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
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                 <span className="text-slate-500 font-serif italic text-2xl">?</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">No matches found</h3>
              <p className="text-[11px] text-slate-400 max-w-xs mb-4">
                Try adjusting your language, platform, or genre filters to find more releases.
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
    </div>
  );
}

