import { useRef, useState } from "react";
import type { ReactNode, KeyboardEvent, PointerEvent } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Settings, Palette, Database } from "lucide-react";
import DisplaySettings from "./DisplaySettings";
import "./settings.css";

const tabs = ["일반", "화면", "데이터"];
const tabIcons = [Settings, Palette, Database];

function dragSettingsWindow(event: PointerEvent<HTMLElement>) {
  if (!isTauri() || event.button !== 0 || event.pointerType !== "mouse") return;
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (target.closest('button, a, input, textarea, select, option, label, [role="tab"], [role="switch"], [contenteditable], .no-drag')) return;
  // Leave native scrollbars available for dragging their thumbs.
  const bounds = target.getBoundingClientRect();
  if ((target.offsetWidth > target.clientWidth && event.clientX >= bounds.left + target.clientLeft + target.clientWidth)
    || (target.offsetHeight > target.clientHeight && event.clientY >= bounds.top + target.clientTop + target.clientHeight)) return;
  event.preventDefault();
  void getCurrentWindow().startDragging().catch(error => console.error("설정 창을 이동하지 못했습니다.", error));
}

function Row({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return <div className="settings-row">
    <div className="settings-row-copy"><h2>{title}</h2>{description && <p>{description}</p>}</div>
    <div className="settings-control">{children}</div>
  </div>;
}

function PendingSwitch({ label }: { label: string }) {
  return <><span className="settings-pending">준비 중</span><button type="button" role="switch" aria-label={label} aria-checked={false} disabled className="settings-switch"><span /></button></>;
}

export default function SettingsPage() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") === "display" ? 1 : 0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === "ArrowDown") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowUp") next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;
    event.preventDefault();
    setActiveTab(next);
    tabRefs.current[next]?.focus();
  };

  return <main className="calendar-surface settings-page settings-shell" onPointerDown={dragSettingsWindow}>
    <aside className="settings-sidebar" aria-label="설정 메뉴">
    <header className="settings-header">
      <Link to="/" className="settings-back no-drag" aria-label="캘린더로 돌아가기"><ArrowLeft size={17} aria-hidden="true" /><span>뒤로 가기</span></Link>
      <h1 className="pointer-events-none">설정</h1>
    </header>
    <div className="settings-tabs" role="tablist" aria-label="설정 분류" aria-orientation="vertical">
      {tabs.map((tab, index) => {
        const Icon = tabIcons[index];
        return <button key={tab} type="button" role="tab" id={`settings-tab-${index}`} aria-controls={`settings-panel-${index}`} aria-selected={activeTab === index} tabIndex={activeTab === index ? 0 : -1} ref={node => { tabRefs.current[index] = node; }} onClick={() => setActiveTab(index)} onKeyDown={event => handleTabKey(event, index)}><Icon size={16} aria-hidden="true" /><span>{tab}</span></button>;
      })}
    </div>
    </aside>
    <div className="settings-main">
      <section key={activeTab} className={activeTab === 1 ? "settings-display-panel" : "settings-content"} role="tabpanel" id={`settings-panel-${activeTab}`} aria-labelledby={`settings-tab-${activeTab}`} tabIndex={0}>
      {activeTab === 0 && <>
        <Row title="시작 시 자동 실행" description="컴퓨터에 로그인하면 꾸로그를 실행합니다."><PendingSwitch label="시작 시 자동 실행" /></Row>
        <Row title="마지막 위치 기억" description="다시 실행할 때 이전 창 위치를 사용합니다."><PendingSwitch label="마지막 위치 기억" /></Row>
        <Row title="마지막 크기 기억" description="다시 실행할 때 이전 창 크기를 사용합니다."><PendingSwitch label="마지막 크기 기억" /></Row>
      </>}
      {activeTab === 1 && <DisplaySettings />}
      {activeTab === 2 && <>
        <Row title="데이터 백업" description="일정, 설정, 배경 이미지를 하나의 파일로 보관합니다."><button type="button" className="settings-action" disabled>백업 · 준비 중</button></Row>
        <Row title="데이터 복원" description="백업 파일의 내용으로 현재 일정과 설정을 교체합니다."><button type="button" className="settings-action" disabled>복원 · 준비 중</button></Row>
        <div className="settings-danger"><h2 className="settings-danger-title">초기화</h2>
          <Row title="일정 데이터 전체 삭제" description="등록된 모든 일정을 삭제합니다."><button type="button" className="settings-action" disabled>전체 삭제 · 준비 중</button></Row>
          <Row title="설정 초기화" description="일정은 유지하고 설정을 기본값으로 되돌립니다."><button type="button" className="settings-action" disabled>설정 초기화 · 준비 중</button></Row>
        </div>
      </>}
    </section>
    </div>
  </main>;
}
