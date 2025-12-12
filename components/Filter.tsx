"use client";

import { useState, useRef, useEffect } from "react";
import classNames from "classnames";
import styles from "./Filter.module.css";
import { Track } from "@/types";

interface FilterProps {
  tracks: Track[];
}

export default function Filter({ tracks }: FilterProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [windowPosition, setWindowPosition] = useState({ left: 0, top: 0 });
  
  const authorRef = useRef<HTMLButtonElement>(null);
  const yearRef = useRef<HTMLButtonElement>(null);
  const genreRef = useRef<HTMLButtonElement>(null);

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

  const handleFilterClick = (filter: string, ref: React.RefObject<HTMLButtonElement>) => {
    if (activeFilter === filter) {
      setActiveFilter(null);
    } else {
      setActiveFilter(filter);
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const container = ref.current.closest(`.${styles.centerblock__filter}`);
        if (container) {
          const containerRect = container.getBoundingClientRect();
          setWindowPosition({
            left: rect.left - containerRect.left,
            top: rect.bottom - containerRect.top + 10
          });
        }
      }
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(`.${styles.filter__button}, .${styles.filter__window}`)) {
        setActiveFilter(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.centerblock__filter}>
      <div className={styles.filter__title}>Искать по:</div>
      <div className={styles.filter__buttons}>
        <button
          ref={authorRef}
          className={classNames(styles.filter__button, {
            [styles.active]: activeFilter === "author",
          })}
          onClick={() => handleFilterClick("author", authorRef)}
        >
          исполнителю
        </button>
        <button
          ref={yearRef}
          className={classNames(styles.filter__button, {
            [styles.active]: activeFilter === "year",
          })}
          onClick={() => handleFilterClick("year", yearRef)}
        >
          году выпуска
        </button>
        <button
          ref={genreRef}
          className={classNames(styles.filter__button, {
            [styles.active]: activeFilter === "genre",
          })}
          onClick={() => handleFilterClick("genre", genreRef)}
        >
          жанру
        </button>
      </div>

      {activeFilter && (
        <div 
          className={styles.filter__window}
          style={{
            left: `${windowPosition.left}px`,
            top: `${windowPosition.top}px`
          }}
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