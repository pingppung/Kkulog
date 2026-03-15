import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";

const prisma = new PrismaClient();


//범위별 조회 성능 테스트 함수
async function runSingleTest(label, startDate, endDate) {
    const totalCount = await prisma.event.count();

    console.log("=================================");
    console.log(`📌 ${label}`);
    console.log(`총 저장된 이벤트 수: ${totalCount}개`);
    console.log(
        `조회 범위: ${startDate.toLocaleDateString()} ~ ${endDate.toLocaleDateString()}`
    );
    console.log("인덱스 상태: calendarId + start 복합 인덱스");
    console.log("=================================");

    const results = [];

    let eventCount = 0;

    for (let i = 0; i < 5; i++) {
        const startTime = performance.now();

        const events = await prisma.event.findMany({
            where: {
                calendarId: 1,
                start: { lte: endDate },
                end: { gte: startDate },
            },
        });

        const endTime = performance.now();
        const duration = endTime - startTime;

        results.push(duration);

        if (i === 0) {
            eventCount = events.length;
        }

        console.log(`실행 ${i + 1}회: ${duration.toFixed(2)} ms`);
    }

    const avg =
        results.reduce((a, b) => a + b, 0) / results.length;

    console.log("---------------------------------");
    console.log(`조회된 이벤트 수: ${eventCount}`);
    console.log(`평균 조회 시간: ${avg.toFixed(2)} ms`);
    console.log("\n");
}

//api 성능 테스트
async function runApiTest(label, start, end) {

  console.log("=================================");
  console.log(`📌 ${label}`);
  console.log(
        `조회 범위: ${start.toLocaleDateString()} ~ ${end.toLocaleDateString()}`
    );
  console.log("=================================");

  const results = [];
  let eventCount = 0;

  for (let i = 0; i < 5; i++) {

    const startTime = performance.now();

    const res = await fetch(
      `http://localhost:4000/api/events?start=${start.toISOString()}&end=${end.toISOString()}`
    );

    const data = await res.json();

    const endTime = performance.now();

    const duration = endTime - startTime;

    results.push(duration);

    if (i === 0) {
      eventCount = data.length;
    }

    console.log(`실행 ${i + 1}회: ${duration.toFixed(2)} ms`);
  }

  const avg =
    results.reduce((a, b) => a + b, 0) / results.length;

  console.log("---------------------------------");
  console.log(`조회된 이벤트 수: ${eventCount}`);
  console.log(`평균 API 시간: ${avg.toFixed(2)} ms`);
  console.log("\n");
}


/**
 * 실행부
 */
async function main() {
    // await runSingleTest(
    //     "1주 조회 테스트",
    //     new Date(2026, 2, 1),
    //     new Date(2026, 2, 7, 23, 59, 59)
    // );

    // await runSingleTest(
    //     "1달 조회 테스트",
    //     new Date(2026, 2, 1),
    //     new Date(2026, 2, 31, 23, 59, 59)
    // );

    // await runSingleTest(
    //     "1년 조회 테스트",
    //     new Date(2026, 0, 1),
    //     new Date(2026, 11, 31, 23, 59, 59)
    // );
    await runApiTest(
        "1주 조회 테스트",
        new Date(2026, 2, 1),
        new Date(2026, 2, 7, 23, 59, 59)
    );

    await runApiTest(
        "1달 조회 테스트",
        new Date(2026, 2, 1),
        new Date(2026, 2, 30, 23, 59, 59)
    );

    await runApiTest(
        "1년 조회 테스트",
        new Date(2026, 0, 1),
        new Date(2026, 11, 31, 23, 59, 59)
    );
}

main().finally(() => prisma.$disconnect());