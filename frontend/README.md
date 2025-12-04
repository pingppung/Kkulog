# Frontend - Kkulog

React + Vite + TailwindCSS 기반

---

## 설치 및 설정

### 1) 프로젝트 초기화
```bash
mkdir frontend
cd frontend

npm create vite@latest . -- --template react
npm install
```
Vite 기반 React 프로젝트 초기 구조 생성

### 2) TailwindCSS 설정
```
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

`tailwind.config.js`
```js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
};
```

`src/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 3) 개발 서버 실행
```
npm run dev
```
기본 주소 : http://localhost:5173



## 개발 환경 정보
| 항목              | 버전      |
| --------------- | ------- |
| **Node.js** | 22.16.0 |
| **npm** | 10.9.2 |
| **React**       | 19.2.0     |
| **Vite**        | 7.2.2     |
| **TailwindCSS** | 4.1.17      |
