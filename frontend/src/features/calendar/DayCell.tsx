interface DayCellProps {
  date: Date;
  type: 'current' | 'prev' | 'next';
  weekday: number;
}

const DayCell = ({ date, type, weekday }: DayCellProps) => {
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
    <div className={className}>
      <div className="font-hakgyo">
        {day}
      </div>
      <div className="flex-1 w-full h-full min-h-0" />
    </div>
  );
};

export default DayCell;
