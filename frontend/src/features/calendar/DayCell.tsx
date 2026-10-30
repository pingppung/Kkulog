interface DayCellProps {
  date: Date;
  type: 'current' | 'prev' | 'next';
  weekday: number;
  onOpen?: () => void;
  hiddenCount?: number;
}

const DayCell = ({ date, type, weekday, onOpen, hiddenCount = 0 }: DayCellProps) => {
  const day = date.getDate();
  const isCurrent = type === "current";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isToday = date.toDateString() === new Date().toDateString();

  // weekday + current/other → cell 상태 결정
  let cellVariant: string;

  if (weekday === 0) {
    cellVariant = isCurrent ? "day-cell--sun-current" : "day-cell--sun-other";
  } else if (weekday === 6) {
    cellVariant = isCurrent ? "day-cell--sat-current" : "day-cell--sat-other";
  } else {
    cellVariant = isCurrent ? "day-cell--weekday-current" : "day-cell--weekday-other";
  }

  const className = [
    "day-cell",
    cellVariant,
    isToday && "day-cell--today",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`${className} ${onOpen ? "cursor-pointer" : ""}`} onClick={onOpen}>
      {onOpen ? (
        <button type="button" className="calendar-day-number" onClick={(event) => { event.stopPropagation(); onOpen(); }}
          aria-label={`${date.toLocaleDateString("ko-KR")} 일정 보기`}>{day}</button>
      ) : <div className="calendar-day-number">{day}</div>}
      {onOpen && hiddenCount > 0 && (
        <button type="button" className="calendar-day-summary" onClick={(event) => { event.stopPropagation(); onOpen(); }}
          aria-label={`숨겨진 일정 ${hiddenCount}개. 전체 일정 보기`}>
          <span>+{hiddenCount}</span>
        </button>
      )}
      <div className="flex-1 w-full h-full min-h-0" />
    </div>
  );
};

export default DayCell;
