export interface CalendarDay {
  date: Date;
  day: number;
  weekday: number;
  type: "prev" | "current" | "next";
}

export interface CalendarEvent {
  id?: number;
  title: string;
  start: Date;
  end: Date;
  color: string;
  memo?: string;
}

export interface EventSegment {
  eventId: number;
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
  onDelete: (eventId: number) => Promise<void> | void;
  onSubmit: (event: CalendarEvent) => Promise<void> | void;
  onClose: () => void;
}