use chrono::{DateTime, SecondsFormat};
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use std::{
    path::Path,
    sync::{Arc, Mutex},
};

#[derive(Clone)]
pub struct Database(pub Result<Arc<Mutex<Connection>>, String>);

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Event {
    pub id: Option<i64>,
    pub title: String,
    pub memo: Option<String>,
    pub start: String,
    pub end: String,
    pub color: String,
    #[serde(default, rename = "hasBackground")]
    pub has_background: bool,
}

fn timestamp(value: &str) -> Result<String, String> {
    DateTime::parse_from_rfc3339(value)
        .map(|d| d.to_utc().to_rfc3339_opts(SecondsFormat::Millis, true))
        .map_err(|_| "올바른 날짜가 아닙니다.".to_string())
}

pub fn initialize(connection: &Connection) -> Result<(), String> {
    connection
        .busy_timeout(std::time::Duration::from_secs(5))
        .map_err(|e| e.to_string())?;
    let version: i64 = connection
        .pragma_query_value(None, "user_version", |row| row.get(0))
        .map_err(|e| e.to_string())?;
    if version > 2 {
        return Err("더 최신 버전의 앱에서 만든 DB입니다.".into());
    }
    if version == 0 {
        connection
            .execute_batch(
                "BEGIN IMMEDIATE;
            CREATE TABLE events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL, memo TEXT,
                start TEXT NOT NULL, end TEXT NOT NULL,
                color TEXT NOT NULL, CHECK(start <= end)
            );
            CREATE INDEX events_start_end ON events(start, end);
            PRAGMA user_version = 1;
            COMMIT;",
            )
            .map_err(|e| e.to_string())?;
    }
    if version < 2 {
        // 기존 일정은 유지하고 배경색 설정만 추가합니다.
        connection.execute_batch(
            "BEGIN IMMEDIATE;
            ALTER TABLE events ADD COLUMN has_background INTEGER NOT NULL DEFAULT 0;
            PRAGMA user_version = 2;
            COMMIT;"
        ).map_err(|e| e.to_string())?;
    }
    connection
        .execute_batch("PRAGMA cache_size = -2048;")
        .map_err(|e| e.to_string())
}

impl Database {
    pub fn open(path: &Path) -> Self {
        Self((|| {
            std::fs::create_dir_all(path.parent().ok_or("DB 경로를 찾을 수 없습니다.")?)
                .map_err(|e| e.to_string())?;
            let connection = Connection::open(path).map_err(|e| e.to_string())?;
            initialize(&connection)?;
            Ok(Arc::new(Mutex::new(connection)))
        })())
    }
}

