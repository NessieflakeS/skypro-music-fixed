"use client";

import { useState, useRef, useEffect } from "react";
import classNames from "classnames";
import styles from "./Filter.module.css";
import { ITrack } from "@/types";

interface FilterProps {
  tracks: ITrack[];
}

export default function Filter({ tracks }: FilterProps) {
  const [activeFilter, setActiveFilter] = useState<"author" | "year" | "genre" | null>(null);
  const [activeButtonIndex, setActiveButtonIndex] = useState<number | null>(null);
  
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

  const handleFilterClick = (filter: "author" | "year" | "genre", index: number) => {
    if (activeFilter === filter) {
      setActiveFilter(null);
      setActiveButtonIndex(null);
    } else {
      setActiveFilter(filter);
      setActiveButtonIndex(index);
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterContainerRef.current && !filterContainerRef.current.contains(event.target as Node)) {
        setActiveFilter(null);
        setActiveButtonIndex(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filterData = getFilterData();

  const getWindowClass = () => {
    if (activeButtonIndex === 0) return styles.filter__window_author;
    if (activeButtonIndex === 1) return styles.filter__window_year;
    if (activeButtonIndex === 2) return styles.filter__window_genre;
    return "";
  };

  return (
    <div className={styles.centerblock__filter} ref={filterContainerRef}>
      <div className={styles.filter__title}>Искать по:</div>
      <div className={styles.filter__buttons}>
        <button
          className={classNames(styles.filter__button, {
            [styles.active]: activeFilter === "author",
          })}
          onClick={() => handleFilterClick("author", 0)}
          type="button"
        >
          исполнителю
        </button>
        <button
          className={classNames(styles.filter__button, {
            [styles.active]: activeFilter === "year",
          })}
          onClick={() => handleFilterClick("year", 1)}
          type="button"
        >
          году выпуска
        </button>
        <button
          className={classNames(styles.filter__button, {
            [styles.active]: activeFilter === "genre",
          })}
          onClick={() => handleFilterClick("genre", 2)}
          type="button"
        >
          жанру
        </button>
      </div>

      {activeFilter && filterData.length > 0 && (
        <div className={`${styles.filter__window} ${getWindowClass()}`}>
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