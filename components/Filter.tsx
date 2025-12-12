"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import classNames from "classnames";
import styles from "./Filter.module.css";
import { Track } from "@/types";

interface FilterProps {
  tracks: Track[];
}

export default function Filter({ tracks }: FilterProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [activeFilterIndex, setActiveFilterIndex] = useState<number | null>(null);
  
  const filterButtonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const filterWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    filterButtonsRef.current = filterButtonsRef.current.slice(0, 3);
  }, []);

  const authors = Array.from(
    new Set(tracks.map(track => track.author))
  ).filter(author => author && author !== "-");

  const genres = Array.from(
    new Set(tracks.flatMap(track => track.genre))
  );

  const years = Array.from(
    new Set(tracks.map(track => {
      const year = new Date(track.release_date).getFullYear();
      return isNaN(year) ? null : year;
    }))
  )
    .filter(year => year !== null)
    .sort((a, b) => (b || 0) - (a || 0)) as number[];

  const handleFilterClick = (filter: string, index: number) => {
    if (activeFilter === filter) {
      setActiveFilter(null);
      setActiveFilterIndex(null);
    } else {
      setActiveFilter(filter);
      setActiveFilterIndex(index);
    }
  };

  const getFilterData = () => {
    switch (activeFilter) {
      case "author":
        return authors;
      case "genre":
        return genres;
      case "year":
        return years;
      default:
        return [];
    }
  };

  const filterData = getFilterData();

  const setAuthorRef = useCallback((el: HTMLButtonElement | null) => {
    filterButtonsRef.current[0] = el;
  }, []);

  const setYearRef = useCallback((el: HTMLButtonElement | null) => {
    filterButtonsRef.current[1] = el;
  }, []);

  const setGenreRef = useCallback((el: HTMLButtonElement | null) => {
    filterButtonsRef.current[2] = el;
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (filterWindowRef.current && 
          !filterWindowRef.current.contains(target) &&
          !filterButtonsRef.current.some(btn => btn && btn.contains(target))) {
        setActiveFilter(null);
        setActiveFilterIndex(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const getWindowClass = () => {
    if (activeFilterIndex === 0) return styles.filter__window_author;
    if (activeFilterIndex === 1) return styles.filter__window_year;
    if (activeFilterIndex === 2) return styles.filter__window_genre;
    return "";
  };

  return (
    <div className={styles.centerblock__filter}>
      <div className={styles.filter__title}>Искать по:</div>
      <div className={styles.filter__buttons}>
        <button
          ref={setAuthorRef}
          className={classNames(styles.filter__button, {
            [styles.active]: activeFilter === "author",
          })}
          onClick={() => handleFilterClick("author", 0)}
        >
          исполнителю
        </button>
        <button
          ref={setYearRef}
          className={classNames(styles.filter__button, {
            [styles.active]: activeFilter === "year",
          })}
          onClick={() => handleFilterClick("year", 1)}
        >
          году выпуска
        </button>
        <button
          ref={setGenreRef}
          className={classNames(styles.filter__button, {
            [styles.active]: activeFilter === "genre",
          })}
          onClick={() => handleFilterClick("genre", 2)}
        >
          жанру
        </button>
      </div>

      {activeFilter && (
        <div 
          ref={filterWindowRef}
          className={`${styles.filter__window} ${getWindowClass()}`}
        >
          <div className={styles.filter__list}>
            {filterData.map((item, index) => (
              <div key={index} className={styles.filter__item}>
                {item.toString()}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}