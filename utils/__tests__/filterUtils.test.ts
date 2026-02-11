import { describe, test, expect, jest } from '@jest/globals';
import {
  filterBySearch,
  filterByAuthors,
  filterByGenres,
  sortByDateDesc,
  sortByDateAsc,
  applyFilters,
  getUniqueAuthors,
  getUniqueGenres,
} from "@/utils/filterUtils";
import { Track } from "@/types";

const mockTracks: Track[] = [
  {
    id: 1,
    name: "Song One",
    author: "Artist A",
    genre: ["Rock"],
    release_date: "2023-01-01",
    duration_in_seconds: 180,
    album: "Album 1",
    track_file: "url",
    logo: null,
    stared_user: [],
  },
  {
    id: 2,
    name: "Song Two",
    author: "Artist B",
    genre: ["Pop"],
    release_date: "2022-06-15",
    duration_in_seconds: 200,
    album: "Album 2",
    track_file: "url",
    logo: null,
    stared_user: [],
  },
  {
    id: 3,
    name: "Another Song",
    author: "Artist A",
    genre: ["Rock", "Alternative"],
    release_date: "2021-12-10",
    duration_in_seconds: 210,
    album: "Album 1",
    track_file: "url",
    logo: null,
    stared_user: [],
  },
];

describe("filterUtils", () => {
  test("filterBySearch: возвращает треки, начинающиеся с запроса (без учёта регистра)", () => {
    expect(filterBySearch(mockTracks, "Song")).toHaveLength(2);
    expect(filterBySearch(mockTracks, "s")).toHaveLength(3);
    expect(filterBySearch(mockTracks, "another")).toHaveLength(1);
    expect(filterBySearch(mockTracks, "")).toEqual(mockTracks);
    expect(filterBySearch(mockTracks, "xyz")).toHaveLength(0);
  });

  test("filterByAuthors: фильтрация по одному автору", () => {
    expect(filterByAuthors(mockTracks, ["Artist A"])).toHaveLength(2);
    expect(filterByAuthors(mockTracks, ["Artist B"])).toHaveLength(1);
  });

  test("filterByAuthors: фильтрация по нескольким авторам", () => {
    expect(filterByAuthors(mockTracks, ["Artist A", "Artist B"])).toHaveLength(3);
  });

  test("filterByAuthors: пустой список – все треки", () => {
    expect(filterByAuthors(mockTracks, [])).toEqual(mockTracks);
  });

  test("filterByGenres: фильтрация по одному жанру", () => {
    expect(filterByGenres(mockTracks, ["Rock"])).toHaveLength(2);
    expect(filterByGenres(mockTracks, ["Pop"])).toHaveLength(1);
    expect(filterByGenres(mockTracks, ["Alternative"])).toHaveLength(1);
  });

  test("filterByGenres: OR логика", () => {
    expect(filterByGenres(mockTracks, ["Rock", "Pop"])).toHaveLength(3);
  });

  test("filterByGenres: пустой список – все треки", () => {
    expect(filterByGenres(mockTracks, [])).toEqual(mockTracks);
  });

  test("sortByDateDesc: сортировка от новых к старым", () => {
    const sorted = sortByDateDesc(mockTracks);
    expect(sorted[0].release_date).toBe("2023-01-01");
    expect(sorted[1].release_date).toBe("2022-06-15");
    expect(sorted[2].release_date).toBe("2021-12-10");
  });

  test("sortByDateAsc: сортировка от старых к новым", () => {
    const sorted = sortByDateAsc(mockTracks);
    expect(sorted[0].release_date).toBe("2021-12-10");
    expect(sorted[1].release_date).toBe("2022-06-15");
    expect(sorted[2].release_date).toBe("2023-01-01");
  });

  test("sortByDate*: некорректные даты помещаются в конец", () => {
    const tracksWithInvalid = [
      ...mockTracks,
      {
        id: 4,
        name: "Invalid Date",
        author: "Artist C",
        genre: [],
        release_date: "invalid",
        duration_in_seconds: 180,
        album: "",
        track_file: "",
        logo: null,
        stared_user: [],
      },
    ];
    const sortedDesc = sortByDateDesc(tracksWithInvalid);
    expect(sortedDesc[sortedDesc.length - 1].name).toBe("Invalid Date");
  });

  test("applyFilters: комбинация фильтров и сортировки", () => {
    const result = applyFilters(
      mockTracks,
      "Song",
      ["Artist A"],
      ["Rock"],
      "desc"
    );
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Song One");
  });

  test("applyFilters: фильтры без треков – пустой результат", () => {
    const result = applyFilters([], "test", [], [], "none");
    expect(result).toEqual([]);
  });

  test("getUniqueAuthors: возвращает уникальных исполнителей", () => {
    expect(getUniqueAuthors(mockTracks)).toEqual(["Artist A", "Artist B"]);
  });

  test("getUniqueAuthors: пустой массив", () => {
    expect(getUniqueAuthors([])).toEqual([]);
  });

  test("getUniqueGenres: возвращает уникальные жанры", () => {
    expect(getUniqueGenres(mockTracks)).toEqual(["Alternative", "Pop", "Rock"]);
  });

  test("getUniqueGenres: пустой массив", () => {
    expect(getUniqueGenres([])).toEqual([]);
  });
});