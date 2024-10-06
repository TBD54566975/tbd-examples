import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { HomePage } from "./home-page";

test("displays header", () => {
  render(<HomePage />);
  expect(screen.getByText("DWA Starter")).toBeInTheDocument();
});
