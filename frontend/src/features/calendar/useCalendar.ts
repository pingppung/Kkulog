import { useEffect, useMemo, useRef, useState } from "react";
import { startOfDay } from "date-fns";
import { buildCalendarDays, splitEventByWeek } from "./calendar.utils";
import { fetchEvents, createEvent, updateEvent, deleteEvent } from "./api";
import { CalendarDay, CalendarEvent, EventBar } from "./calendar.types";

export function useCalendar() {
  /* ===== 오늘 ===== */
  const [today] = useState(() => startOfDay(new Date()));

  /* ===== 현재 보고 있는 연 / 월 ===== */
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  /* ===== 일정 ===== */
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  /* ===== 월 캐시 ===== */
  const monthCache = useRef<Map<string, CalendarEvent[]>>(new Map());

  /* ===== 날짜 그리드 ===== */

  const calendarDays: CalendarDay[] = useMemo(() => {
    return buildCalendarDays(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  const weeks: CalendarDay[][] = useMemo(() => {
    const result: CalendarDay[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      result.push(calendarDays.slice(i, i + 7));
    }
    return result;
  }, [calendarDays]);

  /* ===== 월 변경 시 range 기반 fetch ===== */

  useEffect(() => {
    if (!calendarDays.length) return;

    const monthKey = `${currentYear}-${currentMonth}`;

    // 1. 캐시에 있으면 서버 요청 안 함
    if (monthCache.current.has(monthKey)) {
      setEvents(monthCache.current.get(monthKey)!);
      return;
    }

    const gridStart = calendarDays[0].date;
    const gridEnd = calendarDays[calendarDays.length - 1].date;

    fetchEvents(gridStart, gridEnd).then(data => {
      const MAX_CACHE = 6;

      // 캐시 크기 제한
      if (monthCache.current.size >= MAX_CACHE) {
        const oldestKey = monthCache.current.keys().next().value;
        if (oldestKey !== undefined) {
          monthCache.current.delete(oldestKey);
        }
      }

      monthCache.current.set(monthKey, data);
      setEvents(data);
    });
  }, [currentYear, currentMonth]);
  /* ===== 현재 캘린더 범위에 보이는 일정 ===== */

  const visibleEvents = useMemo(() => {
    if (!events.length || !calendarDays.length) return [];

    const gridStart = calendarDays[0].date;
    const gridEnd = calendarDays[calendarDays.length - 1].date;

    return events.filter(ev => {
      return ev.start <= gridEnd && ev.end >= gridStart;
    });

  }, [events, calendarDays]);

  /* ===== 주 단위 분할 ===== */

  const segments = useMemo(() => {
    return visibleEvents.flatMap(ev =>
      splitEventByWeek(ev, calendarDays)
    );
  }, [visibleEvents, calendarDays]);

  /* ===== 이벤트 바 레이아웃 계산 ===== */

  const eventBars: EventBar[] = useMemo(() => {
    const bars: EventBar[] = [];

    segments.forEach(seg => {
      let row = 0;

      while (
        bars.some(
          b =>
            b.weekIndex === seg.weekIndex &&
            b.row === row &&
            !(
              seg.colStart + seg.span <= b.colStart ||
              b.colStart + b.span <= seg.colStart
            )
        )
      ) {
        row++;
      }

      bars.push({
        eventId: seg.eventId,
        title: seg.title,
        color: seg.color,
        weekIndex: seg.weekIndex,
        colStart: seg.colStart,
        span: seg.span,
        row,
      });
    });

    return bars;
  }, [segments]);

  /* ===== 월 이동 ===== */

  const prevMonth = () => {
    setCurrentMonth(m => {
      if (m === 0) {
        setCurrentYear(y => y - 1);
        return 11;
      }
      return m - 1;
    });
  };

  const nextMonth = () => {
    setCurrentMonth(m => {
      if (m === 11) {
        setCurrentYear(y => y + 1);
        return 0;
      }
      return m + 1;
    });
  };

  /* ===== 일정 CRUD ===== */

  const createEventHandler = async (event: CalendarEvent) => {
    const createdRaw = await createEvent(event);

    const created = {
      ...createdRaw,
      start: new Date(createdRaw.start),
      end: new Date(createdRaw.end),
    };

    setEvents(prev => [...prev, created]);

    const monthKey = `${currentYear}-${currentMonth}`;

    if (monthCache.current.has(monthKey)) {
      const cached = monthCache.current.get(monthKey)!;
      monthCache.current.set(monthKey, [...cached, created]);
    }

    console.log("created:", created);
    console.log("visible check:",
      created.start <= calendarDays[calendarDays.length - 1].date,
      created.end >= calendarDays[0].date
    );
  };

  const updateEventHandler = async (event: CalendarEvent) => {
    const updatedRaw = await updateEvent(event);

    const updated = {
      ...updatedRaw,
      start: new Date(updatedRaw.start),
      end: new Date(updatedRaw.end),
    };
    setEvents(prev =>
      prev.map(ev => (ev.id === updated.id ? updated : ev))
    );

    const monthKey = `${currentYear}-${currentMonth}`;

    if (monthCache.current.has(monthKey)) {
      const cached = monthCache.current.get(monthKey)!;

      const newCached = cached.map(ev =>
        ev.id === updated.id ? updated : ev
      );

      monthCache.current.set(monthKey, newCached);
    }
  };

  const deleteEventHandler = async (id: number) => {
    try {
      await deleteEvent(id); // api 호출

      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("삭제 실패", err);
    }
  };
  return {
    today,

    currentYear,
    currentMonth,
    weeks,

    events,
    eventBars,

    selectedEventId,
    setSelectedEventId,

    prevMonth,
    nextMonth,

    addNewEvent: createEventHandler,
    updateEvent: updateEventHandler,
  };
}
