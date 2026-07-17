"use client";

import gsap from "gsap";
import { registerCoreStageHandlers } from "@/animations/stageRegistry";
import {
  forceWheelReady,
  lockPageScroll,
  refreshStageWheel,
  snapScrollTo,
  unlockPageScroll,
} from "@/animations/stageNavigation";
import { engageOpenWithReveal } from "@/animations/openCommunityTransition";
import { exitFreeBrowse } from "@/utils/freeBrowse";

export function initCoreSectionTransition() {
  const section = document.querySelector<HTMLElement>("[data-core-section]");
  const pinPanel = document.querySelector<HTMLElement>("[data-core-pin]");
  const panels = gsap.utils.toArray<HTMLElement>("[data-core-panel]");

  if (!section || !pinPanel || panels.length === 0) return () => {};

  let activeIndex = 0;
  let engaged = false;
  let isTransitioning = false;
  let activeTimeline: gsap.core.Timeline | null = null;

  const hidePanel = (panel: HTMLElement) => {
    gsap.killTweensOf(panel);
    gsap.set(panel, {
      autoAlpha: 0,
      y: 0,
      pointerEvents: "none",
      display: "none",
    });
  };

  const showPanel = (panel: HTMLElement, { opacity = 1, y = 0 } = {}) => {
    gsap.set(panel, {
      display: "grid",
      autoAlpha: opacity,
      y,
      pointerEvents: opacity > 0.01 ? "auto" : "none",
    });
  };

  const resetPanels = () => {
    activeTimeline?.kill();
    activeTimeline = null;
    isTransitioning = false;
    activeIndex = 0;

    panels.forEach((panel, index) => {
      if (index === 0) {
        showPanel(panel, { opacity: 0, y: 28 });
      } else {
        hidePanel(panel);
      }
    });
  };

  const revealFirstPanel = () => {
    activeTimeline?.kill();
    activeTimeline = null;
    isTransitioning = false;
    activeIndex = 0;

    const firstPanel = panels[0];

    panels.forEach((panel, index) => {
      if (index === 0) {
        // 交接到核心技术时必须同帧可见，避免上一舞台隐藏后只剩黑色底。
        showPanel(panel, { opacity: 1, y: 18 });
      } else {
        hidePanel(panel);
      }
    });

    activeTimeline = gsap.timeline({
      defaults: { ease: "power2.out" },
      onComplete: () => refreshStageWheel(),
    });

    // 只保留轻微位移，不再从透明状态淡入。
    activeTimeline.to(firstPanel, { y: 0, duration: 0.32 }, 0);
    forceWheelReady();
  };

  const transitionToPanel = (nextIndex: number) => {
    if (isTransitioning || nextIndex === activeIndex || nextIndex < 0 || nextIndex >= panels.length) {
      return;
    }

    isTransitioning = true;

    const currentPanel = panels[activeIndex];
    const nextPanel = panels[nextIndex];

    activeTimeline?.kill();
    activeTimeline = gsap.timeline({
      onComplete: () => {
        hidePanel(currentPanel);
        showPanel(nextPanel, { opacity: 1, y: 0 });
        activeIndex = nextIndex;
        isTransitioning = false;
        forceWheelReady();
        refreshStageWheel();
      },
    });

    activeTimeline
      .to(currentPanel, { autoAlpha: 0, y: -24, duration: 0.28, ease: "power2.in" })
      .set(currentPanel, { display: "none", pointerEvents: "none" })
      .set(nextPanel, { display: "grid", y: 24, autoAlpha: 0 })
      .to(nextPanel, { autoAlpha: 1, y: 0, duration: 0.36, ease: "power2.out" });
  };

  const engageAtLastPanel = () => {
    if (engaged) {
      if (activeIndex !== panels.length - 1) {
        transitionToPanel(panels.length - 1);
      }
      forceWheelReady();
      refreshStageWheel();
      return;
    }

    exitFreeBrowse();
    engaged = true;
    activeIndex = panels.length - 1;
    section.classList.add("is-engaged");
    document.documentElement.classList.add("is-core-active");
    lockPageScroll();
    snapScrollTo(section);

    panels.forEach((panel, index) => {
      if (index === panels.length - 1) {
        showPanel(panel, { opacity: 0, y: -24 });
      } else {
        hidePanel(panel);
      }
    });

    activeTimeline?.kill();
    activeTimeline = gsap.timeline({
      onComplete: () => {
        forceWheelReady();
        refreshStageWheel();
      },
    });
    activeTimeline.to(panels[panels.length - 1], { autoAlpha: 1, y: 0, duration: 0.42, ease: "power2.out" });
  };

  const engage = () => {
    if (engaged) {
      forceWheelReady();
      refreshStageWheel();
      return;
    }

    exitFreeBrowse();
    engaged = true;
    section.classList.add("is-engaged");
    document.documentElement.classList.add("is-core-active");
    lockPageScroll();
    revealFirstPanel();
    forceWheelReady();
    refreshStageWheel();
  };

  const disengage = () => {
    if (!engaged) return;

    engaged = false;
    section.classList.remove("is-engaged");
    document.documentElement.classList.remove("is-core-active");
    isTransitioning = false;
    resetPanels();
    unlockPageScroll();
    refreshStageWheel();
  };

  const revealForFreeBrowse = () => {
    engaged = false;
    isTransitioning = false;
    activeTimeline?.kill();
    section.classList.remove("is-engaged");
    document.documentElement.classList.remove("is-core-active");
    unlockPageScroll();

    panels.forEach((panel, index) => {
      if (index === 0) {
        showPanel(panel, { opacity: 1, y: 0 });
      } else {
        hidePanel(panel);
      }
    });
    activeIndex = 0;
    refreshStageWheel();
  };

  const leaveDown = () => {
    const lastPanel = panels[activeIndex];
    isTransitioning = true;

    activeTimeline?.kill();
    activeTimeline = gsap.timeline({
      onComplete: () => {
        disengage();
        engageOpenWithReveal();
        isTransitioning = false;
      },
    });

    activeTimeline.to(lastPanel, { autoAlpha: 0, y: -24, duration: 0.28, ease: "power2.in" });
  };

  const leaveUp = () => {
    const firstPanel = panels[activeIndex];
    isTransitioning = true;

    activeTimeline?.kill();
    activeTimeline = gsap.timeline({
      onComplete: () => {
        disengage();
        window.dispatchEvent(new CustomEvent("hero-enter-position"));
        isTransitioning = false;
        forceWheelReady();
        refreshStageWheel();
      },
    });

    activeTimeline.to(firstPanel, { autoAlpha: 0, y: 24, duration: 0.28, ease: "power2.in" });
  };

  const onEngageLast = () => engageAtLastPanel();

  const wheelDown = () => {
    if (!engaged || isTransitioning) return;

    if (activeIndex < panels.length - 1) {
      transitionToPanel(activeIndex + 1);
      return;
    }

    leaveDown();
  };

  const wheelUp = () => {
    if (!engaged || isTransitioning) return;

    if (activeIndex > 0) {
      transitionToPanel(activeIndex - 1);
      return;
    }

    leaveUp();
  };

  const onEngage = () => engage();

  const onDisengageAll = () => disengage();
  const onFreeBrowse = () => revealForFreeBrowse();

  resetPanels();
  section.addEventListener("core-engage", onEngage);
  section.addEventListener("core-engage-last", onEngageLast);
  window.addEventListener("siclink-disengage-stages", onDisengageAll);
  window.addEventListener("siclink-enter-free-browse", onFreeBrowse);

  registerCoreStageHandlers({
    coreIsEngaged: () => engaged,
    coreWheelDown: wheelDown,
    coreWheelUp: wheelUp,
  });

  return () => {
    section.removeEventListener("core-engage", onEngage);
    section.removeEventListener("core-engage-last", onEngageLast);
    window.removeEventListener("siclink-disengage-stages", onDisengageAll);
    window.removeEventListener("siclink-enter-free-browse", onFreeBrowse);
    activeTimeline?.kill();
    disengage();
  };
}

export function engageCoreSection() {
  const section = document.querySelector<HTMLElement>("[data-core-section]");
  section?.dispatchEvent(new CustomEvent("core-engage", { bubbles: true }));
}

export function engageCoreAtLastPanel() {
  const section = document.querySelector<HTMLElement>("[data-core-section]");
  section?.dispatchEvent(new CustomEvent("core-engage-last", { bubbles: true }));
}

export function refreshCoreSectionLayout() {
  // fixed overlay layout; no-op
}
