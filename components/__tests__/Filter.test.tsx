import '@testing-library/jest-dom';
import { render, screen, fireEvent } from "@testing-library/react";
import Filter from "@/components/Filter";

const mockAuthors = ["Artist 1", "Artist 2", "Artist 3"];
const mockGenres = ["Rock", "Pop", "Jazz"];

describe("Filter", () => {
  const defaultProps = {
    authors: mockAuthors,
    genres: mockGenres,
    selectedAuthors: [] as string[],
    selectedGenres: [] as string[],
    sortBy: "none" as const,
    onToggleAuthor: jest.fn(),
    onToggleGenre: jest.fn(),
    onSortChange: jest.fn(),
  };

  test("отображает все кнопки фильтров", () => {
    render(<Filter {...defaultProps} />);
    expect(screen.getByText("исполнителю")).toBeInTheDocument();
    expect(screen.getByText("году выпуска")).toBeInTheDocument();
    expect(screen.getByText("жанру")).toBeInTheDocument();
  });

  test("при клике на 'исполнителю' открывается список исполнителей", () => {
    render(<Filter {...defaultProps} />);
    const authorBtn = screen.getByText("исполнителю");
    fireEvent.click(authorBtn);
    expect(screen.getByText("Artist 1")).toBeInTheDocument();
    expect(screen.getByText("Artist 2")).toBeInTheDocument();
    expect(screen.getByText("Artist 3")).toBeInTheDocument();
  });

  test("при клике на исполнителя вызывается onToggleAuthor", () => {
    const onToggleAuthor = jest.fn();
    render(<Filter {...defaultProps} onToggleAuthor={onToggleAuthor} />);
    fireEvent.click(screen.getByText("исполнителю"));
    fireEvent.click(screen.getByText("Artist 2"));
    expect(onToggleAuthor).toHaveBeenCalledWith("Artist 2");
  });

  test("отображает счетчик выбранных исполнителей", () => {
    render(
      <Filter
        {...defaultProps}
        selectedAuthors={["Artist 1", "Artist 3"]}
      />
    );
    const authorBtn = screen.getByText("исполнителю");
    expect(authorBtn).toHaveClass("active");
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  test("циклическое переключение сортировки по году", () => {
    const onSortChange = jest.fn();
    render(<Filter {...defaultProps} onSortChange={onSortChange} />);
    const yearBtn = screen.getByText("году выпуска");

    fireEvent.click(yearBtn);
    expect(onSortChange).toHaveBeenCalledWith("desc");

    fireEvent.click(yearBtn);
    expect(onSortChange).toHaveBeenCalledWith("asc");

    fireEvent.click(yearBtn);
    expect(onSortChange).toHaveBeenCalledWith("none");
  });

  test("при активной сортировке отображается иконка", () => {
    render(<Filter {...defaultProps} sortBy="desc" />);
    const yearBtn = screen.getByText("году выпуска");
    expect(yearBtn).toHaveClass("active");
    expect(screen.getByText("↓")).toBeInTheDocument();
  });

  test("при клике на 'жанру' открывается список жанров", () => {
    render(<Filter {...defaultProps} />);
    fireEvent.click(screen.getByText("жанру"));
    expect(screen.getByText("Rock")).toBeInTheDocument();
    expect(screen.getByText("Pop")).toBeInTheDocument();
    expect(screen.getByText("Jazz")).toBeInTheDocument();
  });

  test("выбранные жанры подсвечиваются", () => {
    render(
      <Filter
        {...defaultProps}
        selectedGenres={["Rock", "Jazz"]}
      />
    );
    fireEvent.click(screen.getByText("жанру"));
    const rockItem = screen.getByText("Rock");
    const jazzItem = screen.getByText("Jazz");
    const popItem = screen.getByText("Pop");

    expect(rockItem).toHaveClass("filter__item_selected");
    expect(jazzItem).toHaveClass("filter__item_selected");
    expect(popItem).not.toHaveClass("filter__item_selected");
  });

  test("закрытие списка при клике вне компонента", () => {
    render(<Filter {...defaultProps} />);
    fireEvent.click(screen.getByText("исполнителю"));
    expect(screen.getByText("Artist 1")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByText("Artist 1")).not.toBeInTheDocument();
  });
});