import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetLangs = ['hi', 'ml', 'ta', 'te', 'kn'];
const genres = ['Action', 'Drama', 'Comedy', 'Thriller', 'Romance'];
const platforms = ['Netflix', 'Prime Video', 'Disney+ Hotstar', 'SonyLIV', 'ZEE5', 'Aha'];

const month = process.argv[2] || '09';

const getRand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandDate = () => `2026-${month}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`;

const createMock = (lang, type, id) => {
  const titles = {
    hi: { m: `Singham Returns ${month}`, s: `Mirzapur Season ${month}` },
    ml: { m: `Premam ${month}`, s: `Kerala Crime Files ${month}` },
    ta: { m: `Vikram ${month}`, s: `Suzhal Season ${month}` },
    te: { m: `Pushpa ${month}`, s: `Dhootha ${month}` },
    kn: { m: `KGF Chapter ${month}`, s: `Kavaludaari The Series ${month}` }
  };
  return {
    id: `mock-${type}-${lang}-${id}`,
    title: titles[lang][type === 'movie' ? 'm' : 's'],
    language: lang,
    releaseType: type === 'movie' ? getRand(['In Theaters', 'OTT']) : 'OTT',
    platform: getRand(platforms),
    releaseDate: getRandDate(),
    posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400&h=600',
    genres: [getRand(genres), getRand(genres)],
    synopsis: `A highly anticipated upcoming ${lang} ${type} releasing in month ${month} 2026.`,
    rating: 8.5 + (Math.random()),
    status: 'Released',
    certification: 'U/A',
    mediaType: type,
    trailerKey: 'dQw4w9WgXcQ' // generic placeholder trailer
  };
};

targetLangs.forEach(lang => {
  const moviesFile = path.join(__dirname, `../src/data/2026/${month}/${lang}/movies.json`);
  const seriesFile = path.join(__dirname, `../src/data/2026/${month}/${lang}/series.json`);
  
  if (fs.existsSync(moviesFile)) {
    const movies = JSON.parse(fs.readFileSync(moviesFile, 'utf-8'));
    movies.push(createMock(lang, 'movie', Date.now() + 1));
    movies.push(createMock(lang, 'movie', Date.now() + 2));
    fs.writeFileSync(moviesFile, JSON.stringify(movies, null, 2));
  }
  
  if (fs.existsSync(seriesFile)) {
    const series = JSON.parse(fs.readFileSync(seriesFile, 'utf-8'));
    series.push(createMock(lang, 'tv', Date.now() + 3));
    series.push(createMock(lang, 'tv', Date.now() + 4));
    fs.writeFileSync(seriesFile, JSON.stringify(series, null, 2));
  }
});
console.log(`Added mock regional data across all language folders in month ${month}`);
