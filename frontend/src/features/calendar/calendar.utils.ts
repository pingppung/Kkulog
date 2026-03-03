import { CalendarDay, EventSegment, CalendarEvent } from "./calendar.types";

export function buildCalendarDays(
  year: number,
  month: number
): CalendarDay[] {

  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - firstDay.getDay());

  const lastDay = new Date(year, month + 1, 0);
  const endDate = new Date(lastDay);
  endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

  const days: CalendarDay[] = [];
  let cur = new Date(startDate);

  while (cur <= endDate) {
    const date = new Date(cur);

    let type: "prev" | "current" | "next" = "current";
    if (
      date.getFullYear() < year ||
      (date.getFullYear() === year && date.getMonth() < month)
    ) {
      type = "prev";
    } else if (
      date.getFullYear() > year ||
      (date.getFullYear() === year && date.getMonth() > month)
    ) {
      type = "next";
    }

    days.push({
      date,
      day: date.getDate(),
      weekday: date.getDay(),
      type,
    });

    cur.setDate(cur.getDate() + 1);
  }

  return days;
}

function toYMD(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function splitEventByWeek(
  event: CalendarEvent,
  calendarDays: CalendarDay[]
): EventSegment[] {

  const segments: EventSegment[] = [];

  const eventStart = toYMD(event.start);
  const eventEnd   = toYMD(event.end);

  let startIndex = -1;
  let endIndex = -1;

  calendarDays.forEach((d, i) => {
    const day = toYMD(d.date);
    
    if (day >= eventStart && startIndex === -1) startIndex = i;
    if (day <= eventEnd) endIndex = i;
  });

  if (startIndex === -1 || endIndex === -1) return segments;

  let cur = startIndex;

  while (cur <= endIndex) {
    const weekIndex = Math.floor(cur / 7);
    const weekStartIndex = weekIndex * 7;
    const weekEndIndex = weekStartIndex + 6;

    const segmentStartIndex = Math.max(cur, weekStartIndex);
    const segmentEndIndex = Math.min(weekEndIndex, endIndex);

    segments.push({
      eventId: event.id!,
      title: event.title,
      color: event.color,
      weekIndex,
      colStart: calendarDays[segmentStartIndex].weekday,
      span: segmentEndIndex - segmentStartIndex + 1,
    });
    cur = weekEndIndex + 1;
  }
  return segments;
}
