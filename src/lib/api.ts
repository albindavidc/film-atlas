import { Movie } from '../types';

let cachedMovies: Movie[] = [];

export async function fetchMovies(): Promise<Movie[]> {
  if (cachedMovies.length > 0) {
    return cachedMovies;
  }

  // Statically load all generated JSON files from the data directory
  const modules = import.meta.glob('../data/**/*.json', { eager: true });
  
  const allMovies: Movie[] = [];
  const seenIds = new Set<string>();

  for (const path in modules) {
    const data = (modules[path] as any).default as any[];
    if (Array.isArray(data)) {
      // Validate and push, preventing duplicates
      for (const item of data) {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);

          // Dynamically evaluate status based on today's date
          const [year, month, day] = item.releaseDate.split('-').map(Number);
          const rDate = new Date(year, month - 1, day);
          rDate.setHours(0, 0, 0, 0);
          
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          item.status = rDate <= today ? 'Released' : 'Upcoming';

          allMovies.push(item);
        }
      }
    }
  }

  // Shuffle or sort if needed, but they are already sorted by popularity inside the JSONs.
  // We can just sort all of them by release date descending to have a fresh feed.
  allMovies.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());

  cachedMovies = allMovies;
  return cachedMovies;
}

