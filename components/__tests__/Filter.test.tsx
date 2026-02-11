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
    const { rerender } = render(<Filter {...defaultProps} onSortChange={onSortChange} />);
    const yearBtn = screen.getByText("году выпуска");

    fireEvent.click(yearBtn);
    expect(onSortChange).toHaveBeenCalledWith("desc");
    onSortChange.mockClear();

    rerender(
      <Filter
        {...defaultProps}
        sortBy="desc"
        onSortChange={onSortChange}
      />
    );
    fireEvent.click(yearBtn);
    expect(onSortChange).toHaveBeenCalledWith("asc");
    onSortChange.mockClear();

    rerender(
      <Filter
        {...defaultProps}
        sortBy="asc"
        onSortChange={onSortChange}
      />
    );
    fireEvent.click(yearBtn);
    expect(onSortChange).toHaveBeenCalledWith("none");
  });
});