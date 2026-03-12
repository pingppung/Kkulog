import { useState, useEffect } from "react";
import { useCalendar } from "../../features/calendar/useCalendar";
import CalendarLayout from "../../layouts/AppLayout";
import CalendarView from "../../features/calendar/CalendarView";
import Modal from "../../ui/Modal";
import EventForm from "../../features/calendar/EventForm";
import { invoke } from "@tauri-apps/api/core";
import { CalendarEvent } from "../../features/calendar/calendar.types";

//이벤트 흐름 제어
export default function CalendarPage() {

  const calendar = useCalendar();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWindowLocked, setIsWindowLocked] = useState(true);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const toggleWindowLock = async () => {
    const next = !isWindowLocked;
    setIsWindowLocked(next);
    try {
      await invoke("set_edit_mode", { isEdit: next });
    } catch (err) {
      console.warn("창 모드 변경 실패:", err);
    }
  };

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
    setIsModalOpen(false);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  }

  const windowControls = {
    isLocked: isWindowLocked,
    toggleLock: toggleWindowLock,
  };
  const eventEditor = {
    create: handleCreate,
    edit: handleEdit,
  };

  const handleSubmit = editingEvent
    ? calendar.updateEvent
    : calendar.addNewEvent;


  useEffect(() => {
    invoke("set_edit_mode", { isEdit: isWindowLocked });
  }, []);

  return (
    <div
      className="relative w-full h-full flex flex-col pt-20 bg-transparent transition-all duration-300"
    >
      {/* 상단 캐릭터 */}
      <div className="absolute -top-4.5 left-8 z-[100] pointer-events-none select-none">
        <img
          src="/c4.png"
          alt="figure"
          className="h-32 max-w-[50vw] w-auto drop-shadow-[0_5px_5px_rgba(0,0,0,0.2)]"
        />
      </div>


      <div
        data-tauri-drag-region={!isWindowLocked ? "true" : undefined}
        className={`w-full h-full bg-transparent font-SiganpyoR transition-all duration-300 }`} >

        <div className="window-shadow rounded-xl w-full h-full">
          <div className="window-frame flex flex-col rounded-xl text-zinc-100 overflow-hidden w-full h-full">

            {/* Calendar 그리드 */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <CalendarView
                calendar={calendar}
                windowControls={windowControls}
                eventEditor={eventEditor}
              />
            </div>

            {/* 일정에디터 모달 */}
            <Modal isOpen={isModalOpen} onClose={closeModal}>
              <EventForm
                event={editingEvent ?? undefined}
                baseDate={calendar.today}
                onDelete={handleDelete}
                onSubmit={handleSubmit}
                onClose={closeModal}
              />
            </Modal>
          </div>
        </div>
      </div>
    </div>
  );
}