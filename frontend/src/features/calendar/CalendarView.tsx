import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import DayCell from "./DayCell";
import EventBar from "./EventBar";
import { buildEventBars } from "./calendar.utils";
import Modal from "../../ui/Modal";
import type { CalendarEvent } from "./calendar.types";
import type { useCalendar } from "./useCalendar";
import { ChevronRight, ChevronLeft, RefreshCw, Search, Plus, X, Settings } from "lucide-react";
import { Link } from "react-router-dom";

interface CalendarViewProps {
  calendar: ReturnType<typeof useCalendar>;

  eventEditor: {
    create: () => void;
    edit: (eventId: number) => void;
  };
}

const COMPACT_QUERY = "(max-width: 480px), (height < 500px)";

// 캘린더 화면
export default function CalendarView({
  calendar,
  eventEditor,
}: CalendarViewProps) {

  const {
    currentYear,
    currentMonth,
    weeks,
    events,
    calendarDays,
    prevMonth,
    nextMonth,
    goToToday,
    selectedEventId,
    setSelectedEventId,
  } = calendar;

  const [visibleRows, setVisibleRows] = useState<number[]>([]);
  const weeksRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [isCompact, setIsCompact] = useState(() => window.matchMedia(COMPACT_QUERY).matches);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const filteredEvents = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return events;
    return events.filter(event =>
      (event.title + " " + (event.memo ?? "")).toLocaleLowerCase().includes(query)
    );
  }, [events, search]);

  const eventBars = useMemo(() => {
    const barEvents = isCompact
      ? filteredEvents.filter(event => event.hasBackground || event.start.toDateString() !== event.end.toDateString())
      : filteredEvents;
    return buildEventBars(barEvents, calendarDays);
  }, [filteredEvents, calendarDays, isCompact]);
  const { create: handleCreate, edit: handleEdit } = eventEditor;

  // 화면에 들어가는 막대만 주별로 묶기
  const eventBarsByWeek = useMemo(() => {
    const map: Record<number, typeof eventBars> = {};

    for (const bar of eventBars) {
      if (bar.row >= (visibleRows[bar.weekIndex] ?? 0)) continue;

      if (!map[bar.weekIndex]) {
        map[bar.weekIndex] = [];
      }

      map[bar.weekIndex].push(bar);
    }

    return map;
  }, [eventBars, visibleRows]);

  const daySummaries = useMemo(() => {
    const summaries: Record<string, { events: CalendarEvent[]; hiddenCount: number }> = {};

    for (let index = 0; index < calendarDays.length; index++) {
      const date = calendarDays[index].date;
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
      const dayEvents = filteredEvents.filter(event => event.start <= dayEnd && event.end >= dayStart);

      // 날짜별 전체 일정에서 실제 표시된 일정만 제외
      const weekIndex = Math.floor(index / 7);
      const column = index % 7;
      const visibleBars = eventBarsByWeek[weekIndex] ?? [];
      const visibleIds = new Set(visibleBars
        .filter(bar => bar.colStart <= column && column < bar.colStart + bar.span)
        .map(bar => bar.eventId));
      const hiddenCount = dayEvents.length - visibleIds.size;

      summaries[date.toDateString()] = { events: dayEvents, hiddenCount };
    }
    return summaries;
  }, [calendarDays, filteredEvents, eventBarsByWeek]);

  const selectedDay = selectedDate ? daySummaries[selectedDate.toDateString()] : null;

  useEffect(() => {
    const media = window.matchMedia(COMPACT_QUERY);
    const updateCompact = () => {
      setIsCompact(media.matches);
      setSelectedDate(null);
    };
    media.addEventListener("change", updateCompact);
    return () => media.removeEventListener("change", updateCompact);
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedDate(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedDate]);

  useLayoutEffect(() => {
    const container = weeksRef.current;
    if (!container) return;

    const updateVisibleRows = () => {
      const height = window.innerHeight;
      let limit = 2;
      if (height >= 950) limit = 6;
      else if (height >= 750) limit = 5;
      else if (height >= 600) limit = 4;
      else if (height >= 500) limit = 3;
      if (isCompact) limit = 2;

      // 날짜 여백을 뺀 높이로 잘리지 않고 들어가는 줄 수 계산
      const grids = container.querySelectorAll<HTMLElement>(".calendar-event-grid");
      const nextRows = Array.from(grids, grid => {
        const style = window.getComputedStyle(grid);
        const rowHeight = parseFloat(style.gridAutoRows);
        const gap = parseFloat(style.rowGap) || 0;
        const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
        const availableHeight = grid.getBoundingClientRect().height - padding - 1;
        const rowsThatFit = Math.max(0, Math.floor((availableHeight + gap) / (rowHeight + gap)));
        return Math.min(limit, rowsThatFit);
      });

      setVisibleRows(previous => {
        if (previous.length === nextRows.length && previous.every((count, index) => count === nextRows[index])) {
          return previous;
        }
        return nextRows;
      });
    };

    updateVisibleRows();
    const observer = new ResizeObserver(updateVisibleRows);
    observer.observe(container);
    window.addEventListener("resize", updateVisibleRows);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateVisibleRows);
    };
  }, [isCompact, weeks.length]);

  return (
    <div className={`calendar-view ${isCompact ? "calendar-view--compact" : ""} w-full flex-1 min-h-0 flex flex-col relative`}>
      <header className="calendar-header">
        <div data-tauri-drag-region="true" className="calendar-toolbar cursor-move">
          <h2 className="pointer-events-none" aria-live="polite">{currentYear}년 {currentMonth + 1}월</h2>
          <div data-tauri-drag-region="true" className="calendar-navigation">
            <button type="button" className="calendar-toolbar-button no-drag" aria-label="이전 달" onClick={prevMonth}><ChevronLeft size={17} /></button>
            <button type="button" className="calendar-toolbar-button no-drag" aria-label="다음 달" onClick={nextMonth}><ChevronRight size={17} /></button>
          </div>
          <div className="calendar-view-buttons no-drag" role="group" aria-label="캘린더 보기">
            <button type="button" className="is-active" aria-pressed="true">월</button>
            <button type="button" disabled title="주간 보기 준비 중">주</button>
            <button type="button" disabled title="일간 보기 준비 중">일</button>
          </div>
          <button type="button" className="calendar-today-button no-drag" title="오늘이 포함된 달로 이동" onClick={goToToday}>오늘</button>
          <button type="button" className="calendar-toolbar-button no-drag" aria-label="일정 새로고침" title="일정 새로고침" onClick={calendar.reload}>
            <RefreshCw size={15} />
          </button>
          <div className="calendar-search no-drag">
            <Search size={15} aria-hidden="true" />
            <input aria-label="현재 표시 기간의 일정 검색" placeholder="일정 검색"
              value={search} onChange={event => setSearch(event.target.value)} />
            {search && <button type="button" aria-label="검색 지우기" onClick={() => setSearch("")}><X size={14} /></button>}
          </div>
          <button type="button" className="calendar-create-button no-drag" aria-label="일정 추가" title="일정 추가" onClick={handleCreate}>
            <Plus size={17} /><span>새 일정</span>
          </button>
          <Link to="/settings" className="calendar-toolbar-button no-drag" aria-label="설정 열기" title="설정">
            <Settings size={17} aria-hidden="true" />
          </Link>
        </div>
        {search.trim() && <p role="status" className="calendar-search-status">
          현재 표시 기간에서 {filteredEvents.length}개의 일정을 찾았습니다.
        </p>}
      </header>

      {/* 요일 헤더 */}
      <div className="calendar-grid-frame flex flex-col flex-1 min-h-0">
      <div className="calendar-weekday-header grid grid-cols-7 text-center flex-shrink-0">
        <div>일</div>
        <div>월</div>
        <div>화</div>
        <div>수</div>
        <div>목</div>
        <div>금</div>
        <div>토</div>
      </div>

      {/* 날짜와 일정 */}
      <div ref={weeksRef} className="calendar-weeks flex-1 flex flex-col min-h-0">
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="calendar-week relative">
            <div className="grid grid-cols-7 h-full">
              {week.map(day => (
                <DayCell key={day.date.toISOString()} {...day}
                  onOpen={() => setSelectedDate(day.date)}
                  hiddenCount={daySummaries[day.date.toDateString()]?.hiddenCount ?? 0}
                />
              ))}
            </div>

            <div className="absolute inset-0 grid grid-cols-7 min-h-0 pointer-events-none calendar-event-grid">
              {(eventBarsByWeek[weekIdx] || []).map(bar => (
                <EventBar
                  key={`${bar.eventId}-${bar.weekIndex}`}
                  bar={bar}
                  isSelected={bar.eventId === selectedEventId}
                  onSelect={setSelectedEventId}
                  onDoubleClick={() => handleEdit(bar.eventId)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      </div>
      {selectedDate && selectedDay && (
        <Modal label="날짜별 일정 목록">
          <div className="calendar-day-list">
            <header>
              <div>
                <h2>{selectedDate.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" })}</h2>
                <p>일정 {selectedDay.events.length}개{search.trim() ? " · 검색 결과" : ""}</p>
              </div>
              <button type="button" aria-label="일정 목록 닫기" autoFocus onClick={() => setSelectedDate(null)}><X size={20} /></button>
            </header>
            <div className="calendar-day-list-items">
              {selectedDay.events.length === 0 && <p className="calendar-day-list-empty">등록된 일정이 없습니다.</p>}
              {selectedDay.events.map(event => (
                <button type="button" key={event.id} onClick={() => {
                  setSelectedDate(null);
                  if (event.id !== undefined) handleEdit(event.id);
                }}>
                  <i style={{ backgroundColor: event.color }} aria-hidden="true" />
                  <span>{event.title}</span>
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
