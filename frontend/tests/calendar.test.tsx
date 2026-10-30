import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { createLatestRequest } from '../src/features/calendar/latestRequest';
import { fetchEvents, createEvent, updateEvent, deleteEvent } from '../src/features/calendar/api';
import { buildCalendarDays, splitEventByWeek } from '../src/features/calendar/calendar.utils';
import EventForm from '../src/features/calendar/EventForm';
import MiniCalendarPreview from '../src/features/calendar/MiniCalendarPreview';

test('설정 미리보기에는 날짜와 일정이 표시되고 편집 기능은 없다', () => {
  const markup = renderToStaticMarkup(<MiniCalendarPreview />);
  assert.match(markup, /calendar-weekday-header/);
  assert.match(markup, /day-cell--weekday-current/);
  assert.match(markup, /day-cell--sat-current/);
  assert.match(markup, /day-cell--sun-current/);
  assert.match(markup, /day-cell--today/);
  assert.match(markup, /event-bar-inner--filled/);
  assert.match(markup, /event-bar-inner--single/);
  assert.match(markup, /inert=""/);
  assert.doesNotMatch(markup, /<button|<input|<table/);
});

describe('화면 설정', () => {
  const storage = new Map<string, string>();
  let failWrite = false;
  let originalStorage: PropertyDescriptor | undefined;
  let store: typeof import('../src/store/setting').useSettingsStore;
  let defaultColors: typeof import('../src/store/setting').defaultColors;
  let parseAppearance: typeof import('../src/store/setting').parseAppearance;

  beforeEach(async () => {
    originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
    storage.clear();
    failWrite = false;
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => {
          if (failWrite) throw new Error('저장 공간 부족');
          storage.set(key, value);
        },
      },
    });

    const settings = await import('../src/store/setting');
    store = settings.useSettingsStore;
    defaultColors = settings.defaultColors;
    parseAppearance = settings.parseAppearance;
    store.setState({
      ...parseAppearance(null),
      preview: null,
      previewTransparency: null,
      previewFont: null,
    });
  });

  afterEach(() => {
    if (originalStorage) {
      Object.defineProperty(globalThis, 'localStorage', originalStorage);
    } else {
      Reflect.deleteProperty(globalThis, 'localStorage');
    }
  });

  test('이전 버전의 배경색과 글자색을 새 설정에도 적용한다', () => {
    const saved = JSON.stringify({
      state: { colors: { background: '#abcdef', text: '#123456' } },
    });
    const { colors } = parseAppearance(saved);

    assert.equal(colors.weekdayBackground, '#abcdef');
    assert.equal(colors.weekendBackground, '#abcdef');
    assert.equal(colors.otherBackground, '#abcdef');
    assert.equal(colors.text, '#123456');
    assert.equal(colors.headerText, '#123456');
    assert.equal(colors.todayBackground, defaultColors.todayBackground);
    assert.equal(colors.weekdayHeaderBackground, defaultColors.weekdayHeaderBackground);
    assert.equal(colors.eventText, defaultColors.eventText);
  });

  test('개별 색상을 저장했다면 이전 배경색으로 덮어쓰지 않는다', () => {
    const colors = {
      ...defaultColors,
      background: '#abcdef',
      text: '#123456',
      headerText: '#334455',
      weekendBackground: '#654321',
      todayBackground: '#112233',
      weekdayHeaderBackground: '#445566',
      eventText: '#778899',
    };

    assert.deepEqual(parseAppearance(JSON.stringify({ state: { colors } })).colors, colors);
  });

  test('투명도 설정이 없거나 범위를 벗어나면 기본값을 사용한다', () => {
    assert.equal(parseAppearance(JSON.stringify({ state: { colors: defaultColors } })).transparency, 28);
    assert.equal(parseAppearance(JSON.stringify({ state: { transparency: 101 } })).transparency, 28);
  });

  test('저장된 글꼴이 없거나 알 수 없는 값이면 기본 글꼴을 사용한다', () => {
    assert.equal(parseAppearance(null).font, 'system');
    assert.equal(parseAppearance(JSON.stringify({ state: { font: 'unknown' } })).font, 'system');
  });

  test('색상을 바꾸는 동안에는 미리보기에만 적용한다', () => {
    store.getState().setColor('background', '#123456');

    assert.equal(store.getState().preview?.background, '#123456');
    assert.equal(store.getState().colors.background, defaultColors.background);
    assert.equal(storage.size, 0);
  });

  test('취소하면 미리보기를 비우고 저장된 설정을 유지한다', () => {
    const colors = { ...defaultColors, background: '#abcdef' };
    store.getState().saveColors(colors);
    const saved = storage.get('kkulog-colors');
    store.getState().setColor('background', '#123456');
    store.getState().setTransparency(65);
    store.getState().setFont('siganpyo');

    store.getState().setPreview(null);

    assert.equal(store.getState().preview, null);
    assert.equal(store.getState().previewTransparency, null);
    assert.equal(store.getState().previewFont, null);
    assert.deepEqual(store.getState().colors, colors);
    assert.equal(store.getState().transparency, 28);
    assert.equal(store.getState().font, 'system');
    assert.equal(storage.get('kkulog-colors'), saved);
  });

  test('투명도를 바꾸는 동안에는 기존 값과 저장소를 유지한다', () => {
    store.getState().setTransparency(65);

    assert.equal(store.getState().previewTransparency, 65);
    assert.equal(store.getState().transparency, 28);
    assert.equal(storage.size, 0);
  });

  test('글꼴을 바꾸는 동안에는 미리보기에만 적용한다', () => {
    store.getState().setFont('siganpyo');

    assert.equal(store.getState().previewFont, 'siganpyo');
    assert.equal(store.getState().font, 'system');
    assert.equal(storage.size, 0);
  });

  test('저장하면 선택한 색상과 글꼴을 다시 불러올 수 있다', () => {
    const colors = { ...defaultColors, background: '#abcdef' };
    store.getState().setFont('jayusigan');

    store.getState().saveColors(colors);

    const saved = parseAppearance(storage.get('kkulog-colors')!);
    assert.deepEqual(saved.colors, colors);
    assert.equal(saved.font, 'jayusigan');
    assert.equal(store.getState().font, 'jayusigan');
    assert.equal(store.getState().previewFont, null);
  });

  for (const transparency of [0, 100]) {
    test(`투명도 ${transparency}%도 저장할 수 있다`, () => {
      store.getState().setTransparency(transparency);
      store.getState().saveColors(defaultColors);

      assert.equal(store.getState().transparency, transparency);
      assert.equal(parseAppearance(storage.get('kkulog-colors')!).transparency, transparency);
    });
  }

  test('초기화도 저장하기 전까지는 미리보기에만 적용한다', () => {
    const colors = { ...defaultColors, background: '#abcdef' };
    store.getState().setFont('jayusigan');
    store.getState().saveColors(colors, 100);
    const saved = storage.get('kkulog-colors');

    store.getState().resetColors();

    assert.deepEqual(store.getState().preview, defaultColors);
    assert.equal(store.getState().previewTransparency, 28);
    assert.equal(store.getState().previewFont, 'system');
    assert.deepEqual(store.getState().colors, colors);
    assert.equal(store.getState().transparency, 100);
    assert.equal(store.getState().font, 'jayusigan');
    assert.equal(storage.get('kkulog-colors'), saved);
  });

  test('저장이 실패하면 기존 설정과 저장 데이터를 유지한다', () => {
    const colors = { ...defaultColors, background: '#abcdef' };
    store.getState().saveColors(colors, 100);
    const saved = storage.get('kkulog-colors');
    store.getState().setTransparency(65);
    failWrite = true;

    assert.throws(() => store.getState().saveColors(defaultColors), /저장 공간 부족/);
    assert.deepEqual(store.getState().colors, colors);
    assert.equal(store.getState().transparency, 100);
    assert.equal(storage.get('kkulog-colors'), saved);
  });

  test('잘못된 색상이나 투명도는 미리보기에 적용하지 않는다', () => {
    store.getState().setColor('background', 'invalid');
    for (const value of [-1, 101, NaN, Infinity]) {
      store.getState().setTransparency(value);
    }

    assert.equal(store.getState().preview, null);
    assert.equal(store.getState().previewTransparency, null);
  });
});

