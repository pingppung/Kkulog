interface EventBarProps {
  eventId: string;

  title: string;
  color: string;

  colStart: number;
  span: number;
  row?: number;

  isSelected?: boolean;
  onSelect: (eventId: string) => void;
  onDoubleClick?: () => void;
}
export default function EventBar({
  eventId,
  title,
  color,
  colStart,
  span,
  row = 0,
  isSelected = false,
  onSelect,
  onDoubleClick
}: EventBarProps) {

  const start = colStart + 1;
  const end = start + span;

  return (
    <div
      className="relative pointer-events-auto cursor-pointer h-auto min-h-0 font-JayusiganR"
      style={{
        gridColumnStart: start,
        gridColumnEnd: end,
        gridRowStart: row + 1,
      }}
      onClick={() => onSelect(eventId)}
      onDoubleClick={onDoubleClick}
    >
      <div
        className={`event-bar-inner font-thin ${isSelected ? "selected" : ""}`}
        style={{ backgroundColor: color }}
      >
        <span className="truncate">{title}</span>
      </div>
    </div>
  );
}
