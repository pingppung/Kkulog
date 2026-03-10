import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma/index.js";

const router = express.Router();


// 1. 회원가입 (POST /api/auth/signup)
router.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(username, password);
    // 아이디 중복 검사
    const exists = await prisma.user.findUnique({
      where: { username },
    });
    console.log("중복? :" + exists);
    if (exists) {
      console.log("중복이라네");
      return res.status(400).json({
        success: false,
        message: "이미 사용 중인 아이디입니다.",
      });
    }

    // 비밀번호 검사
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "비밀번호는 6자 이상이어야 합니다.",
      });
    }

    // 비밀번호 암호화
    const hashed = await bcrypt.hash(password, 10);

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        username,
        password: hashed,
      },
    });

    return res.status(201).json({
      success: true,
      message: "회원가입 성공",
      user: {
        id: user.id,
        username: user.username,
      },
    });

  } catch (err) {
    console.error("회원가입 실패:", err);
    return res.status(500).json({
      success: false,
      message: "서버 오류",
    });
  }
});


// 2. 로그인 (POST /api/auth/login)
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    // 사용자 확인
    const user = await prisma.user.findUnique({
      where: { username },
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "사용자 정보가 없습니다.",
      });
    }

    // 비밀번호 확인
    const isMatch = await bcrypt.compare(password, user.password);

    console.log(isMatch);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "아이디 또는 비밀번호가 올바르지 않습니다.",
      });
    }

    // JWT 발급
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 쿠키 저장
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // 배포 시 true
      sameSite: "lax",
      maxAge: 1000 * 60 * 60,
    });

    return res.json({
      success: true,
      message: "로그인 성공",
      user: {
        id: user.id,
        username: user.username,
      },
    });

  } catch (err) {
    console.error("로그인 실패:", err);
    return res.status(500).json({
      success: false,
      message: "서버 오류",
    });
  }
});


// 3. 로그인 상태 확인 (GET /api/auth/me)
router.get("/me", (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        user: null,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return res.json({
      success: true,
      user: {
        id: decoded.id,
        username: decoded.username,
      },
    });

  } catch (err) {
    return res.status(401).json({
      success: false,
      user: null,
    });
  }
});


// 4. 로그아웃 (POST /api/auth/logout)
router.post("/logout", (req, res) => {
  res.clearCookie("token");

  return res.json({
    success: true,
    message: "로그아웃 완료",
  });
});


export default router;