import { useEffect, useState } from "react";
import axios from "axios";
import DayCell from '../components/DayCell';
import Modal from "../components/Modal";
import ScheduleForm from "../components/ScheduleForm";

export default function Calendar() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pickDate, setPickDate] = useState("");
  const [allEvents, setAllEvents] = useState([]);


  const todayDate = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();


  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);

  const daysInMonth = lastDay.getDate();
  const startDay = firstDay.getDay();

  // 이전 달 데이터
  const lastDayPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const prevDays = [];
  const thisMonth = [];
  const nextDays = [];

  // 이전 달 날짜 채우기
  for (let i = 0; i < startDay; i++) {
    prevDays.push(lastDayPrevMonth - (startDay - 1 - i));
  }

  // 이번 달 날짜
  for (let i = 1; i <= daysInMonth; i++) {
    thisMonth.push(i);
  }

  // 이전 달 날짜와 이번 달 날짜의 합계
  const currentTotal = prevDays.length + thisMonth.length;
    
  // 7의 배수로 만들어서 총 셀 개수를 계산 (5주 또는 6주)
  const totalCells = Math.ceil(currentTotal / 7) * 7;


  // 다음 달 날짜
  for (let i = 1; prevDays.length + thisMonth.length + nextDays.length < totalCells; i++) {
    nextDays.push(i);
  }

  const calendarDays = [
    ...prevDays.map((d) => ({ day: d, type: "prev" })),
    ...thisMonth.map((d) => ({ day: d, type: "current" })),
    ...nextDays.map((d) => ({ day: d, type: "next" })),
  ].map((item, index) => ({
    ...item,
    weekday: index % 7, // 0:일, 1:월, ... 6:토
  }));

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const addNewEvent = async(eventData) => {
    try {
      const response = await axios.post("http://localhost:4000/api/events", eventData);
      if(response.status === 200 || response.status === 201) {
        setAllEvents([...allEvents, eventData]);
        console.log("저장된 전체 일정:", [...allEvents, eventData]);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("저장 실패: ", error.response?.data || error.message);
      alert("일정 저장 중에 문제가 생겼습니다.");
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/events');
        console.log(response);
        setAllEvents(response.data); 
      } catch (error) {
        console.error("데이터 불러오기 실패:", error);
      }
    };

    fetchEvents();
  }, []);
  return (
    <div>
      {/* Banner */ }
      <div> </div>
      <div className="m-4 w-4/5 p-4 bg-[#ebedfc] rounded-xl shadow">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={prevMonth}
            className="px-3 py-1 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            ⟵
          </button>
          <h2 className="text-lg font-semibold">
            {currentYear}년 {currentMonth + 1}월
          </h2>
          <button
            onClick={nextMonth}
            className="px-3 py-1 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            ⟶
          </button>
        </div>
        {/* Weekdays */}
        <div className="grid grid-cols-7 text-center font-semibold mb-2">
          <div className="text-red-500">SUN</div>
          <div>MON</div>
          <div>TUE</div>
          <div>WED</div>
          <div>THU</div>
          <div>FRI</div>
          <div className="text-blue-500">SAT</div>
        </div>
        {/* Days */}
        <div className="grid grid-cols-7 gap-0.5 border-collapse">
          {calendarDays.map(({ day, type, weekday }, idx) => (
            <DayCell
              key={idx}
              day={day}
              type={type}
              weekday={weekday}
                    
              // DayCell 내부에서 비교할 현재 캘린더의 상태
              currentMonth={currentMonth}
              currentYear={currentYear}
                    
              // DayCell 내부에서 비교할 실제 '오늘' 날짜 정보 (today 변수에서 바로 추출)
              todayDate={todayDate}
              todayMonth={todayMonth}
              todayYear={todayYear}
            />
          ))}
        </div>
      </div>
      {/* 버튼 */}
      <div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-1 bg-gray-300 rounded-lg hover:bg-gray-400"
        >
          일정추가
        </button>
      </div>

      {/* 일정추가 */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ScheduleForm 
          selectedDate={pickDate}
          onAddEvent={addNewEvent}
          onClose={() => setIsModalOpen(false)} 
        />
      </Modal>
    </div>
    
  );
}
