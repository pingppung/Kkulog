import express from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma/index.js";

const router = express.Router();

//회원가입
router.post("/signup", async (req, res) => {
    try {
        const {username, password} = req.body;
        // 1) 아이디 중복 검사
        const exists = await prisma.user.findUnique({
            where: {username},
        });

        if(exists) {
            return res.status(400).json({message: "이미 사용 중인 아이디입니다."});
        }

        // 2) 비밀번호 검사
        if(password.length < 6) {
            return res.status(400).json({message: "비밀번호는 6자 이상이어야 합니다."});
        }
        
        // 3) 비밀번호 암호화
        const hashed = await bcrypt.hash(password, 10);

        // 4) 사용자 생성
        await prisma.user.create({
            data: {
                username,
                password: hashed,
            },
        });

        res.status(201).json({ message: "회원가입 성공"});
    } catch (err) {
        console.error("회원가입 실패: ", err);
        res.status(500).json({ message: "서버 오류"});
    }
});

export default router;