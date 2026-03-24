import { differenceInDays, format, isToday, isPast, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DueDateIndicatorProps {
  dueDate: string;
  completed?: boolean;
}

export function DueDateIndicator({ dueDate, completed }: DueDateIndicatorProps) {
  const date = parseISO(dueDate);
  const today = new Date();
  const daysUntil = differenceInDays(date, today);

  let colorClass = "text-muted-foreground";
  if (!completed) {
    if (isPast(date) && !isToday(date)) {
      colorClass = "text-red-600";
    } else if (daysUntil <= 2) {
      colorClass = "text-orange-600";
    }
  }

  const label = isToday(date) ? "Today" : format(date, "MMM d");

  return (
    <span className={cn("flex items-center gap-1 text-xs shrink-0", colorClass)}>
      <CalendarIcon className="size-3" />
      {label}
    </span>
  );
}
