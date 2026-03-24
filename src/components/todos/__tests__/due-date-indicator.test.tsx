import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DueDateIndicator } from "../due-date-indicator";
import { format, addDays, subDays } from "date-fns";

function formatDate(d: Date) {
  return format(d, "yyyy-MM-dd");
}

describe("DueDateIndicator", () => {
  it("shows 'Today' for today's date", () => {
    render(<DueDateIndicator dueDate={formatDate(new Date())} />);
    expect(screen.getByText("Today")).toBeInTheDocument();
  });

  it("shows formatted date for future dates", () => {
    const future = addDays(new Date(), 10);
    render(<DueDateIndicator dueDate={formatDate(future)} />);
    expect(screen.getByText(format(future, "MMM d"))).toBeInTheDocument();
  });

  it("applies red color for overdue dates", () => {
    const past = subDays(new Date(), 3);
    const { container } = render(<DueDateIndicator dueDate={formatDate(past)} />);
    expect(container.firstChild).toHaveClass("text-red-600");
  });

  it("applies orange color for soon dates (within 2 days)", () => {
    const soon = addDays(new Date(), 1);
    const { container } = render(<DueDateIndicator dueDate={formatDate(soon)} />);
    expect(container.firstChild).toHaveClass("text-orange-600");
  });

  it("uses muted color when completed", () => {
    const past = subDays(new Date(), 3);
    const { container } = render(<DueDateIndicator dueDate={formatDate(past)} completed />);
    expect(container.firstChild).toHaveClass("text-muted-foreground");
  });
});
