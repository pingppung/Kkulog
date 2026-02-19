export interface CalendarDay {
  date: Date;
  day: number;
  weekday: number;
  type: "prev" | "current" | "next";
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
  description?: string;
}

export interface EventSegment {
  eventId: string;
  title: string;
  color: string;
  weekIndex: number;
  colStart: number;
  span: number;
}

export interface EventBar extends EventSegment {
  row: number;
}

export interface EventFormProps {
  event?: CalendarEvent;
  baseDate: Date;
  onSubmit: (event: CalendarEvent) => Promise<void> | void;
  onClose: () => void;
}