fn list(connection: &Connection, start: &str, end: &str) -> Result<Vec<Event>, String> {
    let start = timestamp(start)?;
    let end = timestamp(end)?;
    if start >= end {
        return Err("조회 기간이 올바르지 않습니다.".into());
    }
    let mut statement = connection.prepare("SELECT id, title, memo, start, end, color, has_background FROM events WHERE start < ?2 AND end >= ?1 ORDER BY start, id").map_err(|e| e.to_string())?;
    let rows = statement
        .query_map(params![start, end], |row| {
            Ok(Event {
                id: row.get(0)?,
                title: row.get(1)?,
                memo: row.get(2)?,
                start: row.get(3)?,
                end: row.get(4)?,
                color: row.get(5)?,
                has_background: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())
}

fn save(connection: &Connection, mut event: Event, update: bool) -> Result<Event, String> {
    event.title = event.title.trim().to_owned();
    if event.title.is_empty() {
        return Err("제목을 입력해 주세요.".into());
    }
    event.start = timestamp(&event.start)?;
    event.end = timestamp(&event.end)?;
    if event.start > event.end {
        return Err("종료일은 시작일보다 빠를 수 없습니다.".into());
    }
    if update {
        let id = event.id.ok_or("수정할 일정 ID가 없습니다.")?;
        let changed = connection
            .execute(
                "UPDATE events SET title=?1, memo=?2, start=?3, end=?4, color=?5, has_background=?6 WHERE id=?7",
                params![
                    event.title,
                    event.memo,
                    event.start,
                    event.end,
                    event.color,
                    event.has_background,
                    id
                ],
            )
            .map_err(|e| e.to_string())?;
        if changed == 0 {
            return Err("일정을 찾을 수 없습니다.".into());
        }
    } else {
        connection
            .execute(
                "INSERT INTO events(title,memo,start,end,color,has_background) VALUES(?1,?2,?3,?4,?5,?6)",
                params![event.title, event.memo, event.start, event.end, event.color, event.has_background],
            )
            .map_err(|e| e.to_string())?;
        event.id = Some(connection.last_insert_rowid());
    }
    Ok(event)
}

fn remove(connection: &Connection, id: i64) -> Result<(), String> {
    let changed = connection
        .execute("DELETE FROM events WHERE id=?1", [id])
        .map_err(|e| e.to_string())?;
    if changed == 0 {
        return Err("일정을 찾을 수 없습니다.".into());
    }
    Ok(())
}

async fn run<T: Send + 'static>(
    database: Database,
    action: impl FnOnce(&Connection) -> Result<T, String> + Send + 'static,
) -> Result<T, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let connection = database.0?;
        let guard = connection
            .lock()
            .map_err(|_| "DB 연결에 문제가 발생했습니다.".to_string())?;
        action(&guard)
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
pub async fn fetch_events(
    database: tauri::State<'_, Database>,
    start: String,
    end: String,
) -> Result<Vec<Event>, String> {
    run(database.inner().clone(), move |c| list(c, &start, &end)).await
}
#[tauri::command]
pub async fn create_event(
    database: tauri::State<'_, Database>,
    event: Event,
) -> Result<Event, String> {
    run(database.inner().clone(), move |c| save(c, event, false)).await
}
#[tauri::command]
pub async fn update_event(
    database: tauri::State<'_, Database>,
    event: Event,
) -> Result<Event, String> {
    run(database.inner().clone(), move |c| save(c, event, true)).await
}
#[tauri::command]
pub async fn delete_event(database: tauri::State<'_, Database>, id: i64) -> Result<(), String> {
    run(database.inner().clone(), move |c| remove(c, id)).await
}

#[cfg(test)]
mod tests {
    use super::*;

    fn test_database() -> Connection {
        let connection = Connection::open_in_memory().unwrap();
        initialize(&connection).unwrap();
        connection
    }

    fn sample_event() -> Event {
        Event {
            id: None,
            title: "일정".into(),
            memo: Some("메모".into()),
            start: "2026-10-31T23:30:00+09:00".into(),
            end: "2026-11-02T00:00:00+09:00".into(),
            color: "#123456".into(),
            has_background: false,
        }
    }

    #[test]
    fn initialize_can_run_twice() {
        let connection = test_database();

        initialize(&connection).unwrap();

        let saved = save(&connection, sample_event(), false).unwrap();
        assert!(saved.id.is_some());
    }

    #[test]
    fn save_converts_dates_to_utc() {
        let connection = test_database();

        let saved = save(&connection, sample_event(), false).unwrap();

        assert_eq!(saved.start, "2026-10-31T14:30:00.000Z");
        assert_eq!(saved.end, "2026-11-01T15:00:00.000Z");
    }

    #[test]
    fn list_returns_events_overlapping_the_range() {
        let connection = test_database();
        let saved = save(&connection, sample_event(), false).unwrap();

        let events = list(&connection, "2026-10-31T00:00:00Z", "2026-11-01T00:00:00Z").unwrap();

        assert_eq!(events.len(), 1);
        assert_eq!(events[0].id, saved.id);
    }

    #[test]
    fn list_excludes_events_starting_at_the_range_end() {
        let connection = test_database();
        let saved = save(&connection, sample_event(), false).unwrap();

        let events = list(&connection, "2026-10-01T00:00:00Z", &saved.start).unwrap();

        assert!(events.is_empty());
    }

    #[test]
    fn list_includes_events_ending_at_the_range_start() {
        let connection = test_database();
        let saved = save(&connection, sample_event(), false).unwrap();

        let events = list(&connection, &saved.end, "2026-11-03T00:00:00Z").unwrap();

        assert_eq!(events.len(), 1);
        assert_eq!(events[0].id, saved.id);
    }

    #[test]
    fn moving_an_event_removes_it_from_the_old_range() {
        let connection = test_database();
        let mut event = save(&connection, sample_event(), false).unwrap();
        event.start = "2026-12-01T00:00:00Z".into();
        event.end = "2026-12-02T00:00:00Z".into();

        let updated = save(&connection, event, true).unwrap();

        let old_events = list(&connection, "2026-10-01T00:00:00Z", "2026-11-03T00:00:00Z").unwrap();
        let new_events = list(&connection, "2026-12-01T00:00:00Z", "2026-12-03T00:00:00Z").unwrap();
        assert!(old_events.is_empty());
        assert_eq!(new_events.len(), 1);
        assert_eq!(new_events[0].id, updated.id);
    }

    #[test]
    fn deleted_events_are_not_returned() {
        let connection = test_database();
        let saved = save(&connection, sample_event(), false).unwrap();

        remove(&connection, saved.id.unwrap()).unwrap();

        let events = list(&connection, "2026-01-01T00:00:00Z", "2027-01-01T00:00:00Z").unwrap();
        assert!(events.is_empty());
    }

    #[test]
    fn deleting_a_missing_event_returns_an_error() {
        let connection = test_database();

        let result = remove(&connection, 999);

        assert_eq!(result.unwrap_err(), "일정을 찾을 수 없습니다.");
    }

    #[test]
    fn updating_a_deleted_event_returns_an_error() {
        let connection = test_database();
        let saved = save(&connection, sample_event(), false).unwrap();
        remove(&connection, saved.id.unwrap()).unwrap();

        let result = save(&connection, saved, true);

        assert_eq!(result.unwrap_err(), "일정을 찾을 수 없습니다.");
    }

    #[test]
    fn blank_titles_are_rejected() {
        let connection = test_database();
        let mut event = sample_event();
        event.title = " ".into();

        let result = save(&connection, event, false);

        assert_eq!(result.unwrap_err(), "제목을 입력해 주세요.");
    }

    #[test]
    fn invalid_dates_are_rejected() {
        let connection = test_database();
        let mut event = sample_event();
        event.start = "invalid".into();

        let result = save(&connection, event, false);

        assert_eq!(result.unwrap_err(), "올바른 날짜가 아닙니다.");
    }

    #[test]
    fn end_before_start_is_rejected() {
        let connection = test_database();
        let mut event = sample_event();
        event.end = "2020-01-01T00:00:00Z".into();

        let result = save(&connection, event, false);

        assert_eq!(result.unwrap_err(), "종료일은 시작일보다 빠를 수 없습니다.");
    }

    #[test]
    fn newer_database_versions_are_rejected() {
        let connection = test_database();
        connection.pragma_update(None, "user_version", 3).unwrap();

        let result = initialize(&connection);

        assert_eq!(result.unwrap_err(), "더 최신 버전의 앱에서 만든 DB입니다.");
    }

    #[test]
    fn saved_events_remain_after_reopening_the_database() {
        let path = std::env::temp_dir().join(format!(
            "kkulog-test-{}-{}.sqlite3",
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_nanos()
        ));
        {
            let connection = Connection::open(&path).unwrap();
            initialize(&connection).unwrap();
            save(&connection, sample_event(), false).unwrap();
        }

        let connection = Connection::open(&path).unwrap();
        initialize(&connection).unwrap();
        let events = list(&connection, "2026-01-01T00:00:00Z", "2027-01-01T00:00:00Z").unwrap();

        assert_eq!(events.len(), 1);
        assert_eq!(events[0].memo.as_deref(), Some("메모"));
        drop(connection);
        std::fs::remove_file(path).unwrap();
    }
}
