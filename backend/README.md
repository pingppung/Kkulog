# Backend - Kkulog

Express + Prisma + PostgreSQL 기반

## 설치 및 설정

### 1) 프로젝트 초기화
```bash
mkdir backend
cd backend

npm init -y
npm install prisma --save-dev
npx prisma init
```
기본 Prisma 설정 파일 및 `.env` 생성


### 2) Prisma 설정
`prisma/schema.prisma`
```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
`.env`
```env
DATABASE_URL="postgresql://postgres:비밀번호@localhost:5432/kkulog?schema=public"
```
⚠️ 비밀번호를 PostgreSQL 설치 시 입력한 값으로 바꾸기

### 3) Prisma Client 생성
``` bash
# Prisma Client 생성 (DB 반영 X)
npx prisma generate

# Prisma 연결 테스트 (선택)
node src/test/prismaTest.js
```

### 4) 개발 서버 실행
```
npm run dev
```
기본 주소 : http://localhost:3000



## ⚙️ 개발 환경 정보

| 항목 | 버전 |
|------|------|
| **Node.js** | 22.16.0 |
| **npm** | 10.9.2 |
| **PostgreSQL** | 17 (로컬 설치) |
| **Prisma** | 6.19.0 |
| **Express** | 5.1.0 |

## 🐞 Issues & Notes (개발 중 발생한 문제 정리)
#### 1) Prisma Client 로딩 오류

Node 22.16.x 환경에서 Prisma 6.x 사용 시 서버 실행이 되지 않는 문제가 있었음  
PrismaClient를 불러오지 못하는 오류가 반복 발생함 

👉 Node 버전을 22.11.0으로 낮춘 뒤 정상적으로 동작  
👉 Prisma는 6.x 유지

[Issue #1 – Prisma Client 실행 오류 정리](https://github.com/pingppung/Kkulog/issues/1)