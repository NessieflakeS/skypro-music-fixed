"use client";

import { useState } from "react";
import classNames from "classnames";
import styles from "./Filter.module.css";
import { Track, FilterType } from "@/types";

interface FilterProps {
  tracks: Track[];
}

export default function Filter({ tracks }: FilterProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>(null);
  const authors = Array.from(new Set(tracks.map(track => track.author))).filter(author => author && author !== "-");
  const genres = Array.from(new Set(tracks.flatMap(track => track.genre)));
  const years = Array.from(
    new Set(tracks.map(track => new Date(track.release_date).getFullYear()))
  ).sort((a, b) => b - a);

  const handleFilterClick = (filter: FilterType) => {
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

  const filterData = getFilterData();

  return (
    <div className={styles.filterContainer}>
      <div className={styles.filter__title}>Искать по:</div>
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

      {activeFilter && (
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