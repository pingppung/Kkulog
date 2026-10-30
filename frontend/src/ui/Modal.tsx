import type { ReactNode } from "react";
export default function Modal({ children, label = "일정 편집" }: { children: ReactNode; label?: string }) {
  return <div role="dialog" aria-modal="true" aria-label={label} className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 px-4 py-8">
    <div className="relative w-full max-w-md max-h-[calc(100vh-4rem)] flex flex-col bg-white rounded-2xl shadow-sm">{children}</div>
  </div>;
}
