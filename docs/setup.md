# 🛠 Setup Guide

이 문서는 **Kkulog** 프로젝트의 초기 환경 구축 및 실행 방법을 기록합니다.

---

## 1. 개발 환경 정보
| 항목 | 버전 / 상태 |
| :--- | :--- |
| **Node.js** | 22.16.0 |
| **npm** | 10.9.2 |
| **React** | 19.2.0 |
| **Vite** | 7.2.2 |
| **TailwindCSS** | 4.1.17 |
| **Rust** | MSVC 툴체인 설치 필수 |

---

## 2. 필수 환경 확인
개발 시작 전 아래 명령어로 환경이 갖춰졌는지 확인합니다.
```bash
rustc --version
cargo --version
node -v
npm -v
```

---

## 3. 프로젝트 초기화 (Frontend)

### 1) Vite 기반 React 생성
```bash
mkdir frontend
cd frontend

npm create vite@latest . -- --template react
npm install
```

### 2) TailwindCSS 설정
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**tailwind.config.js**
```js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
};
```

**src/index.css**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 4. Tauri 설정 및 연결

### 1) Tauri CLI 설치 및 초기화
기존 프론트엔드 프로젝트가 있는 상태에서 실행합니다.
```bash
npm install -D @tauri-apps/cli
npx tauri init
```

### 2) tauri.conf.json 수정
Vite 개발 서버와 연동하기 위해 `src-tauri/tauri.conf.json` 파일을 아래와 같이 수정합니다.

```json
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devPath": "http://localhost:5173",
    "distDir": "../dist"
  },
  "tauri": {
    "window": [
      {
        "title": "Kkulog",
        "width": 800,
        "height": 600,
        "resizable": true
      }
    ]
  }
}
```

---

## 5. 실행 및 빌드

### 개발 모드 실행
```bash
npm run tauri dev
```

### 빌드 (exe 파일 생성)
```bash
npm run tauri build
```

---

## 🏗 시스템 구조
앱은 아래와 같은 흐름으로 동작합니다.

```text
React (JS) 
   ↓ (WebView)
Tauri (Rust) 
   ↓ (Windows API)
시스템 제어 (C / C++)
```