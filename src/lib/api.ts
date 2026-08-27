import { Movie } from '../types';

let cachedMovies: Movie[] = [];

export async function fetchMovies(): Promise<Movie[]> {
  if (cachedMovies.length > 0) {
    return cachedMovies;
  }

  // Statically load all generated JSON files from the data directory
  const modules = import.meta.glob('../data/**/*.json', { eager: true });
  
  const allMovies: Movie[] = [];
  
  for (const path in modules) {
    const data = (modules[path] as any).default as any[];
    if (Array.isArray(data)) {
      // Validate and push
      allMovies.push(...data);
    }
  }

  // Shuffle or sort if needed, but they are already sorted by popularity inside the JSONs.
  // We can just sort all of them by release date descending to have a fresh feed.
  allMovies.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());

  cachedMovies = allMovies;
  return cachedMovies;
}

