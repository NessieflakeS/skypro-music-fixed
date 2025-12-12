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
  
  const authorButtonRef = useRef<HTMLButtonElement>(null);
  const yearButtonRef = useRef<HTMLButtonElement>(null);
  const genreButtonRef = useRef<HTMLButtonElement>(null);
  const filterContainerRef = useRef<HTMLDivElement>(null);

  const authors = Array.from(
    new Set(tracks.map(track => track.author))
  ).filter(author => author && author !== "-");

  const genres = Array.from(
    new Set(tracks.flatMap(track => track.genre))
  ).filter(genre => genre && genre.trim() !== "");

  const years = Array.from(
    new Set(tracks.map(track => {
      try {
        const year = new Date(track.release_date).getFullYear();
        return isNaN(year) ? null : year;
      } catch {
        return null;
      }
    }))
  )
    .filter(year => year !== null)
    .sort((a, b) => (b || 0) - (a || 0)) as number[];

  const calculateWindowPosition = (buttonRef: React.RefObject<HTMLButtonElement>) => {
    if (!buttonRef.current || !filterContainerRef.current) return { left: 0, top: 0 };
    
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const containerRect = filterContainerRef.current.getBoundingClientRect();
    
    const buttonCenter = buttonRect.left + buttonRect.width / 2;
    const containerLeft = containerRect.left;
    
    return {
      left: buttonCenter - containerLeft - 124,
      top: buttonRect.bottom - containerRect.top + 10
    };
  };

  const handleFilterClick = (filter: string, buttonRef: React.RefObject<HTMLButtonElement>) => {
    if (activeFilter === filter) {
      setActiveFilter(null);
    } else {
      setActiveFilter(filter);
      const position = calculateWindowPosition(buttonRef);
      setWindowPosition(position);
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
      const isClickInsideFilter = 
        filterContainerRef.current?.contains(target) || 
        target.closest(`.${styles.filter__window}`) ||
        target.closest(`.${styles.filter__button}`);
      
      if (!isClickInsideFilter && activeFilter) {
        setActiveFilter(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [activeFilter]);

  return (
    <div className={styles.centerblock__filter} ref={filterContainerRef}>
      <div className={styles.filter__title}>Искать по:</div>
      <div className={styles.filter__buttons}>
        <button
          ref={authorButtonRef}
          className={classNames(styles.filter__button, {
            [styles.active]: activeFilter === "author",
          })}
          onClick={() => handleFilterClick("author", authorButtonRef)}
        >
          исполнителю
        </button>
        <button
          ref={yearButtonRef}
          className={classNames(styles.filter__button, {
            [styles.active]: activeFilter === "year",
          })}
          onClick={() => handleFilterClick("year", yearButtonRef)}
        >
          году выпуска
        </button>
        <button
          ref={genreButtonRef}
          className={classNames(styles.filter__button, {
            [styles.active]: activeFilter === "genre",
          })}
          onClick={() => handleFilterClick("genre", genreButtonRef)}
        >
          жанру
        </button>
      </div>

      {activeFilter && filterData.length > 0 && (
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