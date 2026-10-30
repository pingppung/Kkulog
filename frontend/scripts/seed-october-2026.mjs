import { DatabaseSync } from 'node:sqlite';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

const path = join(process.env.APPDATA, 'com.tauri.dev', 'kkulog.sqlite3');
if (!existsSync(path)) throw new Error('먼저 Tauri 앱을 한 번 실행해 로컬 DB를 생성해 주세요.');
const database = new DatabaseSync(path);
try {
  database.exec('PRAGMA busy_timeout = 5000');
  if (![1, 2].includes(database.prepare('PRAGMA user_version').get().user_version)) {
    throw new Error('지원하지 않는 DB 스키마입니다.');
  }
  const samples = [
    ['주간 업무 정리', '05', '05', '#60A5FA', '이번 주 할 일과 우선순위를 정리해요.'],
    ['프로젝트 기획', '12', '14', '#A78BFA', '아이디어 정리, 요구사항 검토, 초안 작성'],
    ['팀 회의', '20', '20', '#34D399', '진행 상황과 다음 작업을 공유해요.'],
    ['자료 조사', '26', '28', '#FBBF24', '필요한 자료를 모으고 핵심 내용을 메모해요.'],
    ['월말 보고서 작성', '29', '30', '#FB923C', '이번 달 성과와 다음 달 계획을 정리해요.'],
    ['10월 회고', '31', '31', '#F472B6', '잘한 점, 아쉬운 점, 다음 달 목표를 적어요.'],
  ];
  const insert = database.prepare(`INSERT INTO events(title, memo, start, end, color)
    SELECT ?, ?, ?, ?, ? WHERE NOT EXISTS
    (SELECT 1 FROM events WHERE title = ? AND start = ?)`);
  database.exec('BEGIN IMMEDIATE');
  try {
    let added = 0;
    for (const [name, first, last, color, memo] of samples) {
      const title = `[예시] ${name}`;
      const start = new Date(`2026-10-${first}T00:00:00+09:00`).toISOString();
      const end = new Date(`2026-10-${last}T23:59:59.999+09:00`).toISOString();
      added += Number(insert.run(title, memo, start, end, color, title, start).changes);
    }
    database.exec('COMMIT');
    console.log(JSON.stringify({ path, added, month: '2026-10' }));
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
} finally {
  database.close();
}
