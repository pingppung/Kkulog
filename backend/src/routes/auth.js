import express from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma/index.js";
import jwt from "jsonwebtoken";

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

//로그인
router.post("/login", async (req, res) => {
    try{
        const { username, password } = req.body;
        
        // 1) 아이디 존재하는지 확인
        const user = await prisma.user.findUnique({
            where: { username },
        });

        if(!user) {
            return res.status(400).json({ message: "아이디 또는 비밀번호가 올바르지 않습니다."});
        }

        // 2) 비밀번호 일치 확인
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(400).json({ message : "아이디 또는 비밀번호가 올바르지 않습니다."});
        }
        
        // 3) JWT 발급
        const token = jwt.sign(
            {id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1h"}
        );

        // 4) 쿠키에 JWT 담아서 보내기
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60,
        });

        return res.json({ message: "로그인 성공"});

    } catch (err){
        console.log("로그인 실패: ", err);
        return res.status(500).json({ message: "서버 오류"});
    }
});

// 로그인된 사용자 확인
router.get("/me", (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json({ loggedIn: false });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return res.json({
        loggedIn: true,
        username: decoded.username,
        });
    } catch (err) {
        return res.json({ loggedIn: false });
    }
});

export default router;