test('설정 화면을 빠르게 열고 닫아도 원래 창 크기와 위치로 돌아온다', async () => {
  const previousWindow = globalThis.window;
  const previousTauri = (globalThis as any).isTauri;
  const calls: { command: string; args: any }[] = [];
  (globalThis as any).isTauri = true;
  // 150% 배율의 모니터에서 오른쪽 아래에 있는 창을 가정한다.
  globalThis.window = { __TAURI_INTERNALS__: {
    metadata: { currentWindow: { label: 'main' } },
    invoke: async (command: string, args: any) => {
      calls.push({ command, args: args ? JSON.parse(JSON.stringify(args)) : null });
      if (command.endsWith('|inner_size')) return { width: 900, height: 600 };
      if (command.endsWith('|outer_position')) return { x: 1000, y: 700 };
      if (command.endsWith('|scale_factor')) return 1.5;
      if (command.endsWith('|is_resizable')) return true;
      if (command.endsWith('|current_monitor')) return {
        name: 'test',
        scaleFactor: 1.5,
        position: { x: 0, y: 0 },
        size: { width: 1440, height: 1080 },
        workArea: { position: { x: 0, y: 0 }, size: { width: 1440, height: 1050 } },
      };
    },
  } } as any;
  try {
    const { syncSettingsWindow } = await import('../src/layouts/settingsWindow');
    await Promise.all([syncSettingsWindow(true), syncSettingsWindow(true), syncSettingsWindow(false)]);
    assert.equal(calls.filter(call => call.command.endsWith('|inner_size')).length, 1);
    const sizes = calls.filter(call => call.command.endsWith('|set_size'));
    assert.deepEqual(sizes.map(call => call.args.value), [
      { Logical: { width: 960, height: 700 } },
      { Physical: { width: 900, height: 600 } },
    ]);
    const positions = calls.filter(call => call.command.endsWith('|set_position'));
    assert.deepEqual(positions.map(call => call.args.value), [
      { Physical: { x: 0, y: 0 } },
      { Physical: { x: 1000, y: 700 } },
    ]);
    const constraints = calls.filter(call => call.command.endsWith('|set_size_constraints'));
    assert.equal(constraints.at(-1)?.args.value.maxWidth.Logical, 800);
    assert.deepEqual(calls.filter(call => call.command.endsWith('|set_resizable')).map(call => call.args.value), [false, true]);
  } finally {
    globalThis.window = previousWindow;
    (globalThis as any).isTauri = previousTauri;
  }
});

