import { useCallback, useEffect, useMemo, useState } from "react";
import { startOfDay } from "date-fns";
import { buildCalendarDays } from "./calendar.utils";
import { fetchEvents, createEvent, updateEvent, deleteEvent } from "./api";
import { createLatestRequest } from "./latestRequest";
import type { CalendarEvent } from "./calendar.types";

export function useCalendar() {
  // 화면에서 사용하는 상태
  const [today, setToday] = useState(() => startOfDay(new Date()));
  const [month, setMonth] = useState(() => {
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [requests] = useState(createLatestRequest);
  const [refreshCount, setRefreshCount] = useState(0);

  // 현재 달에 표시할 날짜를 만들고 7일씩 나눕니다.
  const currentYear = month.getFullYear();
  const currentMonth = month.getMonth();

  const calendarDays = useMemo(() => {
    return buildCalendarDays(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  const weeks = useMemo(() => {
    const result = [];

    for (let index = 0; index < calendarDays.length; index += 7) {
      const week = calendarDays.slice(index, index + 7);
      result.push(week);
    }

    return result;
  }, [calendarDays]);

  const reload = useCallback(() => {
    requests.invalidate();
    // 숫자를 바꾸면 아래 일정 조회가 다시 실행됩니다.
    setRefreshCount(count => count + 1);
  }, [requests]);

  // 앱을 계속 켜 두어도 오늘 날짜가 바뀌도록 처리합니다.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    function updateToday() {
      clearTimeout(timer);

      const now = new Date();
      const newToday = startOfDay(now);

      setToday(previousToday => {
        if (previousToday.getTime() === newToday.getTime()) {
          return previousToday;
        }
        return newToday;
      });

      const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      );
      const delay = nextMidnight.getTime() - now.getTime() + 50;
      timer = setTimeout(updateToday, delay);
    }

    updateToday();
    window.addEventListener("focus", updateToday);
    document.addEventListener("visibilitychange", updateToday);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("focus", updateToday);
      document.removeEventListener("visibilitychange", updateToday);
    };
  }, []);

  // 표시하는 달이 바뀌거나 새로고침하면 일정을 조회합니다.
  useEffect(() => {
    const startDate = calendarDays[0].date;
    const endDate = calendarDays[calendarDays.length - 1].date;

    setLoading(true);
    setError(null);
    setEvents([]);
    setSelectedEventId(null);

    requests.run(() => fetchEvents(startDate, endDate), {
      success: data => {
        setEvents(data);
      },
      failure: reason => {
        setError("일정을 불러오지 못했습니다: " + String(reason));
      },
      complete: () => {
        setLoading(false);
      },
    });

    return () => {
      requests.invalidate();
    };
  }, [calendarDays, refreshCount, requests]);

  function moveMonth(offset: number) {
    requests.invalidate();
    setMonth(previousMonth => {
      return new Date(
        previousMonth.getFullYear(),
        previousMonth.getMonth() + offset,
        1
      );
    });
  }

  function prevMonth() {
    moveMonth(-1);
  }

  function nextMonth() {
    moveMonth(1);
  }

  function goToToday() {
    const currentDate = startOfDay(new Date());
    setToday(currentDate);
    setMonth(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
    reload();
  }

  // 저장이 성공하면 현재 화면의 일정을 다시 불러옵니다.
  async function addNewEvent(event: CalendarEvent) {
    await createEvent(event);
    reload();
  }

  async function updateEventHandler(event: CalendarEvent) {
    await updateEvent(event);
    reload();
  }

  async function deleteEventHandler(id: number) {
    await deleteEvent(id);
    reload();
  }

  return {
    today,
    currentYear,
    currentMonth,
    calendarDays,
    weeks,
    events,
    selectedEventId,
    setSelectedEventId,
    loading,
    error,
    reload,
    prevMonth,
    nextMonth,
    goToToday,
    addNewEvent,
    updateEvent: updateEventHandler,
    deleteEvent: deleteEventHandler,
  };
}
