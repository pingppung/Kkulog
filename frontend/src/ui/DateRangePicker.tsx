import { DayPicker } from "react-day-picker";
import { ko } from "date-fns/locale"
import "react-day-picker/dist/style.css";

interface DateRangePickerProps {
  initialDate?: Date;
  onSelect: (date: Date | undefined) => void;

  isRange: boolean;
  pickerTarget: "start" | "end" | null;
  startDate: Date;
  endDate: Date;
}

export default function DateRangePicker({
  initialDate,
  onSelect,
  isRange,
  pickerTarget,
  startDate,
  endDate,
}: DateRangePickerProps) {

  return (
    <div className="relative bg-white rounded-lg shadow-lg p-3 ">
      <DayPicker
        mode="single"
        captionLayout="dropdown"
        selected={initialDate}
        onSelect={onSelect}
        locale={ko}
        className="date-picker"
        disabled={
          isRange
            ? pickerTarget === "end"
              ? { before: startDate }   // 종료일은 시작일 이전 금지
              : pickerTarget === "start"
                ? { after: endDate }    // 시작일은 종료일 이후 금지
                : undefined
            : undefined                 // 단일 일정이면 제한 없음
        }
      />
    </div>
  )
}
