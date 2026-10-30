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
  hasBackground?: boolean;
}

export interface EventSegment {
  eventId: number;
  title: string;
  color: string;
  isMultiDay: boolean;
  hasBackground: boolean;
  weekIndex: number;
  colStart: number;
  span: number;
}

export interface EventBar extends EventSegment {
  row: number;
}

