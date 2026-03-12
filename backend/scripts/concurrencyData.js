import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 동시 저장 성능 테스트
async function runConcurrencyTest() {

  const totalBefore = await prisma.event.count();

  console.log("=================================");
  console.log("📌 동시 저장 테스트");
  console.log(`저장 전 이벤트 수: ${totalBefore}`);
  console.log("동시 요청 수: 100");
  console.log("=================================");

  const requests = [];

  const startTime = performance.now();

  for (let i = 0; i < 100; i++) {
    requests.push(
      prisma.event.create({
        data: {
          title: `concurrency test ${i}`,
          start: new Date(),
          end: new Date(),
          calendarId: 1
        }
      })
    );
  }

  await Promise.all(requests);

  const endTime = performance.now();

  const totalAfter = await prisma.event.count();

  console.log("---------------------------------");
  console.log(`저장 후 이벤트 수: ${totalAfter}`);
  console.log(`생성된 이벤트 수: ${totalAfter - totalBefore}`);
  console.log(`총 실행 시간: ${(endTime - startTime).toFixed(2)} ms`);
  console.log("\n");
}

async function main() {

  await runConcurrencyTest();

  await prisma.$disconnect();
}

main();