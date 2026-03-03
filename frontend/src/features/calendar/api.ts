import axios from "axios";
import { CalendarEvent } from "./calendar.types";

const api = axios.create({
  baseURL: "http://localhost:4000/api",
});


// 일정 목록 조회
// 수정 전 : events 전체를 받아 클라이언트가 걸러냄
// 수정 후 : 화면에 보이는 날짜 범위와 "겹치는 이벤트만" 반환받음
// 월 단위 간단 캐시에 저장해서 확인 후 없으면 요청
// 월 변경
//    ↓
// calendarDays 계산
//    ↓
// gridStart / gridEnd 계산
//    ↓
// monthCache에 있는지 확인
//    ↓
// 있으면 → setEvents
// 없으면 → fetchEvents(start, end)
//             ↓
//          캐시에 저장
// 문제 : 이벤트 수 적고 , 사용자 적고, 로컬이라서 전부 메모리에 쌓여도 ㄱㅊ 
//그런데 확장성 관점에서는 메모리 증가 문제 발생할 수 있음 
export async function fetchEvents(
  start: Date,
  end: Date
): Promise<CalendarEvent[]> {
  const res = await api.get<CalendarEvent[]>("/events", {
    params: {
      start: start.toISOString(),
      end: end.toISOString(),
    },
  });
  return res.data.map((ev: any) => ({
    ...ev,
    start: new Date(ev.start),
    end: new Date(ev.end),
  }));
}

// 일정 추가
export async function createEvent(
  eventData: CalendarEvent
): Promise<CalendarEvent> {
  const res = await api.post<CalendarEvent>(
    "/events",
    eventData
  );
  return res.data;
}

// 일정 수정
export async function updateEvent(
  event: CalendarEvent
): Promise<CalendarEvent> {
  if (!event.id) {
    throw new Error("Event id is required for update");
  }

  const res = await api.put<CalendarEvent>(
    `/events/${event.id}`,
    event
  );
  return res.data;
}

// 일정 삭제
export async function deleteEvent(id: number): Promise<void> {
  await api.delete(`/events/${id}`);
}