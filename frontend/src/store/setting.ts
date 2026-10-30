import { create } from "zustand";

export const fontOptions = [
  { value: "system", label: "기본", family: '"Segoe UI", "Malgun Gothic", sans-serif' },
  { value: "malgun", label: "맑은 고딕", family: '"Malgun Gothic", sans-serif' },
  { value: "siganpyo", label: "학교안심 시간표", family: '"SiganpyoR", "Malgun Gothic", sans-serif' },
  { value: "jayusigan", label: "학교안심 자유시간", family: '"JayusiganR", "Malgun Gothic", sans-serif' },
] as const;
export type AppFont = typeof fontOptions[number]["value"];
export const defaultFont: AppFont = "system";
export const validFont = (value: unknown): value is AppFont => fontOptions.some(font => font.value === value);

export const defaultColors = {
  headerText: "#20242c",
  eventText: "#252b36",
  weekdayHeaderBackground: "#fdfdfe",
  weekdayBackground: "#fdfdfe", weekendBackground: "#fdfdfe",
  todayBackground: "#a0a8b6", otherBackground: "#fdfdfe",
  background: "#fdfdfe", text: "#20242c", muted: "#b8becb",
  accent: "#20232b", accentText: "#ffffff", today: "#20242c",
  todayText: "#ffffff", saturday: "#1683f8", sunday: "#fa515b", grid: "#64748b",
};
export type ColorKey = keyof typeof defaultColors;
export type CalendarColors = typeof defaultColors;
export const defaultTransparency = 28;
export const validTransparency = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100;
export const isHexColor = (value: unknown): value is string => typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);

export function validColors(value: unknown): value is CalendarColors {
  return !!value && typeof value === "object" && (Object.keys(defaultColors) as ColorKey[]).every(key => isHexColor((value as CalendarColors)[key]));
}

export function parseAppearance(raw: string | null) {
  try {
    const saved = JSON.parse(raw ?? "null")?.state;
    const colors = { ...defaultColors, ...saved?.colors };
    if (saved?.colors?.headerText === undefined && isHexColor(saved?.colors?.text)) colors.headerText = saved.colors.text;
    for (const key of ["weekdayBackground", "weekendBackground", "otherBackground"] as const) {
      if (saved?.colors?.[key] === undefined && isHexColor(saved?.colors?.background)) colors[key] = saved.colors.background;
    }
    return {
      colors: validColors(colors) ? colors : { ...defaultColors },
      transparency: validTransparency(saved?.transparency) ? Math.round(saved.transparency) : defaultTransparency,
      font: validFont(saved?.font) ? saved.font : defaultFont,
    };
  } catch { return { colors: { ...defaultColors }, transparency: defaultTransparency, font: defaultFont }; }
}

function loadAppearance() {
  try { return parseAppearance(localStorage.getItem("kkulog-colors")); }
  catch { return parseAppearance(null); }
}

export const useSettingsStore = create<{
  colors: CalendarColors;
  preview: CalendarColors | null;
  transparency: number;
  previewTransparency: number | null;
  font: AppFont;
  previewFont: AppFont | null;
  setFont: (font: AppFont) => void;
  setTransparency: (value: number) => void;
  setPreview: (colors: CalendarColors | null) => void;
  saveColors: (colors: CalendarColors, transparency?: number) => void;
  setColor: (key: ColorKey, color: string) => void;
  resetColors: () => void;
}>()((set, get) => ({
  ...loadAppearance(),
  preview: null,
  previewTransparency: null,
  previewFont: null,
  setFont: font => { if (validFont(font)) set({ previewFont: font }); },
  setTransparency: value => {
    if (validTransparency(value)) set({ previewTransparency: Math.round(value) });
  },
  setPreview: preview => set(preview === null ? { preview: null, previewTransparency: null, previewFont: null } : { preview }),
  saveColors: (colors, transparency = get().previewTransparency ?? get().transparency) => {
    if (!validColors(colors)) throw new Error("올바른 색상 값이 아닙니다.");
    if (!validTransparency(transparency)) throw new Error("투명도는 0~100% 사이여야 합니다.");
    transparency = Math.round(transparency);
    const font = get().previewFont ?? get().font;
    localStorage.setItem("kkulog-colors", JSON.stringify({ state: { colors, transparency, font }, version: 0 }));
    set({ colors: { ...colors }, transparency, font, preview: null, previewTransparency: null, previewFont: null });
  },
  setColor: (key, color) => {
    if (Object.hasOwn(defaultColors, key) && isHexColor(color)) {
      set(state => ({ preview: { ...(state.preview ?? state.colors), [key]: color.toLowerCase() } }));
    }
  },
  resetColors: () => set({ preview: { ...defaultColors }, previewTransparency: defaultTransparency, previewFont: defaultFont }),
}));
