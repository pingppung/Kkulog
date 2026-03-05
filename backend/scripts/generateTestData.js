import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const TOTAL = 100000; //생성 개수
const BATCH_SIZE = 1000; // 한 번에 insert할 개수

const now = new Date();
const currentYear = now.getFullYear();

const startRange = new Date(currentYear, 0, 1); // 1월 1일
const endRange = new Date(currentYear, 11, 31, 23, 59, 59); // 12월 31일

//현재 연도의 범위만
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

const colors = [
  "#5D89D0",
  "#FF986A",
  "#6FCF97",
  "#BB6BD9",
  "#F2C94C",
  "#EB5757",
];

function getRandomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}


function createEventData(index) {
  const start = randomDate(startRange, endRange);
  const r = Math.random();

  let end;

  if (r < 0.7) { //하루짜리 일정
    end = new Date(start);
  }
  else { // 기간 일정 (2~5일)
    const days = Math.floor(Math.random() * 4) + 2;
    end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
  }

  return {
    title: `Test Event ${index}`,
    memo: "",
    color: getRandomColor(),
    start,
    end,
    calendarId: 1,
  };

}

async function main() {
  console.log(`Generating ${TOTAL} events...`);

  for (let i = 0; i < TOTAL; i += BATCH_SIZE) {
    const batch = [];

    for (let j = 0; j < BATCH_SIZE && i + j < TOTAL; j++) {
      batch.push(createEventData(i + j));
    }

    await prisma.event.createMany({ data: batch });

    console.log(`Inserted: ${Math.min(i + BATCH_SIZE, TOTAL)}`);
  }

  console.log("Done.");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });