import { useState } from "react";
import { useCalendar } from "../../features/calendar/useCalendar";
import CalendarView from "../../features/calendar/CalendarView";
import Modal from "../../ui/Modal";
import EventForm from "../../features/calendar/EventForm";
import type { CalendarEvent } from "../../features/calendar/calendar.types";


//이벤트 흐름 제어
export default function CalendarPage() {

  const calendar = useCalendar();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const handleCreate = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleEdit = (eventId: number) => {
    const event = calendar.events.find(e => e.id === eventId);
    if (!event) return;

    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleDelete = async (eventId: number) => {
    await calendar.deleteEvent(eventId);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  }

  const eventEditor = {
    create: handleCreate,
    edit: handleEdit,
  };

  const handleSubmit = editingEvent
    ? calendar.updateEvent
    : calendar.addNewEvent;


  return (
    <div
      className="relative w-full h-full flex flex-col bg-transparent"
    >
      <div
        className="w-full h-full bg-transparent" >

        <div className="window-shadow rounded-xl w-full h-full">
          <div className="calendar-surface window-frame flex flex-col text-zinc-900 overflow-hidden w-full h-full">

            {/* Calendar 그리드 */}
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {calendar.error && <div role="alert" className="p-2 text-sm bg-red-950 text-white">
                {calendar.error}
                {calendar.error && <button className="ml-2 underline" onClick={calendar.reload}>다시 시도</button>}
              </div>}
              {calendar.loading && <div role="status" className="px-2 text-xs">일정 불러오는 중…</div>}
              <CalendarView
                calendar={calendar}
                eventEditor={eventEditor}
              />
            </div>

            {/* 일정에디터 모달 */}
            {isModalOpen && <Modal>
              <EventForm
                event={editingEvent ?? undefined}
                baseDate={calendar.today}
                onDelete={handleDelete}
                onSubmit={handleSubmit}
                onClose={closeModal}
              />
            </Modal>}
          </div>
        </div>
      </div>
    </div>
  );
}
