import { useState, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Track } from '@/types/index';
import {
  applyFilters,
  getUniqueAuthors,
  getUniqueGenres,
} from '@/utils/filterUtils';

type SortOrder = 'none' | 'asc' | 'desc';

interface FiltersState {
  searchQuery: string;
  selectedAuthors: string[];
  selectedGenres: string[];
  sortBy: SortOrder;
}

export const useFilters = (tracks: Track[]) => {
  const pathname = usePathname();

  const [filters, setFilters] = useState<FiltersState>({
    searchQuery: '',
    selectedAuthors: [],
    selectedGenres: [],
    sortBy: 'none',
  });

  useEffect(() => {
    setFilters({
      searchQuery: '',
      selectedAuthors: [],
      selectedGenres: [],
      sortBy: 'none',
    });
  }, [pathname]);

  const availableAuthors = useMemo(() => getUniqueAuthors(tracks), [tracks]);
  const availableGenres = useMemo(() => getUniqueGenres(tracks), [tracks]);

  const filteredTracks = useMemo(
    () =>
      applyFilters(
        tracks,
        filters.searchQuery,
        filters.selectedAuthors,
        filters.selectedGenres,
        filters.sortBy
      ),
    [tracks, filters]
  );

  const setSearchQuery = (query: string) =>
    setFilters((prev) => ({ ...prev, searchQuery: query }));

  const toggleAuthor = (author: string) =>
    setFilters((prev) => ({
      ...prev,
      selectedAuthors: prev.selectedAuthors.includes(author)
        ? prev.selectedAuthors.filter((a) => a !== author)
        : [...prev.selectedAuthors, author],
    }));

  const toggleGenre = (genre: string) =>
    setFilters((prev) => ({
      ...prev,
      selectedGenres: prev.selectedGenres.includes(genre)
        ? prev.selectedGenres.filter((g) => g !== genre)
        : [...prev.selectedGenres, genre],
    }));

  const setSortBy = (sort: SortOrder) =>
    setFilters((prev) => ({ ...prev, sortBy: sort }));

  const clearFilters = () =>
    setFilters({
      searchQuery: '',
      selectedAuthors: [],
      selectedGenres: [],
      sortBy: 'none',
    });

  return {
    filters,
    filteredTracks,
    availableAuthors,
    availableGenres,
    setSearchQuery,
    toggleAuthor,
    toggleGenre,
    setSortBy,
    clearFilters,
  };
};