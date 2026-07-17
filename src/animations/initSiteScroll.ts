"use client";

import { engageCoreSection, initCoreSectionTransition } from "@/animations/coreSectionTransition";
import { engageOpenSection, initOpenCommunityTransition } from "@/animations/openCommunityTransition";
import { initHeroPositionTransition } from "@/animations/heroPositionTransition";
import { initStageNavigation } from "@/animations/stageNavigation";
import { clearStageRegistry } from "@/animations/stageRegistry";

export function initSiteScroll() {
  const cleanupStageNav = initStageNavigation();
  const cleanupCore = initCoreSectionTransition();
  const cleanupOpenCommunity = initOpenCommunityTransition();

  const sequence = document.querySelector<HTMLElement>("[data-hero-position-sequence]");
  const heroVideo = document.querySelector<HTMLVideoElement>(".hero-video-layer");
  const positionVideo = document.querySelector<HTMLVideoElement>(".position-video-layer");

  let cleanupHero = () => {};

  if (sequence && heroVideo && positionVideo) {
    cleanupHero = initHeroPositionTransition({
      sequence,
      heroVideo,
      positionVideo,
      onEnterCore: engageCoreSection,
    });
  }

  return () => {
    cleanupHero();
    cleanupCore();
    cleanupOpenCommunity();
    cleanupStageNav();
    clearStageRegistry();
  };
}
