import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1️⃣ User 생성
  const user = await prisma.user.create({
    data: {
      username: "test1",
      password: "123456",
    },
  });

  // 2️⃣ Calendar 생성
  const calendar = await prisma.calendar.create({
    data: {
      name: "기본 캘린더",
      userId: user.id, // optional이면 생략 가능
    },
  });

  // 3️⃣ Event 생성
  await prisma.event.createMany({
    data: [
      { title: "과제", memo: "자료 조사", color: "#5D89D0", start: new Date(2026, 0, 2, 0, 0, 0), end: new Date(2026, 0, 4, 23, 59, 59), calendarId: calendar.id,},
      { title: "여행", memo: "제주도", color: "#FF986A", start: new Date(2025, 11, 9, 12, 0, 0), end: new Date(2025, 11, 24, 23, 0, 0), calendarId: calendar.id,},
      { title: "약속", memo: null, color: "#d3f751", start: new Date(2026, 0, 24, 18, 0, 0), end: new Date(2026, 0, 25, 20, 0, 0), calendarId: calendar.id,},
      { title: "해커톤", memo: "팀 프로젝트", color: "#ABE0F0", start: new Date(2026, 0, 15, 9, 0, 0), end: new Date(2026, 0, 17, 18, 0, 0), calendarId: calendar.id,},
      { title: "회의", memo: "주간 회의", color: "#22C55E", start: new Date(2026, 0, 3, 10, 0, 0), end: new Date(2026, 0, 3, 11, 0, 0), calendarId: calendar.id,},
      { title: "운동", memo: "헬스장", color: "#A855F7", start: new Date(2026, 0, 14, 19, 0, 0), end: new Date(2026, 0, 14, 20, 0, 0), calendarId: calendar.id,},
    ],
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());