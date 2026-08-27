import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ytSearch from 'yt-search';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const token = process.env.API_READ_ACCESS_TOKEN;
if (!token) {
  console.error("TMDB API token not configured.");
  process.exit(1);
}

const getPlatformFallback = (id) => {
  const platforms = ['Netflix', 'Prime Video', 'Disney+ Hotstar', 'SonyLIV', 'ZEE5', 'Aha', 'JioCinema'];
  return platforms[id % platforms.length];
};

const today = new Date();
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(today.getDate() - 30);
const thirtyDaysFuture = new Date();
thirtyDaysFuture.setDate(today.getDate() + 30);

const startDateStr = thirtyDaysAgo.toISOString().split('T')[0];
const todayStr = today.toISOString().split('T')[0];
const endDateStr = thirtyDaysFuture.toISOString().split('T')[0];

const targetLanguages = ['ml', 'ta', 'te', 'kn', 'hi', 'en'];
const dataDir = path.join(__dirname, '../src/data');

async function processMedia(type, urlSuffix, lang, outFileName) {
  // Fetch Recent
  const recentUrl = `https://api.themoviedb.org/3/discover/${type}?region=IN&with_original_language=${lang}&${urlSuffix}.gte=${startDateStr}&${urlSuffix}.lte=${todayStr}&sort_by=popularity.desc&page=1`;
  const recentRes = await fetch(recentUrl, {
    headers: { 'Authorization': `Bearer ${token}`, 'accept': 'application/json' }
  });
  
  // Fetch Upcoming
  const upcomingUrl = `https://api.themoviedb.org/3/discover/${type}?region=IN&with_original_language=${lang}&${urlSuffix}.gte=${todayStr}&${urlSuffix}.lte=${endDateStr}&sort_by=popularity.desc&page=1`;
  const upcomingRes = await fetch(upcomingUrl, {
    headers: { 'Authorization': `Bearer ${token}`, 'accept': 'application/json' }
  });
  
  if (!recentRes.ok || !upcomingRes.ok) {
    console.error(`Failed to fetch ${type} for ${lang}`);
    return;
  }
  
  const recentData = await recentRes.json();
  const upcomingData = await upcomingRes.json();
  
  const recentResults = (recentData.results || []).slice(0, 10);
  const upcomingResults = (upcomingData.results || []).slice(0, 10);
  
  // Merge and deduplicate by ID
  const allMap = new Map();
  for (const item of [...recentResults, ...upcomingResults]) {
    allMap.set(item.id, item);
  }
  const results = Array.from(allMap.values());
  
  // Fetch details
  const detailed = await Promise.all(results.map(async (m) => {
    const appendStr = type === 'movie' ? 'release_dates,watch/providers,videos' : 'content_ratings,watch/providers,videos';
    const detailRes = await fetch(`https://api.themoviedb.org/3/${type}/${m.id}?append_to_response=${appendStr}`, { 
      headers: { 'Authorization': `Bearer ${token}`, 'accept': 'application/json' }
    });
    const d = await detailRes.json();
    
    // Normalize format
    let certification = "U/A";
    if (type === 'movie') {
      const inRelease = d.release_dates?.results?.find((r) => r.iso_3166_1 === 'IN');
      if (inRelease && inRelease.release_dates?.length > 0) {
         const certs = inRelease.release_dates.map((rd) => rd.certification).filter((c) => c);
         if (certs.length > 0) certification = certs[certs.length - 1]; 
      } else {
         const usRelease = d.release_dates?.results?.find((r) => r.iso_3166_1 === 'US');
         if (usRelease && usRelease.release_dates?.length > 0) {
             const certs = usRelease.release_dates.map((rd) => rd.certification).filter((c) => c);
             if (certs.length > 0) certification = certs[0];
         }
      }
    } else {
      const inRating = d.content_ratings?.results?.find((r) => r.iso_3166_1 === 'IN');
      if (inRating && inRating.rating) {
         certification = inRating.rating;
      } else {
         const usRating = d.content_ratings?.results?.find((r) => r.iso_3166_1 === 'US');
         if (usRating && usRating.rating) certification = usRating.rating;
      }
    }
    if (!certification) certification = "U/A";

    let platform = getPlatformFallback(m.id);
    const inProviders = d.watch?.providers?.results?.IN?.flatrate;
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

    let releaseType = "In Theaters";
    if (type === 'movie') {
      const inRelease = d.release_dates?.results?.find((r) => r.iso_3166_1 === 'IN');
      const hasTheatrical = inRelease?.release_dates?.some((rd) => rd.type === 3);
      if (!hasTheatrical) releaseType = "OTT";
    } else {
      releaseType = "OTT";
    }

    const rDate = type === 'movie' ? d.release_date : d.first_air_date;
    const releaseDateObj = new Date(rDate || today);
    const status = releaseDateObj > today ? "Upcoming" : "Released";
    
    const year = releaseDateObj.getFullYear().toString();
    
    let trailerKey = undefined;
    if (d.videos && d.videos.results) {
      const vids = d.videos.results;
      const officialTrailer = vids.find((v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official);
      const anyTrailer = vids.find((v) => v.site === 'YouTube' && v.type === 'Trailer');
      const anyVideo = vids.find((v) => v.site === 'YouTube');
      const bestVideo = officialTrailer || anyTrailer || anyVideo;
      if (bestVideo) {
        trailerKey = bestVideo.key;
      }
    }

    if (!trailerKey) {
      try {
        const title = type === 'movie' ? d.title : d.name;
        const query = `${title} official trailer ${lang} ${year}`;
        const searchResult = await ytSearch(query);
        if (searchResult && searchResult.videos && searchResult.videos.length > 0) {
          trailerKey = searchResult.videos[0].videoId;
        }
      } catch (err) {
        console.error("Failed to fetch fallback trailer for", type === 'movie' ? d.title : d.name);
      }
    }

    return {
      id: m.id.toString(),
      title: type === 'movie' ? d.title : d.name,
      language: d.original_language,
      releaseType,
      platform,
      releaseDate: rDate || today.toISOString().split('T')[0],
      posterUrl: d.poster_path ? `https://image.tmdb.org/t/p/w500${d.poster_path}` : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400&h=600',
      genres: d.genres?.map((g) => g.name) || [],
      synopsis: d.overview || "No synopsis available.",
      rating: d.vote_average ? parseFloat(d.vote_average.toFixed(1)) : 0,
      status,
      certification,
      mediaType: type,
      trailerKey,
      year // for grouping
    };
  }));

  // Group by year
  const byYear = {};
  for (const item of detailed) {
    if (!byYear[item.year]) byYear[item.year] = [];
    byYear[item.year].push(item);
  }

  // Write files
  for (const year of Object.keys(byYear)) {
    const dir = path.join(dataDir, year, lang);
    fs.mkdirSync(dir, { recursive: true });
    
    // Clean year out of the written objects
    const finalData = byYear[year].map(i => {
      const copy = { ...i };
      delete copy.year;
      return copy;
    });
    
    fs.writeFileSync(path.join(dir, outFileName), JSON.stringify(finalData, null, 2));
    console.log(`Wrote ${finalData.length} ${outFileName} to ${year}/${lang}`);
  }
}

async function run() {
  // Clear old data
  if (fs.existsSync(dataDir)) {
    fs.rmSync(dataDir, { recursive: true, force: true });
  }

  for (const lang of targetLanguages) {
    await processMedia('movie', 'primary_release_date', lang, 'movies.json');
    await processMedia('tv', 'first_air_date', lang, 'series.json');
  }
}

run().catch(console.error);
