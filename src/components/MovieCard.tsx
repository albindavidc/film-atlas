import React from 'react';
import { Movie, LANGUAGE_MAP } from '../types';
import { Star } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const getPlatformTextColor = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('netflix')) return 'text-red-500';
    if (p.includes('prime')) return 'text-blue-400';
    if (p.includes('hotstar')) return 'text-indigo-400';
    if (p.includes('sonyliv')) return 'text-amber-400';
    if (p.includes('zee5')) return 'text-teal-400';
    if (p.includes('aha')) return 'text-orange-500';
    if (p.includes('jio')) return 'text-pink-500';
    return 'text-slate-400';
  };

  const getLangColor = (lang: string) => {
    switch(lang) {
      case 'ml': return 'bg-indigo-600';
      case 'hi': return 'bg-rose-600';
      case 'ta': return 'bg-blue-600';
      case 'te': return 'bg-amber-600';
      case 'kn': return 'bg-emerald-600';
      case 'en': return 'bg-slate-600';
      default: return 'bg-indigo-600';
    }
  };

  const formatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  return (
    <div className="group relative aspect-[2/3] bg-slate-800 rounded-lg overflow-hidden border border-white/5 transition-transform hover:scale-[1.02]">
      {/* Poster */}
      <img
        src={movie.posterUrl}
        alt={movie.title}
        className="w-full h-full object-cover absolute inset-0"
        loading="lazy"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-t from-black via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity"></div>
      
      {/* Top Left Badges */}
      <div className="absolute top-3 left-3 flex gap-1 z-10 flex-wrap max-w-[70%]">
        <span className={`px-1.5 py-0.5 ${getLangColor(movie.language)} text-white text-[9px] font-bold rounded uppercase shadow-sm shrink-0`}>
          {movie.language}
        </span>
        {movie.mediaType === 'tv' && (
          <span className="px-1.5 py-0.5 bg-purple-500/80 backdrop-blur-md border border-white/10 text-white text-[9px] font-bold rounded uppercase shadow-sm shrink-0 tracking-wider">
            Series
          </span>
        )}
        {movie.rating ? (
          <span className="px-1.5 py-0.5 bg-slate-900/80 backdrop-blur-md border border-white/10 text-white text-[9px] font-bold rounded uppercase flex items-center shadow-sm shrink-0">
            <Star className="w-2.5 h-2.5 mr-0.5 text-yellow-400 fill-yellow-400" />
            {movie.rating.toFixed(1)}
          </span>
        ) : null}
      </div>

      {/* Top Right Badges (Certification) */}
      {movie.certification && (
        <div className="absolute top-3 right-3 z-10">
          <span className="px-1.5 py-0.5 bg-black/60 backdrop-blur-md border border-white/20 text-white text-[9px] font-bold rounded uppercase shadow-sm tracking-wider">
            {movie.certification}
          </span>
        </div>
      )}

      {/* Bottom Info */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <p className={`text-[10px] ${getPlatformTextColor(movie.platform)} font-black uppercase mb-1 drop-shadow-md tracking-wider`}>
          {movie.platform}
        </p>
        <h3 className="text-sm font-semibold text-white leading-tight drop-shadow-lg mb-1 line-clamp-2">
          {movie.title}
        </h3>
        <div className="flex justify-between items-center text-[10px] text-slate-300 drop-shadow-md mt-1">
          <span>{formatDate(movie.releaseDate)}</span>
          <span className={movie.status === 'Upcoming' ? 'text-amber-400 font-medium' : 'text-slate-400'}>
            {movie.status}
          </span>
        </div>
      </div>
    </div>
  );
};

