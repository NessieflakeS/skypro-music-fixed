import '@testing-library/jest-dom';
import { render, screen, fireEvent } from "@testing-library/react";
import SearchBar from "@/components/ui/SearchBar/SearchBar";

describe("SearchBar", () => {
  test("отображает поле ввода с placeholder", () => {
    render(<SearchBar value="" onChange={() => {}} />);
    const input = screen.getByPlaceholderText("Поиск");
    expect(input).toBeInTheDocument();
  });

  test("отображает переданное значение", () => {
    render(<SearchBar value="test query" onChange={() => {}} />);
    const input = screen.getByPlaceholderText("Поиск");
    expect(input).toHaveValue("test query");
  });

  test("вызывает onChange при вводе текста", () => {
    const handleChange = jest.fn();
    render(<SearchBar value="" onChange={handleChange} />);
    const input = screen.getByPlaceholderText("Поиск");
    fireEvent.change(input, { target: { value: "new search" } });
    expect(handleChange).toHaveBeenCalledWith("new search");
  });
});