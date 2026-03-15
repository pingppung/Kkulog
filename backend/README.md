# Backend - Kkulog

> 데스크톱(Tauri) 환경에서 사용하는 캘린더 기반 일정 관리 API

---

## 1️⃣ `feat/calendar` 브랜치
이 브랜치에서는 일정 CRUD랑 날짜 범위 조회를 먼저 구현했다.
캘린더에서 가장 기본이 되는 기능이라, 로직을 단순하게 가져가되 나중에 확장 가능하도록 구조를 잡는 데 신경을 썼다.

- 일정 생성
- 일정 수정
- 일정 삭제
- 날짜 범위 기반 일정 조회

---

## 2️⃣ 구현 내용
#### ✅ 일정 생성 (POST /events)
- title, memo, start, end, color 등을 받아 DB에 저장
- Prisma로 저장 후 생성된 데이터를 그대로 반환

특별한 로직은 없지만,
시작/종료 시간을 DateTime으로 정확히 저장하는 부분은 나중에 범위 조회랑 연결되기 때문에 중요하다고 생각했다.

#### ✅ 일정 수정 (PUT /events/:id)

처음에는 단순히 id 기준으로만 수정하려고 했다.
그런데 사용자 구조가 추가되면 다른 사용자의 일정도 수정할 수 있는 문제가 생길 수 있다고 생각했다.

그래서 다음처럼 조건을 걸었다.

```javascript
where: {
  id,
  calendar: { userId }
}
```
현재는 단일 사용자지만,
나중에 인증 기능이 붙어도 API 구조를 크게 바꾸지 않도록 미리 관계 조건을 넣어두는 방향으로 구현했다.


#### ✅ 일정 삭제 (DELETE /events/:id)

삭제도 수정과 같은 방식으로 구성했다.
리소스 단위로 설계했고, 관계 조건을 같이 걸 수 있게 맞춰두었다.

#### ✅ 날짜 범위 기반 조회 (GET /events)

캘린더는 단순히 “해당 월의 데이터”만 가져오면 안 되고,
렌더링 범위에 일부라도 포함되는 일정까지 표시해줘야 한다.

이를 위해 다음과 같은 조건으로 조회를 구성했다.

```javascript
where: {
  start: { lte: endDate },
  end: { gte: startDate }
}
```

이 조건을 사용하면

- 조회 범위 내부 일정
- 조회 범위를 일부라도 포함하는 일정
- 조회 범위를 완전히 감싸는 일정

을 모두 가져올 수 있다.

캘린더 특성에 맞춘 조회 조건이라고 생각한다.


## 3️⃣ 기술 스택

#### `Node.js + Express`

- Tauri 클라이언트와 API 서버 분리
- REST 구조로 일정 리소스 관리

#### `Prisma`
- 날짜 범위 조건을 객체 형태로 작성할 수 있어서 편했다
- 관계 조건도 `where` 절에서 자연스럽게 표현 가능
- 스키마 기반이라 타입 안정성이 있는 점이 좋았다

#### `PostgreSQL`

- DateTime 비교가 안정적
- 나중에 복합 인덱스 추가 가능
- 관계형 데이터 구조에 적합

## 4️⃣ API 요약
| Method | Endpoint    | Description |
| ------ | ----------- | ----------- |
| POST   | /events     | 일정 생성       |
| GET    | /events     | 날짜 범위 기반 조회 |
| PUT    | /events/:id | 일정 수정       |
| DELETE | /events/:id | 일정 삭제       |


## 5️⃣ 고민했던 부분

- 처음에는 단순 CRUD만 구현하려고 했지만,
나중에 다중 사용자 구조로 확장될 가능성을 생각하게 됐다.
그래서 쿼리나 관계 구조를 너무 단순하게 고정하지 않으려고 했다.

- 캘린더는 월을 넘어가는 일정이 자연스럽게 생기기 때문에,
단순히 "해당 월 데이터"만 조회하면 일정이 빠질 수 있었다.
범위가 겹치는 조건을 어떻게 구성해야 누락이 없을지 가장 많이 고민했다.

- 반복 일정이나 인증 기능이 추가되면 로직이 복잡해질 수 있다고 생각했다.
그래서 지금 단계에서는 구조를 과하게 확장하지 않고,
이후 기능이 붙어도 전체 설계를 다시 뜯어고치지 않도록 단순함을 유지하는 쪽으로 방향을 잡았다.

## 6️⃣ 개발 환경

| 항목         | 버전      |
| ---------- | ------- |
| Node.js    | 22.16.0 |
| npm        | 10.9.2  |
| PostgreSQL | 17      |
| Prisma     | 6.19.0  |
| Express    | 5.1.0   |


## 7️⃣ 설치 및 실행 방법
#### 1) 프로젝트 초기화
```bash
mkdir backend
cd backend

npm init -y
npm install prisma --save-dev
npx prisma init
```
기본 Prisma 설정 파일 및 `.env` 생성


#### 2) Prisma 설정
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

#### 3) Prisma Client 생성
``` bash
# Prisma Client 생성 (DB 반영 X)
npx prisma generate

# Prisma 연결 테스트 (선택)
node src/test/prismaTest.js
```

#### 4) 개발 서버 실행
```
npm run dev
```
기본 주소 : http://localhost:3000


#### 5) DB 관리

- 스키마 반영 → npx prisma db push
- 테스트 데이터 → npx prisma db seed
- 마이그레이션 → npx prisma migrate dev
- 데이터 확인 → Prisma Studio


## 8️⃣ Issues & Notes (개발 중 발생한 문제 정리)
#### 1) Prisma Client 로딩 오류

Node 22.16.x 환경에서 Prisma 6.x 사용 시 서버 실행이 되지 않는 문제가 있었음  
PrismaClient를 불러오지 못하는 오류가 반복 발생함 

👉 Node 버전을 22.11.0으로 낮춘 뒤 정상적으로 동작  
👉 Prisma는 6.x 유지

[Issue #1 – Prisma Client 실행 오류 정리](https://github.com/pingppung/Kkulog/issues/1)