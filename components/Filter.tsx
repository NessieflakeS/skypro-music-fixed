'use client';

import { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import styles from './Filter.module.css';

interface FilterProps {
  authors: string[];
  genres: string[];
  selectedAuthors: string[];
  selectedGenres: string[];
  sortBy: 'none' | 'asc' | 'desc';
  onToggleAuthor: (author: string) => void;
  onToggleGenre: (genre: string) => void;
  onSortChange: (sort: 'none' | 'asc' | 'desc') => void;
}

type ActiveFilter = 'author' | 'year' | 'genre' | null;

export default function Filter({
  authors,
  genres,
  selectedAuthors,
  selectedGenres,
  sortBy,
  onToggleAuthor,
  onToggleGenre,
  onSortChange,
}: FilterProps) {
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>(null);
  const [activeButtonIndex, setActiveButtonIndex] = useState<number | null>(null);
  const filterContainerRef = useRef<HTMLDivElement>(null);

  const handleFilterClick = (filter: ActiveFilter, index: number) => {
    if (activeFilter === filter) {
      setActiveFilter(null);
      setActiveButtonIndex(null);
    } else {
      setActiveFilter(filter);
      setActiveButtonIndex(index);
    }
  };

  const handleYearClick = () => {
    let newSort: 'none' | 'asc' | 'desc';
    if (sortBy === 'none') newSort = 'desc';
    else if (sortBy === 'desc') newSort = 'asc';
    else newSort = 'none';
    onSortChange(newSort);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterContainerRef.current &&
        !filterContainerRef.current.contains(event.target as Node)
      ) {
        setActiveFilter(null);
        setActiveButtonIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getWindowClass = () => {
    if (activeButtonIndex === 0) return styles.filter__window_author;
    if (activeButtonIndex === 1) return styles.filter__window_year;
    if (activeButtonIndex === 2) return styles.filter__window_genre;
    return '';
  };

  const isAuthorSelected = (author: string) => selectedAuthors.includes(author);
  const isGenreSelected = (genre: string) => selectedGenres.includes(genre);

  return (
    <div className={styles.centerblock__filter} ref={filterContainerRef}>
      <div className={styles.filter__title}>Искать по:</div>
      <div className={styles.filter__buttons}>
        <button
          className={classNames(styles.filter__button, {
            [styles.active]: activeFilter === 'author' || selectedAuthors.length > 0,
          })}
          onClick={() => handleFilterClick('author', 0)}
          type="button"
        >
          исполнителю
          {selectedAuthors.length > 0 && (
            <span className={styles.filter__counter}>{selectedAuthors.length}</span>
          )}
        </button>
        <button
          className={classNames(styles.filter__button, {
            [styles.active]: activeFilter === 'year' || sortBy !== 'none',
          })}
          onClick={handleYearClick}
          type="button"
        >
          году выпуска
          {sortBy !== 'none' && (
            <span className={styles.filter__icon}>
              {sortBy === 'desc' ? '↓' : '↑'}
            </span>
          )}
        </button>
        <button
          className={classNames(styles.filter__button, {
            [styles.active]: activeFilter === 'genre' || selectedGenres.length > 0,
          })}
          onClick={() => handleFilterClick('genre', 2)}
          type="button"
        >
          жанру
          {selectedGenres.length > 0 && (
            <span className={styles.filter__counter}>{selectedGenres.length}</span>
          )}
        </button>
      </div>

      {activeFilter === 'author' && authors.length > 0 && (
        <div className={`${styles.filter__window} ${getWindowClass()}`}>
          <div className={styles.filter__list}>
            {authors.map((author) => (
              <div
                key={author}
                className={classNames(styles.filter__item, {
                  [styles.filter__item_selected]: isAuthorSelected(author),
                })}
                onClick={() => onToggleAuthor(author)}
              >
                {author}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeFilter === 'genre' && genres.length > 0 && (
        <div className={`${styles.filter__window} ${getWindowClass()}`}>
          <div className={styles.filter__list}>
            {genres.map((genre) => (
              <div
                key={genre}
                className={classNames(styles.filter__item, {
                  [styles.filter__item_selected]: isGenreSelected(genre),
                })}
                onClick={() => onToggleGenre(genre)}
              >
                {genre}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}