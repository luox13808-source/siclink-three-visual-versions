"use client";

import { engageCoreSection } from "@/animations/coreSectionTransition";
import {
  engageCommunitySection,
  engageOpenWithReveal,
} from "@/animations/openCommunityTransition";
import { snapScrollTo, unlockPageScroll } from "@/animations/stageNavigation";
import { exitFreeBrowse } from "@/utils/freeBrowse";

export function navigateToSection(sectionId: string) {
  unlockPageScroll();
  exitFreeBrowse();

  const target = document.getElementById(sectionId);
  if (!target) return;

  window.dispatchEvent(new CustomEvent("siclink-disengage-stages"));

  snapScrollTo(target);

  // 核心技术首屏需要与滚动定位在同一帧激活；延迟会暴露透明的初始面板，造成黑屏闪烁。
  if (sectionId === "core") {
    engageCoreSection();
    return;
  }

  window.setTimeout(() => {
    switch (sectionId) {
      case "hero":
        window.dispatchEvent(new CustomEvent("hero-reset"));
        break;
      case "position":
        window.dispatchEvent(new CustomEvent("hero-enter-position"));
        break;
      case "open-source":
        engageOpenWithReveal();
        break;
      case "community":
        engageCommunitySection();
        break;
      default:
        break;
    }
  }, 80);
}
