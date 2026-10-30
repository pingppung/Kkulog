import { DatabaseSync } from 'node:sqlite';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

const path = join(process.env.APPDATA, 'com.tauri.dev', 'kkulog.sqlite3');
if (!existsSync(path)) throw new Error('로컬 DB가 없습니다. 먼저 앱을 실행해 주세요.');
const database = new DatabaseSync(path);
try {
  database.exec('PRAGMA busy_timeout = 5000');
  if (database.prepare('PRAGMA user_version').get().user_version !== 2) {
    throw new Error('앱을 다시 실행해 DB를 갱신해 주세요.');
  }
  const start = new Date('2026-10-28T00:00:00+09:00').toISOString();
  const end = new Date('2026-10-28T23:59:59.999+09:00').toISOString();
  const schedules = [
    ['09:00 팀 데일리 미팅', '진행 상황과 오늘 할 일 공유', '#60A5FA', 0],
    ['10:00 고객사 요구사항 검토', '추가 요청사항 및 적용 범위 정리', '#34D399', 0],
    ['11:00 제안서 제출 마감', '최종 제안서와 견적서 전달', '#FBBF24', 1],
    ['14:00 서비스 개선안 발표', '주요 개선 항목과 추진 일정 공유', '#A78BFA', 1],
    ['16:00 계약 조건 협의', '납품 일정 및 계약 범위 확정', '#F472B6', 1],
    ['17:30 업무보고 제출', '당일 완료 업무와 내일 일정 정리', '#FB923C', 0],
  ];
  const insert = database.prepare(`INSERT INTO events(title,memo,start,end,color,has_background)
    SELECT ?,?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM events WHERE title=? AND start=?)`);
  database.exec('BEGIN IMMEDIATE');
  try {
    let added = 0;
    for (const [title, memo, color, background] of schedules) {
      added += Number(insert.run(title, memo, start, end, color, background, title, start).changes);
    }
    database.exec('COMMIT');
    console.log(JSON.stringify({ date: '2026-10-28', added }));
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
} finally {
  database.close();
}
