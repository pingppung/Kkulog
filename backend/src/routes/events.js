import express from "express";
import { prisma } from "../prisma/index.js";

const router = express.Router();
const userId = 1; //feat/calendar 테스트용
const calendarId = 1; //feat/calendar 테스트용

// 1. 일정 목록 가져오기 (GET /api/events)
router.get('/', async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) {
    return res.status(400).json({ error: "start and end required" });
  }

  const rangeStart = new Date(start);
  const rangeEnd = new Date(end);
  try {
    const events = await prisma.event.findMany({
      where: {
        calendar: {
          userId: userId,
        },
        start: { lte: rangeEnd },
        end: { gte: rangeStart },
      },
      orderBy: {
        start: "asc",
      },
    });
    res.json(events);
  } catch (err) {
    console.error("진짜 에러 내용:", err);
    res.status(500).json({ message: "데이터 조회 실패", error: err.message });
  }
});

// 2. 새로운 일정 추가 (POST /api/events)
router.post('/', async (req, res) => {
  const { title, memo, start, end, color } = req.body;
  try {
    const calendar = await prisma.calendar.findFirst({  //user검증을 위함
      where: {
        id: Number(calendarId),
        userId: userId,
      },
    });

    if (!calendar) {
      return res.status(403).json({ message: "권한 없음" });
    }
    const event = await prisma.event.create({
      data: {
        title,
        memo,
        start: new Date(start),
        end: new Date(end),
        color,
        calendarId: calendar.id,
      },
    });
    // console.log("DB 저장 완료:", event);
    // res.status(201).json({
    //   success: true,
    //   message: "일정 추가 성공",
    //   data: event
    // });
    res.status(201).json(event);
  } catch (err) {
    console.error("저장 에러:", err);
    res.status(400).json({
      success: false,
      message: "일정 저장 실패",
      error: err.message
    });
  }
});

// 3. 일정 수정(PUT /api/events/:id) 
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { title, memo, start, end, color } = req.body;

  try {
    const target = await prisma.event.findFirst({
      where: {
        id: id,
        calendar: {
          userId: userId,
        },
      },
    });

    if (!target) {
      return res.status(403).json({ message: "권한 없음" });
    }

    const updatedEvent = await prisma.event.update({
      where: { id: id },
      data: {
        title,
        memo,
        start: new Date(start),
        end: new Date(end),
        color,
      },
    });

    res.json(updatedEvent);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;


