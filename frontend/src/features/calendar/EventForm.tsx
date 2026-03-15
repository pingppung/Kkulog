import { useState, useRef, useEffect } from "react";
import { EventFormProps } from "./calendar.types";
import DateRangePicker from "../../ui/DateRangePicker";
import { Trash2 } from "lucide-react";

type PickerTarget = "start" | "end" | null;

export default function EventForm({
  event,
  baseDate,
  onDelete,
  onSubmit,
  onClose,
}: EventFormProps) {

  /* ===================== refs ===================== */
  const startRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  /* ===================== state ===================== */
  const [title, setTitle] = useState("");
  const isValid = title.trim().length > 0;

  const [memo, setMemo] = useState("");
  const [color, setColor] = useState("#4F46E5");

  const [isRange, setIsRange] = useState(false); //기간 일정인지 , 당일 일정인지 
  const [startDate, setStartDate] = useState(
    event ? event.start : baseDate
  );

  const [endDate, setEndDate] = useState(
    event ? event.end : baseDate
  );

  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);

  /* ===================== utils ===================== */
  const formatKoreanDate = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = date.toLocaleDateString("ko-KR", { weekday: "short" });
    return `${month}월 ${day}일 (${weekday})`;
  };

  const formatKoreanTime = (date: Date) =>
    date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  /* ===================== handlers ===================== */
  const handleSave = async () => {
    let finalEndDate = endDate;

    if (!isRange) {
      finalEndDate = new Date(startDate);
      finalEndDate.setHours(23, 59, 59, 999);
    }

    const newEvent = {
      ...(event ? { id: event.id } : {}),
      title,
      memo: memo,
      color,
      start: startDate,
      end: finalEndDate,
    };
    console.log(newEvent);
    await onSubmit(newEvent);
    onClose();
  };



  const getPickerPosition = () => {
    const targetEl =
      pickerTarget === "start"
        ? startRef.current
        : pickerTarget === "end"
          ? endRef.current
          : null;

    if (!targetEl) return null;

    const rect = targetEl.getBoundingClientRect();
    const parentRect =
      targetEl.offsetParent?.getBoundingClientRect();

    if (!parentRect) return null;
    return {
      top: rect.bottom - parentRect.top + 4,
      // left: rect.left - parentRect.left,
    };
  };

  const pickerPosition = getPickerPosition();


  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) return;

    if (pickerTarget === "start") {
      // 기존 startDate의 '시간'은 유지하고 '날짜'만 변경하는 로직이 필요할 수 있음
      const updatedDate = new Date(startDate);
      updatedDate.setFullYear(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
      setStartDate(updatedDate);
    } else if (pickerTarget === "end") {
      const updatedDate = new Date(endDate);
      updatedDate.setFullYear(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
      setEndDate(updatedDate);
    }

    // 날짜 선택 후 피커 닫기 (선택 사항)
    setPickerTarget(null);
  };

  const handleDelete = async () => {
    if (!event) return;

    const ok = window.confirm("이 일정을 삭제하시겠습니까?");
    if (!ok) return;
    await onDelete(event.id!); 
    onClose();
  };
  /* ===================== effects ===================== */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!pickerRef.current) return;
      if (!pickerRef.current.contains(e.target as Node)) {
        setPickerTarget(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setMemo(event.memo ?? "");
      setColor(event.color);
      setStartDate(event.start);
      setEndDate(event.end);

      const isMultiDay =
        event.start.toDateString() !== event.end.toDateString();

      setIsRange(isMultiDay);
    }

  }, [event]);
  return (
    <div className="flex flex-col h-full p-4 text-black min-h-0">

      {/* header */}
      <header className="flex justify-between items-center pb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {event ? "일정 수정" : "새 일정"}
        </h2>

        <div className="flex items-center gap-3">
          {event && (
            <button
              onClick={handleDelete}
              className="text-red-400 hover:text-red-600 transition cursor-pointer"
            >
              <Trash2 size={20} />
            </button>
          )}

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
          >
            ✕
          </button>
        </div>
      </header>

      {/* Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-1">

        {/* 제목 */}
        <div>
          <input
            className="w-full bg-[#F3F4FA] rounded-2xl px-4 py-3 text-base
                       placeholder-gray-400 outline-none
                       focus:ring-2 focus:ring-inset focus:ring-[#DADCF7] transition"
            placeholder="오늘의 일정은?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </div>

        {/* 날짜 카드 */}
        <div className="relative bg-[#F9FAFF] rounded-2xl px-4 py-4 space-y-3">

          {/* 상단: 날짜 */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">날짜</span>

            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <div
                ref={startRef}
                onClick={() => setPickerTarget("start")}
                className="cursor-pointer hover:text-gray-900 transition"
              >
                {formatKoreanDate(startDate)}
              </div>

              {isRange && (
                <>
                  <span className="text-gray-300">—</span>
                  <div
                    ref={endRef}
                    onClick={() => setPickerTarget("end")}
                    className="cursor-pointer hover:text-gray-900 transition"
                  >
                    {formatKoreanDate(endDate)}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 보조 옵션 */}
          <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isRange}
              onChange={(e) => setIsRange(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 accent-gray-600"
            />
            종료일 포함
          </label>

          {/* DatePicker */}
          {pickerTarget && pickerPosition && (
            <div
              ref={pickerRef}
              className="absolute right-0 z-[9999]"
              style={pickerPosition}
            >
              <DateRangePicker
                initialDate={
                  pickerTarget === "start" ? startDate : endDate
                }
                onSelect={handleDateSelect}
                isRange={isRange}
                pickerTarget={pickerTarget}
                startDate={startDate}
                endDate={endDate}
              />
            </div>
          )}
        </div>



        {/* 색상 선택 */}
        <div className="bg-[#FFF7F3] rounded-2xl px-4 py-3 flex justify-between items-center">
          <span className="text-sm text-gray-500">색상</span>
          <input
            type="color"
            className="w-8 h-8 rounded-full border-none cursor-pointer"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>
        {/* 메모 */}
        <div>
          <textarea
            className="w-full bg-[#F3F4FA] rounded-2xl px-4 py-3 text-sm 
                     placeholder-gray-400 resize-none outline-none
                     focus:ring-2 focus:ring-[#DADCF7] transition"
            placeholder="메모를 남겨보세요 ✎"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </div>
        {/* 버튼 */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-gray-100 
                     text-gray-500 font-medium hover:bg-gray-200 transition"
          >
            취소
          </button>

          <button
            onClick={handleSave}
            disabled={!isValid}
            className={`flex-1 py-3 rounded-2xl font-semibold transition
                ${isValid
                ? "bg-indigo-500 text-white shadow-md hover:bg-indigo-600"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }
              `}
          >
            {event ? "수정하기" : "저장하기"}
          </button>
        </div>
      </div >

    </div>

  );

}