import { useState } from "react";
import { buildCalendarDays } from "./calendar.utils";
import DayCell from "./DayCell";
import EventBar from "./EventBar";

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

export default function MiniCalendarPreview() {
  const [today] = useState(() => new Date());
  const year = today.getFullYear();
  const month = today.getMonth();
  const days = buildCalendarDays(year, month);
  const weeks = Array.from({ length: days.length / 7 }, (_, index) => days.slice(index * 7, index * 7 + 7));

  return <section className="calendar-surface calendar-view mini-calendar" aria-label="캘린더 색상 미리보기">
    <header className="calendar-header">
      <strong>{year}년 {month + 1}월 <small>미리보기</small></strong>
      <span className="calendar-create-button">+ 새 일정</span>
    </header>
    <div className="calendar-grid-frame flex flex-col flex-1 min-h-0">
      <div className="calendar-weekday-header grid grid-cols-7 text-center flex-shrink-0">{weekdays.map(day => <div key={day}>{day}</div>)}</div>
      <div className="calendar-weeks flex-1 flex flex-col min-h-0">{weeks.map((week, index) => <div className="calendar-week relative" key={index}>
        <div className="grid grid-cols-7 h-full">{week.map(day => <DayCell key={day.date.toISOString()} {...day} />)}</div>
        <div className="absolute inset-0 grid grid-cols-7 min-h-0 pointer-events-none calendar-event-grid" inert>{week.map((day, col) => {
        const isToday = day.date.toDateString() === today.toDateString();
        const sample = day.type === "current" ? isToday ? "내 일정" : day.day === 8 ? "회의" : day.day === 16 ? "약속" : null : null;
        return sample ? <EventBar key={day.date.toISOString()} bar={{ eventId: day.day, title: sample, color: day.day === 16 ? "#be185d" : "#1d4ed8", colStart: col, span: 1, row: 0, weekIndex: index, isMultiDay: false, hasBackground: day.day !== 8 }} onSelect={() => {}} /> : null;
      })}</div>
      </div>)}</div>
    </div>
  </section>;
}
