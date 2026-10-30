import { DatabaseSync } from 'node:sqlite';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

const path = join(process.env.APPDATA, 'com.tauri.dev', 'kkulog.sqlite3');
if (!existsSync(path)) throw new Error('로컬 DB가 없습니다. 먼저 앱을 실행해 주세요.');
const database = new DatabaseSync(path);
const startOf = day => new Date(`2026-10-${day}T00:00:00+09:00`).toISOString();
const endOf = day => new Date(`2026-10-${day}T23:59:59.999+09:00`).toISOString();

try {
  database.exec('PRAGMA busy_timeout = 5000');
  if (database.prepare('PRAGMA user_version').get().user_version !== 2) {
    throw new Error('앱을 다시 실행해 DB를 최신 버전으로 갱신해 주세요.');
  }
  database.exec('BEGIN IMMEDIATE');
  try {
    // 앞서 추가한 샘플만 수정하고 직접 작성한 일정은 유지합니다.
    const previous = [
      ['05', '[예시] 주간 업무 정리', '주간 업무 계획', '이번 주 업무 우선순위 및 담당자 확인'],
      ['12', '[예시] 프로젝트 기획', '신규 서비스 기획안 작성', '요구사항 정리 및 기획안 초안 작성'],
      ['20', '[예시] 팀 회의', '팀 주간회의', '파트별 진행 현황 및 이슈 공유'],
      ['26', '[예시] 자료 조사', '경쟁사 서비스 분석', '주요 기능 비교 및 개선점 정리'],
      ['29', '[예시] 월말 보고서 작성', '10월 실적 보고서 작성', '지표 취합 및 부서별 성과 정리'],
      ['31', '[예시] 10월 회고', '10월 업무 회고', '완료 업무 및 다음 달 개선 과제 정리'],
      ['28', '[배경색 예시] 중요 업무 확인', '최종 산출물 검토', '발표 자료와 납품 문서 최종 확인'],
      ['29', '[배경색 예시] 프로젝트 발표', '신규 프로젝트 제안 발표', '제안서 및 질의응답 자료 준비'],
      ['31', '[배경색 예시] 월말 마감', '월말 정산 마감', '법인카드 사용 내역 및 증빙 제출'],
    ];
    const rename = database.prepare('UPDATE events SET title=?, memo=? WHERE title=? AND start=?');
    let updated = 0;
    for (const [day, before, title, memo] of previous) {
      updated += Number(rename.run(title, memo, before, startOf(day)).changes);
    }

    const work = [
      ['01', '01', '분기 목표 공유', '4분기 핵심 지표와 추진 일정 확인', '#60A5FA', 0],
      ['02', '02', '주간 업무보고 제출', '진행 현황 및 다음 주 계획 제출', '#FB923C', 1],
      ['06', '06', '고객사 요구사항 미팅', '추가 요청사항 및 적용 범위 협의', '#34D399', 0],
      ['08', '08', '디자인 시안 검토', '화면별 피드백 정리 후 전달', '#A78BFA', 0],
      ['13', '13', '기획안 내부 리뷰', '개발 범위 및 우선순위 확정', '#60A5FA', 0],
      ['15', '16', '서비스 QA 진행', '주요 시나리오 점검 및 오류 목록 정리', '#A78BFA', 0],
      ['19', '19', '스프린트 계획 회의', '이번 스프린트 작업량 및 담당자 배정', '#34D399', 0],
      ['22', '22', '고객사 중간보고', '개발 현황과 향후 일정 공유', '#F472B6', 1],
      ['23', '23', '협력사 견적 검토', '납기 및 비용 비교 후 의견 전달', '#60A5FA', 0],
      ['27', '27', '부서별 실적 취합', '10월 목표 대비 실적 확인', '#FB923C', 0],
      ['28', '28', '고객사 피드백 반영', '검토 의견 정리 및 수정 요청 전달', '#34D399', 0],
      ['30', '30', '11월 업무 계획 수립', '차월 주요 일정 및 리소스 확인', '#FBBF24', 1],
    ];
    const insert = database.prepare(`INSERT INTO events(title,memo,start,end,color,has_background)
      SELECT ?,?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM events WHERE title=? AND start=?)`);
    let added = 0;
    for (const [first, last, title, memo, color, background] of work) {
      added += Number(insert.run(title, memo, startOf(first), endOf(last), color, background, title, startOf(first)).changes);
    }
    database.exec('COMMIT');
    console.log(JSON.stringify({ updated, added, month: '2026-10' }));
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
} finally {
  database.close();
}
