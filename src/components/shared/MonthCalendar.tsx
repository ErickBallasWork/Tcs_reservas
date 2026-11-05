"use client";

import { addDays, format, parseISO, startOfWeek } from "date-fns";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];
const pad = (n: number) => String(n).padStart(2, "0");

interface DayButtonProps {
  label: number;
  isSelected: boolean;
  isMarked: boolean;
  disabled: boolean;
  onClick: () => void;
}

function DayButton({
  label,
  isSelected,
  isMarked,
  disabled,
  onClick,
}: DayButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "min-h-11 rounded-lg font-semibold text-ink",
        disabled && "cursor-not-allowed text-[#5a6b8f]/60",
        isMarked && "bg-gold-soft text-gold-ink",
        isSelected && "bg-brand text-white",
      )}
    >
      {label}
    </button>
  );
}

function WeekdayHeader() {
  return (
    <>
      {WEEKDAYS.map((d, i) => (
        <b key={i} className="py-1.5 text-[11px] text-ink-soft">
          {d}
        </b>
      ))}
    </>
  );
}

interface CalendarCommonProps {
  selected: string; // YYYY-MM-DD
  markedDates: Set<string>;
  firstSelectableDate: string;
  onSelect: (date: string) => void;
}

interface MonthCalendarProps extends CalendarCommonProps {
  year: number;
  month: number; // 0-based
}

export function MonthCalendar({
  year,
  month,
  selected,
  markedDates,
  firstSelectableDate,
  onSelect,
}: MonthCalendarProps) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7; // week starts on Monday

  return (
    <div className="grid grid-cols-7 gap-1 text-center">
      <WeekdayHeader />
      {Array.from({ length: offset }, (_, i) => (
        <span key={`empty-${i}`} />
      ))}
      {Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const iso = `${year}-${pad(month + 1)}-${pad(day)}`;
        return (
          <DayButton
            key={iso}
            label={day}
            isSelected={iso === selected}
            isMarked={markedDates.has(iso)}
            disabled={iso < firstSelectableDate}
            onClick={() => onSelect(iso)}
          />
        );
      })}
    </div>
  );
}

export function WeekStrip({
  selected,
  markedDates,
  firstSelectableDate,
  onSelect,
}: CalendarCommonProps) {
  const monday = startOfWeek(parseISO(selected), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) =>
    format(addDays(monday, i), "yyyy-MM-dd"),
  );

  return (
    <div className="grid grid-cols-7 gap-1 text-center">
      <WeekdayHeader />
      {days.map((iso) => (
        <DayButton
          key={iso}
          label={Number(iso.slice(8))}
          isSelected={iso === selected}
          isMarked={markedDates.has(iso)}
          disabled={iso < firstSelectableDate}
          onClick={() => onSelect(iso)}
        />
      ))}
    </div>
  );
}