test('브라우저에서는 설정 창 크기를 변경하지 않는다', async () => {
  const previousTauri = (globalThis as any).isTauri;
  const previousWindow = globalThis.window;
  (globalThis as any).isTauri = false;
  globalThis.window = {
    __TAURI_INTERNALS__: {
      invoke: () => assert.fail('브라우저에서는 창 API를 호출하면 안 된다'),
    },
  } as any;

  try {
    const { syncSettingsWindow } = await import('../src/layouts/settingsWindow');
    await syncSettingsWindow(true);
  } finally {
    globalThis.window = previousWindow;
    (globalThis as any).isTauri = previousTauri;
  }
});

describe('일정 조회 순서', () => {
  let requests: ReturnType<typeof createLatestRequest>;
  let results: string[];
  let callbacks: {
    success: (data: string) => void;
    failure: () => void;
    complete: () => void;
  };

  beforeEach(() => {
    requests = createLatestRequest();
    results = [];
    callbacks = {
      success: data => results.push(data),
      failure: () => results.push('error'),
      complete: () => results.push('done'),
    };
  });

  test('늦게 도착한 이전 달의 결과는 무시한다', async () => {
    let resolvePreviousMonth!: (value: string) => void;
    const previousRequest = requests.run(
      () => new Promise<string>(resolve => { resolvePreviousMonth = resolve; }),
      callbacks,
    );
    await requests.run(async () => '이번 달 일정', callbacks);

    resolvePreviousMonth('이전 달 일정');
    await previousRequest;

    assert.deepEqual(results, ['이번 달 일정', 'done']);
  });

  test('무효화한 요청의 오류와 로딩 종료는 반영하지 않는다', async () => {
    let rejectPreviousRequest!: (error: Error) => void;
    const previousRequest = requests.run(
      () => new Promise<string>((_, reject) => { rejectPreviousRequest = reject; }),
      callbacks,
    );
    requests.invalidate();

    rejectPreviousRequest(new Error('이전 요청 실패'));
    await previousRequest;

    assert.deepEqual(results, []);
  });

  test('현재 요청이 실패하면 오류를 알리고 로딩을 끝낸다', async () => {
    await requests.run(async () => {
      throw new Error('DB 조회 실패');
    }, callbacks);

    assert.deepEqual(results, ['error', 'done']);
  });
});

