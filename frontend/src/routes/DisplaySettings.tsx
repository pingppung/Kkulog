import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { fontOptions, isHexColor, useSettingsStore } from "../store/setting";
import type { ColorKey } from "../store/setting";
import MiniCalendarPreview from "../features/calendar/MiniCalendarPreview";
import "./settings.css";

const groups: { title: string; fields: { key: ColorKey; label: string }[] }[] = [
  { title: "배경·칸", fields: [
    { key: "background", label: "상단 배경" },
    { key: "weekdayHeaderBackground", label: "요일 줄 배경 (일~토)" },
    { key: "weekdayBackground", label: "평일 칸" },
    { key: "weekendBackground", label: "주말 칸" },
    { key: "otherBackground", label: "전달·다음달 칸" },
    { key: "grid", label: "테두리·구분선" },
    { key: "accent", label: "버튼 배경" },
  ] },
  { title: "글자", fields: [
    { key: "text", label: "기본" },
    { key: "headerText", label: "상단" },
    { key: "eventText", label: "일정" },
    { key: "saturday", label: "토요일" },
    { key: "sunday", label: "일요일" },
    { key: "muted", label: "전달·다음달" },
    { key: "accentText", label: "버튼" },
  ] },
  { title: "오늘 날짜", fields: [
    { key: "todayBackground", label: "오늘 칸 색상" },
    { key: "today", label: "오늘 동그라미 색상" }, { key: "todayText", label: "오늘 글자 색상" },
  ] },
];

function ColorField({ colorKey, label }: { colorKey: ColorKey; label: string }) {
  const value = useSettingsStore(state => (state.preview ?? state.colors)[colorKey]);
  const setColor = useSettingsStore(state => state.setColor);
  const [draft, setDraft] = useState<string | null>(null);
  const invalid = draft !== null && !isHexColor(draft);
  return <div className="settings-row">
    <label htmlFor={`color-${colorKey}`}>{label}</label>
    <div className="settings-color-inputs">
      <input id={`color-${colorKey}`} type="color" value={value} onChange={event => { setColor(colorKey, event.target.value); setDraft(null); }} />
      <input type="text" aria-label={`${label} HEX 코드`} aria-invalid={invalid} aria-describedby={invalid ? `error-${colorKey}` : undefined} value={draft ?? value} spellCheck={false} maxLength={7} onChange={event => {
        const next = event.target.value;
        setDraft(next);
        if (isHexColor(next)) setColor(colorKey, next);
      }} onBlur={() => setDraft(null)} onKeyDown={event => { if (event.key === "Escape") setDraft(null); }} />
      {invalid && <span id={`error-${colorKey}`} className="color-error">#과 6자리 색상 코드를 입력하세요.</span>}
    </div>
  </div>;
}

export default function DisplaySettings() {
  const resetColors = useSettingsStore(state => state.resetColors);
  const colors = useSettingsStore(state => state.preview ?? state.colors);
  const savedColors = useSettingsStore(state => state.colors);
  const transparency = useSettingsStore(state => state.previewTransparency ?? state.transparency);
  const savedTransparency = useSettingsStore(state => state.transparency);
  const font = useSettingsStore(state => state.previewFont ?? state.font);
  const savedFont = useSettingsStore(state => state.font);
  const setFont = useSettingsStore(state => state.setFont);
  const setTransparency = useSettingsStore(state => state.setTransparency);
  const hasChanges = font !== savedFont || transparency !== savedTransparency || (Object.keys(colors) as ColorKey[]).some(key => colors[key] !== savedColors[key]);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    return () => useSettingsStore.getState().setPreview(null);
  }, []);

  const cancel = () => {
    useSettingsStore.getState().setPreview(null);
    setError("");
    setStatus("변경을 취소했습니다. 저장된 화면 설정으로 돌아갑니다.");
  };
  const save = () => {
    setError("");
    try {
      useSettingsStore.getState().saveColors(colors, transparency);
      setStatus("화면 설정을 저장했습니다.");
    } catch { setError("화면 설정을 저장하지 못했습니다. 다시 시도해 주세요."); }
  };
  return <div className="display-settings">
    <div className="display-layout">
      <section className="display-preview" aria-labelledby="display-preview-title">
        <div className="display-preview-heading">
          <h2 id="display-preview-title">미리보기</h2>
          <p>변경한 색상이 실시간으로 반영됩니다.</p>
        </div>
        <MiniCalendarPreview />
      </section>
      <section className="display-editor" aria-labelledby="display-settings-title">
      <div className="display-controls" tabIndex={0} aria-label="화면 설정 항목">
        <div className="display-heading"><div><h2 id="display-settings-title">화면 설정</h2><p>위젯의 색상을 자유롭게 설정하세요.</p></div><button type="button" className="settings-action" onClick={() => { resetColors(); setStatus(""); }}><RotateCcw size={12} aria-hidden="true" />초기화</button></div>
        {groups.map(group => <fieldset key={group.title} className="display-card">
          <legend>{group.title}</legend>
          {group.fields.map(field => <ColorField key={field.key} colorKey={field.key} label={field.label} />)}
          {group.title === "배경·칸" && <>
            <div className="settings-row"><label htmlFor="calendar-transparency">투명도</label><div className="settings-slider"><input id="calendar-transparency" type="range" min="0" max="100" step="1" value={transparency} onChange={event => setTransparency(Number(event.target.value))} aria-valuetext={`${transparency}% 투명, 배경 불투명도 ${100 - transparency}%`} aria-describedby="transparency-hint" /><output htmlFor="calendar-transparency">{transparency}%</output></div><p id="transparency-hint">높일수록 배경이 투명해집니다. 글자와 일정은 선명하게 유지됩니다.</p></div>
            <div className="settings-row"><span>배경 블러</span><span className="settings-pending">준비 중</span></div>
            <div className="settings-row"><span>배경 이미지 사용</span><button type="button" className="settings-action" disabled>이미지 선택 · 준비 중</button></div>
          </>}
          {group.title === "글자" && <>
            <div className="settings-row"><label htmlFor="app-font">전체 글꼴</label><div className="settings-control"><select id="app-font" value={font} onChange={event => { const option = fontOptions.find(item => item.value === event.target.value); if (option) setFont(option.value); }}>{fontOptions.map(option => <option key={option.value} value={option.value} style={{ fontFamily: option.family }}>{option.label}</option>)}</select></div><p>앱 전체에 적용됩니다. 저장하면 다음 실행에도 유지됩니다.</p></div>
            <div className="settings-row"><span>글자 크기</span><select aria-label="글자 크기" disabled defaultValue="pending"><option value="pending">준비 중</option><option>작게</option><option>기본</option><option>크게</option></select></div>
          </>}
        </fieldset>)}
      </div>
    <footer className="color-editor-footer"><span className="display-feedback" role={error ? "alert" : "status"}>{error || (hasChanges ? "저장하지 않은 변경 사항이 있습니다." : status || "저장을 눌러야 변경 사항이 적용됩니다.")}</span><button type="button" className="settings-action" onClick={cancel}>취소</button><button type="button" className="settings-action color-editor-save" onClick={save}>저장</button></footer>
      </section>
    </div>
  </div>;
}
