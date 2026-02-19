//단순 UI 컨테이너
export default function CalendarLayout({
  theme,
  children,
}: {
  theme: string;
  children: React.ReactNode;
}) {
  return (
    <div data-theme={theme} className="w-full h-full">
      {children}
    </div>
  );
}