describe('일정 API', () => {
  const savedEvent = {
    id: 1,
    title: '일정',
    memo: null,
    color: '#123456',
    start: '2026-10-31T14:30:00.000Z',
    end: '2026-11-01T14:59:59.999Z',
  };
  const event = {
    ...savedEvent,
    memo: undefined,
    start: new Date(savedEvent.start),
    end: new Date(savedEvent.end),
  };
  let previousWindow: typeof globalThis.window;
  let calls: { command: string; args: any }[];
  let failRequest: boolean;

  beforeEach(() => {
    previousWindow = globalThis.window;
    calls = [];
    failRequest = false;
    globalThis.window = {
      __TAURI_INTERNALS__: {
        invoke: async (command: string, args: any) => {
          calls.push({ command, args });
          if (failRequest) throw new Error('DB 접근 실패');
          if (command === 'fetch_events') return [savedEvent];
          if (command === 'delete_event') return undefined;
          return savedEvent;
        },
      },
    } as any;
  });

  afterEach(() => {
    globalThis.window = previousWindow;
  });

  test('마지막 표시일의 다음 날 자정까지 조회한다', async () => {
    const start = new Date(2026, 9, 1);
    const end = new Date(2026, 9, 31);

    await fetchEvents(start, end);

    assert.equal(calls[0].command, 'fetch_events');
    assert.equal(calls[0].args.start, start.toISOString());
    assert.equal(calls[0].args.end, new Date(2026, 10, 1).toISOString());
  });

  test('조회한 날짜 문자열을 Date로 변환한다', async () => {
    const events = await fetchEvents(new Date(2026, 9, 1), new Date(2026, 9, 31));

    assert.ok(events[0].start instanceof Date);
    assert.ok(events[0].end instanceof Date);
    assert.equal(events[0].start.toISOString(), savedEvent.start);
    assert.equal(events[0].end.toISOString(), savedEvent.end);
    assert.equal(events[0].memo, undefined);
  });

  test('추가할 일정의 날짜는 UTC 문자열로 전달한다', async () => {
    await createEvent(event);

    assert.equal(calls[0].command, 'create_event');
    assert.equal(calls[0].args.event.start, savedEvent.start);
    assert.equal(calls[0].args.event.end, savedEvent.end);
  });

  test('수정할 일정의 ID와 날짜를 전달한다', async () => {
    await updateEvent(event);

    assert.equal(calls[0].command, 'update_event');
    assert.equal(calls[0].args.event.id, event.id);
    assert.equal(calls[0].args.event.start, savedEvent.start);
    assert.equal(calls[0].args.event.end, savedEvent.end);
  });

  test('삭제할 일정의 ID를 전달한다', async () => {
    await deleteEvent(event.id);

    assert.equal(calls[0].command, 'delete_event');
    assert.equal(calls[0].args.id, event.id);
  });

  const operations = [
    { name: '조회', run: () => fetchEvents(new Date(2026, 9, 1), new Date(2026, 9, 31)) },
    { name: '추가', run: () => createEvent(event) },
    { name: '수정', run: () => updateEvent(event) },
    { name: '삭제', run: () => deleteEvent(event.id) },
  ];

  for (const operation of operations) {
    test(`일정 ${operation.name} 실패를 호출한 쪽에 전달한다`, async () => {
      failRequest = true;

      await assert.rejects(operation.run(), /DB 접근 실패/);
    });
  }
});

test('달을 걸치는 일정은 화면에 보이는 주 단위로 나눈다', () => {
  const days = buildCalendarDays(2026, 9);
  const event = {
    id: 1,
    title: '기간',
    color: '#123456',
    start: new Date(2026, 8, 30),
    end: new Date(2026, 10, 2),
  };

  const segments = splitEventByWeek(event, days);

  assert.equal(segments.length, 5);
  assert.equal(segments[0].colStart, 3);
  assert.equal(segments.at(-1)?.span, 7);
});

test('마지막 표시일의 늦은 밤 일정도 달력에 표시한다', () => {
  const days = buildCalendarDays(2026, 9);
  const finalDay = days.at(-1)!.date;
  const event = {
    id: 1,
    title: '밤 일정',
    color: '#123456',
    start: new Date(finalDay.getFullYear(), finalDay.getMonth(), finalDay.getDate(), 23, 30),
    end: new Date(finalDay.getFullYear(), finalDay.getMonth(), finalDay.getDate(), 23, 59),
  };

  const segments = splitEventByWeek(event, days);

  assert.equal(segments.length, 1);
  assert.equal(segments[0].colStart, 6);
});

test('일정 수정 화면을 열면 기존 제목과 메모, 기간 설정이 표시된다', () => {
  const event = {
    id: 1,
    title: '기존 일정',
    memo: '보관할 메모',
    color: '#123456',
    start: new Date(2026, 9, 1),
    end: new Date(2026, 9, 3),
  };

  const html = renderToStaticMarkup(
    <EventForm
      event={event}
      baseDate={new Date(2026, 9, 1)}
      onDelete={() => {}}
      onSubmit={() => {}}
      onClose={() => {}}
    />,
  );

  assert.match(html, /기존 일정/);
  assert.match(html, /보관할 메모/);
  assert.match(html, /checked/);
});
