export function isFreeBrowse() {
  return typeof document !== "undefined" && document.documentElement.classList.contains("is-free-browse");
}

/** 右侧滑块 / 原生滚动：退出阶段锁，但保留各区块内容可见，避免黑屏 */
export function enterFreeBrowse() {
  if (typeof document === "undefined") return;

  document.documentElement.classList.add("is-free-browse");
  document.documentElement.classList.remove("is-scroll-locked", "is-core-active", "is-open-community-active");
  document.body.classList.remove("is-scroll-locked");

  window.dispatchEvent(new CustomEvent("siclink-enter-free-browse"));
}

export function exitFreeBrowse() {
  if (typeof document === "undefined") return;
  document.documentElement.classList.remove("is-free-browse");
}
