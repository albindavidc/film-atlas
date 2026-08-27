import { Movie } from '../types';

let cachedMovies: Movie[] = [];
let lastFetchTime = 0;

const getPlatformFallback = (id: number) => {
  const platforms = ['Netflix', 'Prime Video', 'Disney+ Hotstar', 'SonyLIV', 'ZEE5', 'Aha', 'JioCinema'];
  return platforms[id % platforms.length];
};

export async function fetchMovies(): Promise<Movie[]> {
  // Return cache if it's less than 5 minutes old
  if (cachedMovies.length > 0 && Date.now() - lastFetchTime < 300000) {
    return cachedMovies;
  }

  // IMPORTANT: Vite exposes variables prefixed with VITE_ or API_ to the client
  const token = import.meta.env.API_READ_ACCESS_TOKEN;
  
  if (!token) {
    throw new Error("TMDB API token not configured. Please set API_READ_ACCESS_TOKEN.");
  }

  const today = new Date();
  const currentYear = today.getFullYear();
  
  // Window: Jan 1st of current year -> End of Next Month
  const startOfYear = `${currentYear}-01-01`;
  const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 2, 0);
  const endOfNextMonth = nextMonthDate.toISOString().split('T')[0];

  const targetLanguages = ['ml', 'ta', 'te', 'kn', 'hi', 'en'];
  let allResults: any[] = [];
  
  await Promise.all(targetLanguages.map(async (lang) => {
    // 1. Fetch Top Movies
    const discoverUrl = `https://api.themoviedb.org/3/discover/movie?region=IN&with_original_language=${lang}&primary_release_date.gte=${startOfYear}&primary_release_date.lte=${endOfNextMonth}&sort_by=popularity.desc&page=1`;
    const discoverRes = await fetch(discoverUrl, {
      headers: { 'Authorization': `Bearer ${token}`, 'accept': 'application/json' }
    });
    
    if (discoverRes.ok) {
      const discoverData = await discoverRes.json();
      const movies = (discoverData.results || []).slice(0, 8).map((m: any) => ({ ...m, media_type: 'movie' }));
      allResults.push(...movies);
    }

    // 2. Fetch Top TV Shows
    const tvUrl = `https://api.themoviedb.org/3/discover/tv?with_original_language=${lang}&first_air_date.gte=${startOfYear}&first_air_date.lte=${endOfNextMonth}&sort_by=popularity.desc&page=1`;
    const tvRes = await fetch(tvUrl, {
      headers: { 'Authorization': `Bearer ${token}`, 'accept': 'application/json' }
    });
    
    if (tvRes.ok) {
      const tvData = await tvRes.json();
      const tvShows = (tvData.results || []).slice(0, 4).map((m: any) => ({ ...m, media_type: 'tv' }));
      allResults.push(...tvShows);
    }
  }));
  
  const results = allResults;

  const detailedMovies = await Promise.all(results.map(async (m: any) => {
    const appendStr = m.media_type === 'movie' ? 'release_dates,watch/providers' : 'content_ratings,watch/providers';
    const detailRes = await fetch(`https://api.themoviedb.org/3/${m.media_type}/${m.id}?append_to_response=${appendStr}`, { 
      headers: { 'Authorization': `Bearer ${token}`, 'accept': 'application/json' }
    });
    const data = await detailRes.json();
    return { ...data, media_type: m.media_type };
  }));

  const formattedMovies: Movie[] = detailedMovies.map((m: any) => {
    let certification = "U/A";
    if (m.media_type === 'movie') {
      const inRelease = m.release_dates?.results?.find((r: any) => r.iso_3166_1 === 'IN');
      if (inRelease && inRelease.release_dates?.length > 0) {
         const certs = inRelease.release_dates.map((d:any) => d.certification).filter((c:any) => c);
         if (certs.length > 0) certification = certs[certs.length - 1]; 
      } else {
         const usRelease = m.release_dates?.results?.find((r: any) => r.iso_3166_1 === 'US');
         if (usRelease && usRelease.release_dates?.length > 0) {
             const certs = usRelease.release_dates.map((d:any) => d.certification).filter((c:any) => c);
             if (certs.length > 0) certification = certs[0];
         }
      }
    } else {
      const inRating = m.content_ratings?.results?.find((r: any) => r.iso_3166_1 === 'IN');
      if (inRating && inRating.rating) {
         certification = inRating.rating;
      } else {
         const usRating = m.content_ratings?.results?.find((r: any) => r.iso_3166_1 === 'US');
         if (usRating && usRating.rating) certification = usRating.rating;
      }
    }
    if (!certification) certification = "U/A";

    let platform = getPlatformFallback(m.id);
    const inProviders = m.watch?.providers?.results?.IN?.flatrate;
    if (inProviders && inProviders.length > 0) {
       const pName = inProviders[0].provider_name;
       if (pName.includes('Netflix')) platform = 'Netflix';
       else if (pName.includes('Amazon') || pName.includes('Prime')) platform = 'Prime Video';
       else if (pName.includes('Hotstar')) platform = 'Disney+ Hotstar';
       else if (pName.includes('Sony')) platform = 'SonyLIV';
       else if (pName.includes('Zee5') || pName.includes('ZEE5')) platform = 'ZEE5';
       else if (pName.includes('Aha')) platform = 'Aha';
       else if (pName.includes('Jio')) platform = 'JioCinema';
       else platform = pName; 
     }

    let releaseType = "Streaming";
    if (m.media_type === 'movie') {
      const inRelease = m.release_dates?.results?.find((r: any) => r.iso_3166_1 === 'IN');
      const hasTheatrical = inRelease?.release_dates?.some((d:any) => d.type === 3);
      if (!hasTheatrical) releaseType = "OTT";
    } else {
      releaseType = "OTT";
    }

    const rDate = m.media_type === 'movie' ? m.release_date : m.first_air_date;
    const releaseDateObj = new Date(rDate || today);
    const status = releaseDateObj > today ? "Upcoming" : "Released";

    return {
      id: m.id.toString(),
      title: m.media_type === 'movie' ? m.title : m.name,
      language: m.original_language as any,
      releaseType: releaseType as any,
      platform: platform as any,
      releaseDate: rDate || today.toISOString().split('T')[0],
      posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400&h=600',
      genres: m.genres?.map((g:any) => g.name) || [],
      synopsis: m.overview || "No synopsis available.",
      rating: m.vote_average ? parseFloat(m.vote_average.toFixed(1)) : 0,
      status: status as any,
      certification,
      mediaType: m.media_type
    };
  });

  cachedMovies = formattedMovies;
  lastFetchTime = Date.now();
  return cachedMovies;
}
