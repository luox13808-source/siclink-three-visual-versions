import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SiClink 曦联万象 · 三版本整合版",
  description:
    "SiClink 官网纯黑、弥散光与星空背景三版本整合演示站。",
};

const visualVersionInitScript = `
  (function () {
    var fallback = "starfield";
    try {
      var saved = window.localStorage.getItem("siclink-visual-version");
      var valid = saved === "black" || saved === "diffuse" || saved === "starfield";
      document.documentElement.dataset.visualVersion = valid ? saved : fallback;
    } catch (error) {
      document.documentElement.dataset.visualVersion = fallback;
    }
  })();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="zh-CN"
      data-particle-demo
      data-theme="dark"
      data-visual-version="starfield"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: visualVersionInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
