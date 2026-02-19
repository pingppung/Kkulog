import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.event.createMany({
    data: [
      {
        title: "과제",
        category: "default",
        color: "#5D89D0",
        start: new Date("2026-01-02T00:00:00"),
        end: new Date("2026-01-04T23:59:59"),
      },
      {
        title: "여행",
        category: "default",
        color: "#FF986A",
        start: new Date("2025-12-09T12:00:00"),
        end: new Date("2025-12-24T23:00:00"),
      },
      {
        title: "약속",
        category: "default",
        color: "#d3f751",
        start: new Date("2026-01-24T18:00:00"),
        end: new Date("2026-01-25T20:00:00"),
      },
      {
        title: "해커톤",
        category: "default",
        color: "#ABE0F0",
        start: new Date("2026-01-15T09:00:00"),
        end: new Date("2026-01-17T18:00:00"),
      },
      {
        title: "회의",
        category: "default",
        color: "#22C55E",
        start: new Date("2026-01-03T10:00:00"),
        end: new Date("2026-01-03T11:00:00"),
      },
      {
        title: "운동",
        category: "default",
        color: "#A855F7",
        start: new Date("2026-01-14T19:00:00"),
        end: new Date("2026-01-14T20:00:00"),
      },
    ],
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
