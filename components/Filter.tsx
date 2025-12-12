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
  const filterRef = useRef<HTMLDivElement>(null);

  // Получаем уникальные значения из данных треков
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

  const handleFilterClick = (filter: string) => {
    if (activeFilter === filter) {
      setActiveFilter(null);
    } else {
      setActiveFilter(filter);
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

  // Закрываем окно при клике вне фильтра
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setActiveFilter(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filterData = getFilterData();

  return (
    <div className={styles.centerblock__filter} ref={filterRef}>
      <div className={styles.filter__title}>Искать по:</div>
      <div className={styles.filter__buttons}>
        <button
          className={classNames(styles.filter__button, {
            [styles.active]: activeFilter === "author",
          })}
          onClick={() => handleFilterClick("author")}
        >
          исполнителю
        </button>
        <button
          className={classNames(styles.filter__button, {
            [styles.active]: activeFilter === "year",
          })}
          onClick={() => handleFilterClick("year")}
        >
          году выпуска
        </button>
        <button
          className={classNames(styles.filter__button, {
            [styles.active]: activeFilter === "genre",
          })}
          onClick={() => handleFilterClick("genre")}
        >
          жанру
        </button>
      </div>

      {activeFilter && filterData.length > 0 && (
        <div className={styles.filter__window}>
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