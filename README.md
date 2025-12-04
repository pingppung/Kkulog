# 🌿 Kkulog (꾸로그)
> 감정과 일정을 함께 기록하는 다꾸형 캘린더 웹앱
> 기존 캘린더가 일정만 다루는 데서 벗어나,  
**기록 중심의 일정 관리 서비스**를 만드는 것을 목표로 하고 있습니다.
---


## 🧱 Tech Stack (예정)
| 구분 | 기술 | 비고 |
|------|------|-----------|
| **Frontend** | React | 컴포넌트 단위로 화면 구조 잡기 용이 |
|  | TailwindCSS | 빠른 UI 스타일링 |
|  | Zustand | 간단한 전역 상태 관리 (Redux보다 가벼움) |
| **Backend** | Node.js (Express) | REST API 구성 간결, 초기 설정 빠름 |
|  | Prisma | 스키마 기반 ORM, 타입 안정성 확보 |
| **Database** | PostgreSQL | JSON 타입 컬럼 활용 가능 |
| **Storage** | Local `/uploads/` | 초기엔 로컬로만 이미지/파일 관리 |
---
## 🗂️ ERD
![ERD](/docs/erd_kkulog_v1.png.png)

---
## 📁 기본 구조 (예정)
```
kkulog/
├── frontend/
│ ├── src/
│ ├── public/
│ └── package.json
├── backend/
│ ├── src/
│ ├── prisma/
│ └── package.json
└── README.md
```
---
## 📘 주요 테이블 구상

| 테이블 | 역할 | 주요 컬럼 | 비고 |
|--------|------|-----------|------|
| **User** | 사용자 정보 | `id`, `email`, `nickname`, `theme`, `source(google/local)` | 구글 연동 / 로컬 사용자 |
| **Diary** | 다이어리 기본 정보 | `id`, `userId`, `title`, `createdAt`, `metadata(JSON)` | 사용자별 여러 개 보유 가능 |
| **Style** | 다이어리 스타일 설정 | `id`, `diaryId`, `year`, `month`, `day (nullable)`, `metadata(JSON)` | 월 단위 기본, 일 단위 확장 가능 |
| **Sticker** | 스티커 정보 | `id`, `diaryId`, `type`, `x`, `y`, `size`, `rotation`, `metadata(JSON)` | 다이어리 위 자유 배치 |
| **Schedule** | 일정 정보 | `id`, `diaryId`, `title`, `startDate`, `endDate`, `emotion`, `metadata(JSON)` | 일정 작성 / 구글 연동 가능 |
| **TextBlock** | 텍스트 블록 | `id`, `diaryId`, `x`, `y`, `content`, `metadata(JSON)` | 다이어리 내 자유 배치 |
| **Tag** | 일정 분류 | `id`, `name`, `color` | 필터링용 |
| **ScheduleTag** | 일정–태그 연결 | `id`, `scheduleId`, `tagId` | N:M 관계 |

---

