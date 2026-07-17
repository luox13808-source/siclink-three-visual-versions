"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

export type VisualVersion = "black" | "diffuse" | "starfield";

type VisualVersionContextValue = {
  version: VisualVersion;
  setVersion: (version: VisualVersion) => void;
};

const STORAGE_KEY = "siclink-visual-version";
const DEFAULT_VERSION: VisualVersion = "starfield";

const VERSION_OPTIONS: Array<{ value: VisualVersion; label: string }> = [
  { value: "black", label: "纯黑" },
  { value: "diffuse", label: "弥散光" },
  { value: "starfield", label: "星空" },
];

const VisualVersionContext = createContext<VisualVersionContextValue | null>(null);

function isVisualVersion(value: string | undefined | null): value is VisualVersion {
  return value === "black" || value === "diffuse" || value === "starfield";
}

export function VisualVersionProvider({ children }: PropsWithChildren) {
  const [version, setVersionState] = useState<VisualVersion>(DEFAULT_VERSION);

  useEffect(() => {
    const currentVersion = document.documentElement.dataset.visualVersion;
    if (isVisualVersion(currentVersion)) {
      setVersionState(currentVersion);
    }
  }, []);

  const setVersion = (nextVersion: VisualVersion) => {
    setVersionState(nextVersion);
    document.documentElement.dataset.visualVersion = nextVersion;

    try {
      window.localStorage.setItem(STORAGE_KEY, nextVersion);
    } catch {
      // 浏览器禁用本地存储时，当前页面内的切换仍然有效。
    }

    window.dispatchEvent(
      new CustomEvent<VisualVersion>("siclink-visual-version-change", {
        detail: nextVersion,
      }),
    );
  };

  const value = useMemo(() => ({ version, setVersion }), [version]);

  return (
    <VisualVersionContext.Provider value={value}>
      {children}
      <div className="visual-version-switcher" role="radiogroup" aria-label="切换网站视觉版本">
        {VERSION_OPTIONS.map((option) => {
          const isActive = version === option.value;

          return (
            <button
              key={option.value}
              type="button"
              className={`visual-version-option${isActive ? " is-active" : ""}`}
              role="radio"
              aria-checked={isActive}
              onClick={() => setVersion(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </VisualVersionContext.Provider>
  );
}

export function useVisualVersion() {
  const context = useContext(VisualVersionContext);
  if (!context) {
    throw new Error("useVisualVersion must be used inside VisualVersionProvider");
  }

  return context;
}
