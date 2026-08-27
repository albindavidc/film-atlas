import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import 'dotenv/config';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // --- CACHE & HELPERS ---
  let cachedMovies: any[] = [];
  let lastFetchTime = 0;

  const getPlatformFallback = (id: number) => {
    const platforms = ['Netflix', 'Prime Video', 'Disney+ Hotstar', 'SonyLIV', 'ZEE5', 'Aha', 'JioCinema'];
    return platforms[id % platforms.length];
  };

  // --- API ROUTES ---
  app.get("/api/movies", async (req, res) => {
    // Return cache if it's less than 5 minutes old
    if (cachedMovies.length > 0 && Date.now() - lastFetchTime < 300000) {
      return res.json(cachedMovies);
    }

    const token = process.env.API_READ_ACCESS_TOKEN;
    if (!token) {
      return res.status(500).json({ error: "TMDB API token not configured on server." });
    }

    try {
      const today = new Date();
      const currentYear = today.getFullYear();
      
      // Window: Jan 1st of current year -> End of Next Month
      const startOfYear = `${currentYear}-01-01`;
      const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 2, 0);
      const endOfNextMonth = nextMonthDate.toISOString().split('T')[0];

      // Fetch Indian languages, sorted by popularity, within the date range
      let allResults: any[] = [];
      
      // 1. Fetch Movies (3 pages)
      for (let page = 1; page <= 3; page++) {
        const discoverUrl = `https://api.themoviedb.org/3/discover/movie?region=IN&with_original_language=ml|ta|te|kn|hi|en&primary_release_date.gte=${startOfYear}&primary_release_date.lte=${endOfNextMonth}&sort_by=popularity.desc&page=${page}`;
        const discoverRes = await fetch(discoverUrl, {
          headers: { 'Authorization': `Bearer ${token}`, 'accept': 'application/json' }
        });
        
        if (discoverRes.ok) {
          const discoverData = await discoverRes.json();
          const movies = (discoverData.results || []).map((m: any) => ({ ...m, media_type: 'movie' }));
          allResults = [...allResults, ...movies];
        }
      }

      // 2. Fetch TV Shows (3 pages)
      for (let page = 1; page <= 3; page++) {
        const tvUrl = `https://api.themoviedb.org/3/discover/tv?with_original_language=ml|ta|te|kn|hi|en&first_air_date.gte=${startOfYear}&first_air_date.lte=${endOfNextMonth}&sort_by=popularity.desc&page=${page}`;
        const tvRes = await fetch(tvUrl, {
          headers: { 'Authorization': `Bearer ${token}`, 'accept': 'application/json' }
        });
        
        if (tvRes.ok) {
          const tvData = await tvRes.json();
          const tvShows = (tvData.results || []).map((m: any) => ({ ...m, media_type: 'tv' }));
          allResults = [...allResults, ...tvShows];
        }
      }
      
      // Sort combined results by popularity and limit to top 60
      allResults.sort((a, b) => b.popularity - a.popularity);
      const results = allResults.slice(0, 60);

      // Fetch detailed release dates and watch providers for each movie/show in parallel
      const detailedMovies = await Promise.all(results.map(async (m: any) => {
        const appendStr = m.media_type === 'movie' ? 'release_dates,watch/providers' : 'content_ratings,watch/providers';
        const detailRes = await fetch(`https://api.themoviedb.org/3/${m.media_type}/${m.id}?append_to_response=${appendStr}`, { 
          headers: { 'Authorization': `Bearer ${token}`, 'accept': 'application/json' }
        });
        const data = await detailRes.json();
        return { ...data, media_type: m.media_type };
      }));

      const formattedMovies = detailedMovies.map(m => {
        // --- Parse Certification ---
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
          // TV Shows logic
          const inRating = m.content_ratings?.results?.find((r: any) => r.iso_3166_1 === 'IN');
          if (inRating && inRating.rating) {
             certification = inRating.rating;
          } else {
             const usRating = m.content_ratings?.results?.find((r: any) => r.iso_3166_1 === 'US');
             if (usRating && usRating.rating) certification = usRating.rating;
          }
        }
        if (!certification) certification = "U/A";

        // --- Parse Platform ---
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

        // --- Parse Release Type & Status ---
        let releaseType = "Streaming";
        if (m.media_type === 'movie') {
          const inRelease = m.release_dates?.results?.find((r: any) => r.iso_3166_1 === 'IN');
          const hasTheatrical = inRelease?.release_dates?.some((d:any) => d.type === 3);
          if (!hasTheatrical) releaseType = "OTT";
        } else {
          releaseType = "OTT"; // TV Shows are generally direct-to-digital (OTT)
        }

        const rDate = m.media_type === 'movie' ? m.release_date : m.first_air_date;
        const releaseDateObj = new Date(rDate || today);
        const status = releaseDateObj > today ? "Upcoming" : "Released";

        // --- Format for Frontend ---
        return {
          id: m.id.toString(),
          title: m.media_type === 'movie' ? m.title : m.name,
          language: m.original_language,
          releaseType,
          platform,
          releaseDate: rDate || today.toISOString().split('T')[0],
          posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400&h=600',
          genres: m.genres?.map((g:any) => g.name) || [],
          synopsis: m.overview || "No synopsis available.",
          rating: m.vote_average ? parseFloat(m.vote_average.toFixed(1)) : 0,
          status,
          certification,
          mediaType: m.media_type
        };
      });

      cachedMovies = formattedMovies;
      lastFetchTime = Date.now();
      res.json(cachedMovies);
    } catch (error) {
      console.error("TMDB Proxy Error:", error);
      res.status(500).json({ error: "Failed to fetch from TMDB" });
    }
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    // In development, Vite handles the frontend asset serving
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, we serve the static files compiled in the /dist folder
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
