// DayCell.jsx (새 파일)
import React from 'react';


const DayCell = ({ 
    day, 
    type, 
    weekday, 
    currentMonth, 
    currentYear, 
    todayDate, 
    todayMonth, 
    todayYear,
    allEvents
}) => {
    
    // 1. "오늘" 날짜 확인 플래그
    const isToday = 
        type === "current" && // 현재 보고 있는 달이 이번 달이어야 하고
        currentYear === todayYear &&
        currentMonth === todayMonth &&
        day === todayDate;
    // 2. 텍스트 색상 결정 로직
    let dayTextColor = "text-black"; 

    if (type !== "current") {
        // 이전/다음 달 (흐릿한 색상)
        if (weekday === 0) {
            dayTextColor = "text-red-300";
        } else if (weekday === 6) {
            dayTextColor = "text-blue-300";
        } else {
            dayTextColor = "text-gray-400";
        }
    } else {
        // 이번 달 (선명한 색상)
        if (weekday === 0) {
            dayTextColor = "text-red-500";
        } else if (weekday === 6) {
            dayTextColor = "text-blue-500";
        }
    }
    
    // 3. 배경색 결정
    const bgColor = type === "current" ? "bg-white" : "bg-[#f5f6ff]";
    
    // 4. 최종 클래스 조합
    let finalClasses = `${bgColor} ${dayTextColor} hover:bg-gray-200`;

    // 5. "오늘" 하이라이트 적용 (최고 우선순위)
    if (isToday) {
        finalClasses = `${finalClasses} border-2 !border-red`;
    }

    return (
        <div
            className={`
                h-[100px] border p-1 flex flex-col border-transparent cursor-pointer
                ${finalClasses}
            `}
        >
            <div className="font-semibold">{day}</div>
        </div>
    );
};

export default DayCell;