import { useState, useEffect } from "react";

export default function ScheduleForm({ selectedDate, onAddEvent, onClose }) {

  const [isRange, setIsRange] = useState(false);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(selectedDate);
  const [endDate, setEndDate] = useState(selectedDate);
  
  useEffect(() => {
    setStartDate(selectedDate);
    setEndDate(selectedDate);
  },[selectedDate]);

  const handleSave = () => {
    if(!title) return alert("일정을 입력하세요");

    onAddEvent({
      title,
      start: startDate,
      end: isRange ? endDate : startDate
    });
    onClose();
  }
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold">일정 추가</h2>
      <input 
        className="border-b p-2 outline-none" 
        placeholder="일정 제목" 
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div className="flex items-center gap-2">
        <input type="checkbox" id="range" onChange={() => setIsRange(!isRange)} />
        <label htmlFor="range" className="text-sm">기간 설정</label>
      </div>
      <div className="flex gap-2">
        <input type="date" className="border p-2 rounded" value={startDate} onChange={(e)=>setStartDate(e.target.value)} />
        {isRange && (
          <input type="date" className="border p-2 rounded" value={endDate} onChange={(e)=>setEndDate(e.target.value)} min={startDate} />
        )}
      </div>
      <button onClick={handleSave} className="bg-indigo-600 text-white p-2 rounded">저장</button>
    </div>
  );
}