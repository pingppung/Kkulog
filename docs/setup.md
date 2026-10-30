# 실행 메모

Windows에서 개발 중이다. 다른 PC에서 다시 설치할 때 참고하려고 적어뒀다.

## 설치할 것

- Node.js, npm
- Rust (Windows MSVC)
- Microsoft C++ Build Tools → C++ 데스크톱 개발 항목
- Microsoft Edge WebView2 Runtime

설치가 됐는지 터미널에서 확인한다.

```powershell
node -v
npm -v
rustc --version
cargo --version
```

## 실행

프로젝트 폴더에서 아래 명령어를 실행한다.

```powershell
cd frontend
npm install
npm run tauri -- dev
```

필요한 라이브러리는 `npm install`로 받는다. 버전은 `package.json`과 `package-lock.json`에 적혀 있다. 처음에는 인터넷이 필요하고 Rust 빌드 때문에 시간이 좀 걸릴 수 있다.

개발 서버도 같이 켜지기 때문에 따로 실행할 필요는 없다. 이미 만들어진 프로젝트라 Vite나 Tauri 초기 설정도 다시 하지 않아도 된다.

화면만 브라우저에서 볼 때는 `frontend`에서 `npm run dev`를 쓴다. 일정 저장과 조회는 Tauri 앱에서 해야 한다.

설치 파일을 만들 때도 `frontend`에서 실행한다.

```powershell
npm run tauri -- build
```

실행 파일은 `src-tauri/target/release`, 설치 파일은 그 아래 `bundle` 폴더에 생긴다.

## 참고할 것

지금은 SQLite에 저장해서 백엔드나 PostgreSQL을 켜지 않아도 된다. SQLite도 따로 설치하지 않는다. 로그인 코드는 나중에 쓰려고 남겨뒀지만 현재는 꺼둔 상태다.

일정은 앱을 껐다 켜도 아래 파일에 남는다.

```text
%APPDATA%\com.tauri.dev\kkulog.sqlite3
```

파일을 따로 보관하려면 앱을 종료하고 복사한다. 앱 안에서 백업·복원하는 기능은 아직 없다. `tauri.conf.json`의 앱 식별자를 바꾸면 저장 폴더도 달라진다.

창 크기나 개발 서버 주소는 `frontend/src-tauri/tauri.conf.json`에서 바꾼다. 개발 주소는 `devUrl`, 빌드한 화면 경로는 `frontendDist`다.

스타일은 `frontend/src/index.css`, Tailwind 설정은 `frontend/postcss.config.js`를 보면 된다. Tailwind 4를 사용 중이라 CSS에서 `@import "tailwindcss";`로 불러온다. 예전의 `tailwindcss init -p`나 `@tailwind base` 설정을 다시 넣을 필요는 없다.

화면 코드는 `frontend/src`, Rust 코드는 `frontend/src-tauri/src`에 있다. 일정은 `calendar/api.ts`에서 Rust의 `database.rs`를 호출해서 SQLite에 저장한다.

React나 CSS 수정은 대부분 바로 반영된다. Rust나 창 설정을 바꿨는데 반영이 안 되면 실행을 종료하고 다시 켠다.

창은 다른 프로그램 아래에 있고 작업표시줄에도 안 보이게 해뒀다. 실행했는데 안 보이면 바탕화면 쪽을 확인한다.
