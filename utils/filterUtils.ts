import { Track } from '@/types/index';

export const filterBySearch = (tracks: Track[], searchQuery: string): Track[] => {
  if (!searchQuery.trim()) return tracks;
  const query = searchQuery.trim().toLowerCase();
  return tracks.filter(track => track.name?.toLowerCase().startsWith(query));
};

export const filterByAuthors = (tracks: Track[], selectedAuthors: string[]): Track[] => {
  if (selectedAuthors.length === 0) return tracks;
  return tracks.filter(track => selectedAuthors.includes(track.author));
};

export const filterByGenres = (tracks: Track[], selectedGenres: string[]): Track[] => {
  if (selectedGenres.length === 0) return tracks;
  return tracks.filter(track =>
    track.genre?.some(genre => selectedGenres.includes(genre))
  );
};

export const sortByDateDesc = (tracks: Track[]): Track[] => {
  return [...tracks].sort((a, b) => {
    const dateA = new Date(a.release_date).getTime();
    const dateB = new Date(b.release_date).getTime();
    if (isNaN(dateA) && isNaN(dateB)) return 0;
    if (isNaN(dateA)) return 1;
    if (isNaN(dateB)) return -1;
    return dateB - dateA;
  });
};

export const sortByDateAsc = (tracks: Track[]): Track[] => {
  return [...tracks].sort((a, b) => {
    const dateA = new Date(a.release_date).getTime();
    const dateB = new Date(b.release_date).getTime();
    if (isNaN(dateA) && isNaN(dateB)) return 0;
    if (isNaN(dateA)) return 1;
    if (isNaN(dateB)) return -1;
    return dateA - dateB;
  });
};

export const applyFilters = (
  tracks: Track[],
  searchQuery: string,
  selectedAuthors: string[],
  selectedGenres: string[],
  sortBy: 'none' | 'asc' | 'desc' = 'none'
): Track[] => {
  let result = tracks;
  result = filterBySearch(result, searchQuery);
  result = filterByAuthors(result, selectedAuthors);
  result = filterByGenres(result, selectedGenres);

  if (sortBy === 'desc') {
    result = sortByDateDesc(result);
  } else if (sortBy === 'asc') {
    result = sortByDateAsc(result);
  }
  return result;
};

export const getUniqueAuthors = (tracks: Track[]): string[] => {
  return Array.from(new Set(tracks.map(t => t.author)))
    .filter(author => author && author !== '-')
    .sort();
};

export const getUniqueGenres = (tracks: Track[]): string[] => {
  return Array.from(new Set(tracks.flatMap(t => t.genre)))
    .filter(genre => genre && genre.trim() !== '')
    .sort();
};