import type { EventBar as CalendarEventBar } from "./calendar.types";

interface EventBarProps {
  bar: CalendarEventBar;
  isSelected?: boolean;
  onSelect: (eventId: number) => void;
  onDoubleClick?: () => void;
}
export default function EventBar({
  bar,
  isSelected = false,
  onSelect,
  onDoubleClick
}: EventBarProps) {
  const { eventId, title, color, colStart, span, row, isMultiDay, hasBackground } = bar;
  const showBackground = isMultiDay || hasBackground;
  const start = colStart + 1;
  const end = start + span;

  return (
    <div
      className="calendar-event-bar relative pointer-events-none h-auto min-h-0"
      style={{
        gridColumnStart: start,
        gridColumnEnd: end,
        gridRowStart: row + 1,
      }}
      onClick={() => onSelect(eventId)}
      onDoubleClick={onDoubleClick}
      title={title}
    >
      <div
        className={`event-bar-inner pointer-events-auto cursor-pointer ${showBackground ? "event-bar-inner--filled" : "event-bar-inner--single"} ${isSelected ? "selected" : ""}`}
        style={{ backgroundColor: showBackground ? color : "transparent" }}
      >
        <i className="event-color-marker" style={{ backgroundColor: showBackground ? `color-mix(in srgb, ${color} 75%, black)` : color }} aria-hidden="true" />
        <span className="truncate">{title}</span>
      </div>
    </div>
  );
}
