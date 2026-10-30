import { DatabaseSync } from 'node:sqlite';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

const path = join(process.env.APPDATA, 'com.tauri.dev', 'kkulog.sqlite3');
if (!existsSync(path)) throw new Error('먼저 앱을 실행해 로컬 DB를 만들어 주세요.');

const database = new DatabaseSync(path);
try {
  database.exec('PRAGMA busy_timeout = 5000');
  const version = database.prepare('PRAGMA user_version').get().user_version;
  if (![1, 2].includes(version)) throw new Error('지원하지 않는 DB 버전입니다.');

  database.exec('BEGIN IMMEDIATE');
  try {
    if (version === 1) {
      database.exec(`ALTER TABLE events ADD COLUMN has_background INTEGER NOT NULL DEFAULT 0;
        PRAGMA user_version = 2;`);
    }
    const insert = database.prepare(`INSERT INTO events(title, memo, start, end, color, has_background)
      SELECT ?, ?, ?, ?, ?, 1 WHERE NOT EXISTS
      (SELECT 1 FROM events WHERE title = ? AND start = ?)`);
    const samples = [
      ['28', '중요 업무 확인', '#FBBF24'],
      ['29', '프로젝트 발표', '#A78BFA'],
      ['31', '월말 마감', '#F472B6'],
    ];
    let added = 0;
    for (const [day, name, color] of samples) {
      const title = `[배경색 예시] ${name}`;
      const start = new Date(`2026-10-${day}T00:00:00+09:00`).toISOString();
      const end = new Date(`2026-10-${day}T23:59:59.999+09:00`).toISOString();
      added += Number(insert.run(title, '배경색을 적용한 하루 일정 예시입니다.', start, end, color, title, start).changes);
    }
    database.exec('COMMIT');
    console.log(JSON.stringify({ added, month: '2026-10' }));
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
} finally {
  database.close();
}
