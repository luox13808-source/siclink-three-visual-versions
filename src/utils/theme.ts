export type Theme = "dark" | "light";

export function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";

  const saved = window.localStorage.getItem("siclink-theme");
  if (saved === "dark" || saved === "light") return saved;

  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function saveTheme(theme: Theme) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("siclink-theme", theme);
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
}
