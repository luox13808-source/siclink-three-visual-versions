"use client";

import gsap from "gsap";
import { registerOpenCommunityHandlers } from "@/animations/stageRegistry";
import {
  forceWheelReady,
  lockPageScroll,
  refreshStageWheel,
  snapScrollTo,
  unlockPageScroll,
} from "@/animations/stageNavigation";
import { engageCoreAtLastPanel } from "@/animations/coreSectionTransition";
import { exitFreeBrowse } from "@/utils/freeBrowse";

export type OpenCommunityPhase = "idle" | "open" | "community";

export function initOpenCommunityTransition() {
  const openSection = document.querySelector<HTMLElement>("[data-open-section]");
  const communitySection = document.querySelector<HTMLElement>("[data-community-section]");
  const openPlaceholder = document.querySelector<HTMLElement>("[data-open-placeholder]");
  const openCopy = document.querySelector<HTMLElement>("[data-open-copy]");
  const openVideo = document.querySelector<HTMLVideoElement>("[data-open-video]");
  const communityCopy = document.querySelector<HTMLElement>("[data-community-copy]");
  const communityVisual = document.querySelector<HTMLElement>("[data-community-visual]");
  const communityVideo = document.querySelector<HTMLVideoElement>("[data-community-video]");

  if (!openSection || !communitySection || !openCopy) return () => {};

  let phase: OpenCommunityPhase = "idle";
  let engaged = false;
  let isTransitioning = false;
  let activeTimeline: gsap.core.Timeline | null = null;

  const setCommunityFooterFlow = (active: boolean) => {
    communitySection.classList.toggle("is-footer-flow", active);
    document.documentElement.classList.toggle("is-community-footer-flow", active);
  };

  const hideCommunity = () => {
    if (communityCopy) {
      gsap.set(communityCopy, { autoAlpha: 0, y: 24, pointerEvents: "none", visibility: "hidden" });
    }
    if (communityVisual) gsap.set(communityVisual, { autoAlpha: 0, y: 0 });
    if (communityVideo) gsap.set(communityVideo, { autoAlpha: 0, y: 0 });
    communitySection.classList.remove("is-engaged");
  };

  const hydrateVideo = (video?: HTMLVideoElement | null) => {
    if (!video) return;
    const deferredSrc = video.dataset.src;
    if (deferredSrc && !video.getAttribute("src")) {
      video.setAttribute("src", deferredSrc);
      video.load();
    }

    const markReady = () => {
      video.classList.add("is-media-ready");
      video.play().catch(() => {});
    };

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      markReady();
    } else {
      video.addEventListener("loadeddata", markReady, { once: true });
      video.addEventListener(
        "error",
        () => {
          video.classList.remove("is-media-ready");
        },
        { once: true },
      );
    }
  };

  const showOpen = () => {
    hydrateVideo(openVideo);
    gsap.set(openCopy, { autoAlpha: 1, y: 0, pointerEvents: "auto", visibility: "visible" });
    if (openPlaceholder) gsap.set(openPlaceholder, { autoAlpha: 1, y: 0 });
    // 视频透明度由 is-media-ready / 备用图接管，避免未加载时盖住备用层
    if (openVideo) {
      gsap.set(openVideo, { clearProps: "opacity,visibility" });
    }
    hideCommunity();
  };

  const resetAll = () => {
    activeTimeline?.kill();
    activeTimeline = null;
    isTransitioning = false;
    phase = "idle";
    engaged = false;
    openSection.classList.remove("is-engaged");
    communitySection.classList.remove("is-engaged");
    setCommunityFooterFlow(false);
    document.documentElement.classList.remove("is-open-community-active");
    gsap.set(openCopy, { autoAlpha: 0 });
    if (openVideo) gsap.set(openVideo, { autoAlpha: 0 });
    hideCommunity();
  };

  const revealForFreeBrowse = () => {
    engaged = false;
    phase = "idle";
    isTransitioning = false;
    activeTimeline?.kill();
    openSection.classList.remove("is-engaged");
    communitySection.classList.remove("is-engaged");
    document.documentElement.classList.remove("is-open-community-active");
    unlockPageScroll();

    gsap.set(openCopy, { autoAlpha: 1, y: 0, visibility: "visible", pointerEvents: "auto" });
    if (openPlaceholder) gsap.set(openPlaceholder, { autoAlpha: 1, y: 0 });
    if (openVideo) gsap.set(openVideo, { clearProps: "opacity,visibility" });
    hydrateVideo(openVideo);

    if (communityCopy) {
      gsap.set(communityCopy, { autoAlpha: 1, y: 0, visibility: "visible", pointerEvents: "auto" });
    }
    if (communityVisual) gsap.set(communityVisual, { autoAlpha: 1, y: 0 });
    if (communityVideo) gsap.set(communityVideo, { clearProps: "opacity,visibility" });
    hydrateVideo(communityVideo);
  };

  const engageOpenWithReveal = () => {
    exitFreeBrowse();
    setCommunityFooterFlow(false);
    engaged = true;
    phase = "open";
    openSection.classList.add("is-engaged");
    document.documentElement.classList.add("is-open-community-active");
    snapScrollTo(openSection);
    lockPageScroll();
    hideCommunity();

    gsap.set(openCopy, { autoAlpha: 0, y: 24, pointerEvents: "none", visibility: "visible" });
    if (openPlaceholder) gsap.set(openPlaceholder, { autoAlpha: 0, y: 24 });
    if (openVideo) gsap.set(openVideo, { clearProps: "opacity,visibility" });
    hydrateVideo(openVideo);

    activeTimeline?.kill();
    activeTimeline = gsap.timeline({
      onComplete: () => {
        forceWheelReady();
        refreshStageWheel();
      },
    });

    activeTimeline
      .to(openPlaceholder, { autoAlpha: 1, y: 0, duration: 0.38, ease: "power2.out" })
      .to(openCopy, { autoAlpha: 1, y: 0, duration: 0.38, ease: "power2.out", pointerEvents: "auto" }, "-=0.28");
  };

  const enterCommunityFlow = () => {
    exitFreeBrowse();
    engaged = false;
    phase = "idle";
    isTransitioning = false;
    openSection.classList.remove("is-engaged");
    communitySection.classList.remove("is-engaged");
    setCommunityFooterFlow(true);

    gsap.set(openCopy, { autoAlpha: 0, pointerEvents: "none" });
    if (openVideo) gsap.set(openVideo, { autoAlpha: 0 });

    hydrateVideo(communityVideo);
    hydrateVideo(openVideo);
    if (communityVideo) gsap.set(communityVideo, { clearProps: "opacity,visibility" });
    if (communityVisual) gsap.set(communityVisual, { autoAlpha: 1, y: 0, visibility: "visible" });
    if (communityCopy) {
      gsap.set(communityCopy, { autoAlpha: 1, y: 0, visibility: "visible", pointerEvents: "auto" });
    }

    snapScrollTo(communitySection);
    document.documentElement.classList.remove("is-open-community-active");
    unlockPageScroll();
    forceWheelReady();
    refreshStageWheel();
  };

  const enterCommunityFromFooter = () => {
    if (isTransitioning) return;
    activeTimeline?.kill();
    activeTimeline = null;
    enterCommunityFlow();
  };

  const engageCommunityDirect = () => {
    activeTimeline?.kill();
    activeTimeline = null;
    enterCommunityFlow();
  };

  const onDisengageAll = () => {
    setCommunityFooterFlow(false);
    disengage();
  };

  const engageOpen = () => {
    if (engaged && phase === "open") {
      forceWheelReady();
      refreshStageWheel();
      return;
    }

    exitFreeBrowse();
    setCommunityFooterFlow(false);
    engaged = true;
    phase = "open";
    openSection.classList.add("is-engaged");
    document.documentElement.classList.add("is-open-community-active");
    snapScrollTo(openSection);
    lockPageScroll();
    hideCommunity();
    showOpen();
    forceWheelReady();
    refreshStageWheel();
  };

  const disengage = () => {
    if (!engaged) return;
    resetAll();
    unlockPageScroll();
    refreshStageWheel();
  };

  const prepareCommunityStage = () => {
    setCommunityFooterFlow(false);
    openSection.classList.remove("is-engaged");
    communitySection.classList.add("is-engaged");
    phase = "community";

    gsap.set(communityCopy, { autoAlpha: 0, y: 24, pointerEvents: "none", visibility: "hidden" });
    gsap.set(communityVisual, { autoAlpha: 0, y: 0 });
    if (communityVideo) gsap.set(communityVideo, { clearProps: "opacity,visibility" });

    hydrateVideo(communityVideo);
  };

  const transitionToCommunity = () => {
    if (isTransitioning || phase !== "open") return;

    isTransitioning = true;
    activeTimeline?.kill();

    activeTimeline = gsap.timeline({
      onComplete: () => {
        activeTimeline = null;
        enterCommunityFlow();
      },
    });

    activeTimeline
      .to(openCopy, { autoAlpha: 0, y: -14, duration: 0.18, ease: "power2.in" })
      .to(openVideo, { autoAlpha: 0, duration: 0.18, ease: "power2.in" }, "<");
  };

  const leaveToFooter = () => {
    if (isTransitioning || phase !== "community") return;

    const footer = document.querySelector<HTMLElement>("#footer");
    if (!footer) return;

    isTransitioning = true;
    activeTimeline?.kill();
    activeTimeline = null;

    // 固定舞台直接展开为自然滚动的长页面，避免背景淡出后出现大片黑区。
    disengage();
    setCommunityFooterFlow(true);
    hydrateVideo(communityVideo);
    if (communityVideo) gsap.set(communityVideo, { clearProps: "opacity,visibility" });
    if (communityVisual) gsap.set(communityVisual, { autoAlpha: 1, y: 0, visibility: "visible" });
    if (communityCopy) {
      gsap.set(communityCopy, { autoAlpha: 1, y: 0, visibility: "visible", pointerEvents: "auto" });
    }

    const lenis = window.__siclinkLenis;
    lenis?.start();
    window.requestAnimationFrame(() => {
      lenis?.scrollTo(footer, { duration: 0.55 });
    });
    isTransitioning = false;
  };

  const returnToOpen = () => {
    if (isTransitioning || phase !== "community") return;

    isTransitioning = true;
    activeTimeline?.kill();

    activeTimeline = gsap.timeline({
      onComplete: () => {
        phase = "open";
        communitySection.classList.remove("is-engaged");
        openSection.classList.add("is-engaged");
        isTransitioning = false;
        forceWheelReady();
        refreshStageWheel();
      },
    });

    activeTimeline
      .to(communityCopy, { autoAlpha: 0, y: 20, duration: 0.28, ease: "power2.in", pointerEvents: "none" })
      .to(communityVideo, { autoAlpha: 0, duration: 0.26, ease: "power2.in" }, "-=0.06")
      .to(communityVisual, { autoAlpha: 0, duration: 0.24, ease: "power2.in" }, "-=0.04")
      .call(() => {
        hideCommunity();
        gsap.set(openCopy, { autoAlpha: 0, y: -20, visibility: "visible", pointerEvents: "none" });
        if (openVideo) gsap.set(openVideo, { clearProps: "opacity,visibility" });
        if (openPlaceholder) gsap.set(openPlaceholder, { autoAlpha: 1, y: 0 });
        hydrateVideo(openVideo);
      })
      .to(openCopy, { autoAlpha: 1, y: 0, duration: 0.38, ease: "power2.out", pointerEvents: "auto" });
  };

  const leaveOpenToCore = () => {
    if (isTransitioning || phase !== "open") return;

    isTransitioning = true;
    activeTimeline?.kill();

    activeTimeline = gsap.timeline({
      onComplete: () => {
        engaged = false;
        phase = "idle";
        openSection.classList.remove("is-engaged");
        document.documentElement.classList.remove("is-open-community-active");
        gsap.set(openCopy, { autoAlpha: 0 });
        if (openVideo) gsap.set(openVideo, { autoAlpha: 0 });
        hideCommunity();
        engageCoreAtLastPanel();
        isTransitioning = false;
      },
    });

    activeTimeline
      .to(openCopy, { autoAlpha: 0, y: 20, duration: 0.28, ease: "power2.in", pointerEvents: "none" })
      .to(openVideo, { autoAlpha: 0, duration: 0.26, ease: "power2.in" }, "-=0.08");
  };

  const wheelDown = () => {
    if (!engaged || isTransitioning) return;

    if (phase === "open") {
      transitionToCommunity();
      return;
    }

    if (phase === "community") {
      leaveToFooter();
    }
  };

  const wheelUp = () => {
    if (!engaged || isTransitioning) return;

    if (phase === "community") {
      returnToOpen();
      return;
    }

    if (phase === "open") {
      leaveOpenToCore();
    }
  };

  const onEngage = () => engageOpen();
  const onEngageReveal = () => engageOpenWithReveal();
  const onEngageCommunityFromFooter = () => enterCommunityFromFooter();
  const onEngageCommunity = () => engageCommunityDirect();
  const onFreeBrowse = () => revealForFreeBrowse();

  resetAll();
  openSection.addEventListener("open-engage", onEngage);
  openSection.addEventListener("open-engage-reveal", onEngageReveal);
  communitySection.addEventListener("community-engage-from-footer", onEngageCommunityFromFooter);
  communitySection.addEventListener("community-engage", onEngageCommunity);
  window.addEventListener("siclink-disengage-stages", onDisengageAll);
  window.addEventListener("siclink-enter-free-browse", onFreeBrowse);

  registerOpenCommunityHandlers({
    openCommunityIsEngaged: () => engaged,
    openCommunityGetPhase: () => phase,
    openCommunityWheelDown: wheelDown,
    openCommunityWheelUp: wheelUp,
  });

  return () => {
    openSection.removeEventListener("open-engage", onEngage);
    openSection.removeEventListener("open-engage-reveal", onEngageReveal);
    communitySection.removeEventListener("community-engage-from-footer", onEngageCommunityFromFooter);
    communitySection.removeEventListener("community-engage", onEngageCommunity);
    window.removeEventListener("siclink-disengage-stages", onDisengageAll);
    window.removeEventListener("siclink-enter-free-browse", onFreeBrowse);
    activeTimeline?.kill();
    setCommunityFooterFlow(false);
    disengage();
  };
}

export function engageOpenSection() {
  const openSection = document.querySelector<HTMLElement>("[data-open-section]");
  openSection?.dispatchEvent(new CustomEvent("open-engage", { bubbles: true }));
}

export function engageOpenWithReveal() {
  const openSection = document.querySelector<HTMLElement>("[data-open-section]");
  openSection?.dispatchEvent(new CustomEvent("open-engage-reveal", { bubbles: true }));
}

export function engageCommunityFromFooter() {
  const communitySection = document.querySelector<HTMLElement>("[data-community-section]");
  communitySection?.dispatchEvent(new CustomEvent("community-engage-from-footer", { bubbles: true }));
}

export function engageCommunitySection() {
  const communitySection = document.querySelector<HTMLElement>("[data-community-section]");
  communitySection?.dispatchEvent(new CustomEvent("community-engage", { bubbles: true }));
}
