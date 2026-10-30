import { invoke } from "@tauri-apps/api/core";
import { addDays, startOfDay } from "date-fns";
import type { CalendarEvent } from "./calendar.types";
// DB에서 가져온 날짜는 Date 객체가 아니라 문자열입니다.
interface SavedEvent {
  id: number;
  title: string;
  memo: string | null;
  start: string;
  end: string;
  color: string;
  hasBackground: boolean;
}

// 일정 목록 조회
// 수정 전 : events 전체를 받아 클라이언트가 걸러냄
// 수정 후 : 화면에 보이는 날짜 범위와 "겹치는 이벤트만" 반환받음
// 월 변경 → calendarDays 계산 → gridStart / gridEnd 계산 → fetchEvents(start, end)
// 기존 월별 캐시는 제거하고 현재 화면의 일정만 메모리에 보관합니다.
export async function fetchEvents(
  start: Date,
  end: Date
): Promise<CalendarEvent[]> {
  const rangeStart = startOfDay(start);
  // 마지막 날 오후 일정도 포함하도록 다음 날 0시까지 조회합니다.
  const rangeEnd = addDays(startOfDay(end), 1);

  const events = await invoke<SavedEvent[]>("fetch_events", {
    start: rangeStart.toISOString(),
    end: rangeEnd.toISOString(),
  });

  return events.map(event => ({
    ...event,
    memo: event.memo ?? undefined,
    start: new Date(event.start),
    end: new Date(event.end),
  }));
}

// 일정 추가
export async function createEvent(
  eventData: CalendarEvent
): Promise<CalendarEvent> {
  // invoke는 서버 요청 대신 앱 내부의 Rust 함수를 호출합니다.
  const savedEvent = await invoke<SavedEvent>("create_event", {
    event: {
      ...eventData,
      start: eventData.start.toISOString(),
      end: eventData.end.toISOString(),
    },
  });

  return {
    ...savedEvent,
    memo: savedEvent.memo ?? undefined,
    start: new Date(savedEvent.start),
    end: new Date(savedEvent.end),
  };
}

// 일정 수정
export async function updateEvent(
  event: CalendarEvent
): Promise<CalendarEvent> {
  if (!event.id) {
    throw new Error("수정할 일정 ID가 없습니다.");
  }

  const savedEvent = await invoke<SavedEvent>("update_event", {
    event: {
      ...event,
      start: event.start.toISOString(),
      end: event.end.toISOString(),
    },
  });

  return {
    ...savedEvent,
    memo: savedEvent.memo ?? undefined,
    start: new Date(savedEvent.start),
    end: new Date(savedEvent.end),
  };
}

// 일정 삭제
export async function deleteEvent(id: number): Promise<void> {
  await invoke("delete_event", { id });
}
