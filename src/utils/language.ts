export type Language = "zh" | "en";

export function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "zh";

  const saved = window.localStorage.getItem("siclink-language");
  if (saved === "zh" || saved === "en") return saved;

  return window.navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
}

export function saveLanguage(language: Language) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("siclink-language", language);
}
