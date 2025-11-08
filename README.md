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
