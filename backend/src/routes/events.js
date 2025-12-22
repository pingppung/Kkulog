import express from "express";
import { prisma } from "../prisma/index.js";

const router = express.Router();


// 1. 일정 목록 가져오기 (GET /api/events)
router.get('/', async (req, res) => {
    try {
        const events = await prisma.event.findMany({
            orderBy: {
                start: 'asc' // 시작일 순으로 정렬
            }
        });
        console.log(events);
        res.status(200).json(events);
        
    } catch (err) {
        console.error("진짜 에러 내용:", err);
        res.status(500).json({ message: "데이터 조회 실패", error: err.message });
    }
});

// 2. 새로운 일정 추가 (POST /api/events)
router.post('/', async (req, res) => {
    const { title, start, end, category } = req.body;
    
    try {
        // Prisma를 사용하여 DB에 데이터 생성
        const newEvent = await prisma.event.create({
            data: {
                title,
                start: new Date(start),
                end: new Date(end),
                category: category || "default",
            },
        });

        console.log("DB 저장 완료:", newEvent);
        res.status(201).json({ 
            success: true, 
            message: "일정 추가 성공", 
            data: newEvent 
        });
    } catch (err) {
        console.error("저장 에러:", err);
        res.status(400).json({ 
            success: false, 
            message: "일정 저장 실패", 
            error: err.message 
        });
    }
});

export default router;