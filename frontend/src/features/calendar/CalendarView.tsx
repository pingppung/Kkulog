import { useEffect, useMemo, useState } from "react";
import DayCell from "./DayCell";
import EventBar from "./EventBar";
import { useCalendar } from "./useCalendar";
import { Home, ArrowRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CalendarViewProps {
  calendar: ReturnType<typeof useCalendar>;

  windowControls: {
    isLocked: boolean;
    toggleLock: () => void;
  };

  eventEditor: {
    create: () => void;
    edit: (eventId: number) => void;
  };
}

// 달력 ui
export default function CalendarView({
  calendar,
  windowControls,
  eventEditor,
}: CalendarViewProps) {

  const {
    currentYear,
    currentMonth,
    weeks,
    eventBars,
    prevMonth,
    nextMonth,
    selectedEventId,
    setSelectedEventId,
  } = calendar;

  const [maxRows, setMaxRows] = useState(5);
  const { isLocked, toggleLock } = windowControls;
  const { create: handleCreate, edit: handleEdit } = eventEditor;


  const navigate = useNavigate();


  const updateMaxRows = () => {
    const h = window.innerHeight;

    if (h > 950) setMaxRows(10);
    else if (h > 900) setMaxRows(9);
    else if (h > 800) setMaxRows(8);  
    else if (h > 750) setMaxRows(7);
    else if (h > 650) setMaxRows(6);
    else setMaxRows(5);
  };

  //이미 만들어진 bar들을 주별로 그룹화
  const eventBarsByWeek = useMemo(() => {
    const map: Record<number, typeof eventBars> = {};

    for (const bar of eventBars) {
      if (bar.row >= maxRows) continue; //daycell마다 이벤트 maxRows개만 렌더링

      if (!map[bar.weekIndex]) {
        map[bar.weekIndex] = [];
      }

      map[bar.weekIndex].push(bar);
    }

    return map;
  }, [eventBars, maxRows]);



  useEffect(() => {
    updateMaxRows();

    window.addEventListener("resize", updateMaxRows);

    return () => {
      window.removeEventListener("resize", updateMaxRows);
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* 헤더 */}
      <div className={`relative flex items-center h-9 px-2 flex-shrink-0 bg-zinc-900/70 backdrop-blur-md border-b border-white/10 ${isLocked ? 'drag cursor-move' : ''}`}>
        <Home
          size={24}
          className="cursor-pointer"
          onClick={() => navigate("/")}
        />
        {/* 가운데 년/월 */}
        < h2 className="absolute left-1/2 -translate-x-1/2 text-sm font-thin">
          {currentYear}년 {currentMonth + 1}월
        </h2>

        {/* 오른쪽 버튼 그룹 */}
        <div className="ml-auto flex items-center gap-1">
          <button
            className="nav-btn no-drag"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleLock();
            }}
          >
            {isLocked ? "🔓" : "🔒"}
          </button>
          <button
            className="add-btn no-drag"
            onClick={handleCreate}
          >
            ＋
          </button>

          <button className="nav-btn" onClick={prevMonth}><ArrowLeft size={24} /></button>
          <button className="nav-btn" onClick={nextMonth}><ArrowRight size={24} /></button>
        </div>
      </div>


      {/* 요일헤더 */}
      <div className="grid grid-cols-7 text-center text-xs font-thin py-1 flex-shrink-0 bg-zinc-900/50 border-b border-white/10">
        <div className="text-red-500">SUN</div>
        <div>MON</div>
        <div>TUE</div>
        <div>WED</div>
        <div>THU</div>
        <div>FRI</div>
        <div className="text-blue-500">SAT</div>
      </div>

      {/* 날짜 + 이벤트  */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="relative flex-1 min-h-0">
            <div className="grid grid-cols-7 h-full">
              {week.map(day => (
                <DayCell key={day.date.toISOString()} {...day} />
              ))}
            </div>

            <div className="absolute pt-4 inset-0 grid grid-cols-7 min-h-0 pointer-events-none calendar-event-grid">
              {(eventBarsByWeek[weekIdx] || []).map(bar => (
                <EventBar
                  key={`${bar.eventId}-${bar.weekIndex}-${bar.row}`}
                  eventId={bar.eventId}
                  title={bar.title}
                  color={bar.color}
                  colStart={bar.colStart}
                  span={bar.span}
                  row={bar.row}
                  isSelected={bar.eventId === selectedEventId}
                  onSelect={setSelectedEventId}
                  onDoubleClick={() => handleEdit(bar.eventId)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}