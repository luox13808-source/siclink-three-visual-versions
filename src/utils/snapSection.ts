import { navigateToSection } from "@/animations/sectionJump";
import { exitFreeBrowse, isFreeBrowse } from "@/utils/freeBrowse";

export type SnapSectionId = "hero" | "position" | "core" | "open-source" | "community" | "footer";

const SNAP_ORDER: SnapSectionId[] = ["hero", "position", "core", "open-source", "community", "footer"];

function getSnapTarget(id: SnapSectionId): HTMLElement | null {
  if (id === "position") {
    return document.getElementById("position") ?? document.getElementById("hero");
  }
  return document.getElementById(id);
}

/** 根据视口位置找到最近的阶段区块 */
export function findNearestSnapSection(): SnapSectionId {
  const viewportCenter = window.innerHeight * 0.42;
  let bestId: SnapSectionId = "hero";
  let bestScore = Number.POSITIVE_INFINITY;

  for (const id of SNAP_ORDER) {
    const el = getSnapTarget(id);
    if (!el) continue;

    const rect = el.getBoundingClientRect();
    if (rect.height <= 0) continue;

    // 区块在视口内越靠中心分数越高
    const center = (rect.top + rect.bottom) / 2;
    const distance = Math.abs(center - viewportCenter);

    // 视口完全滚过该区块后降低优先级
    const fullyAbove = rect.bottom < window.innerHeight * 0.12;
    const fullyBelow = rect.top > window.innerHeight * 0.88;
    const penalty = fullyAbove || fullyBelow ? window.innerHeight : 0;

    const score = distance + penalty;
    if (score < bestScore) {
      bestScore = score;
      bestId = id;
    }
  }

  return bestId;
}

/** 滑块松手：吸附到最近页面并恢复滚轮阶段导航 */
export function finishFreeBrowseAndSnap() {
  if (!isFreeBrowse()) return;

  const nearest = findNearestSnapSection();

  if (nearest === "footer") {
    exitFreeBrowse();
    window.dispatchEvent(new CustomEvent("siclink-disengage-stages"));
    const footer = document.getElementById("footer");
    const lenis = window.__siclinkLenis;
    if (footer) {
      lenis?.start();
      lenis?.scrollTo(footer, { duration: 0.55 });
    }
    return;
  }

  // navigateToSection 内部会 exitFreeBrowse + 重新 engage 对应阶段
  navigateToSection(nearest);
}
