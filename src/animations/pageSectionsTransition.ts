"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function mapRange(value: number, start: number, end: number) {
  if (end <= start) return value >= end ? 1 : 0;
  return Math.min(1, Math.max(0, (value - start) / (end - start)));
}

type StagedRevealOptions = {
  section: HTMLElement;
  visuals: HTMLElement[];
  copy: HTMLElement | null;
  video?: HTMLVideoElement | null;
};

function createStagedReveal({ section, visuals, copy, video }: StagedRevealOptions) {
  gsap.set(visuals, { autoAlpha: 0 });
  if (copy) gsap.set(copy, { autoAlpha: 0 });
  if (video) gsap.set(video, { autoAlpha: 0 });

  const applyProgress = (progress: number) => {
    const visualAmount = mapRange(progress, 0, 0.44);
    const copyAmount = mapRange(progress, 0.4, 0.82);

    visuals.forEach((element) => {
      gsap.set(element, { autoAlpha: visualAmount });
    });

    if (video) {
      gsap.set(video, { autoAlpha: visualAmount * 0.96 });
      if (visualAmount > 0.12) {
        video.play().catch(() => {});
      }
    }

    if (copy) {
      gsap.set(copy, { autoAlpha: copyAmount });
    }
  };

  const trigger = ScrollTrigger.create({
    trigger: section,
    start: "top 85%",
    end: "top 15%",
    scrub: 0.5,
    invalidateOnRefresh: true,
    onEnter: (self) => applyProgress(Math.max(self.progress, 0.04)),
    onEnterBack: (self) => applyProgress(Math.max(self.progress, 0.04)),
    onUpdate: (self) => applyProgress(self.progress),
    onLeaveBack: () => {
      gsap.set(visuals, { autoAlpha: 0 });
      if (copy) gsap.set(copy, { autoAlpha: 0 });
      if (video) gsap.set(video, { autoAlpha: 0 });
    },
  });

  applyProgress(trigger.progress);

  const onRefreshInit = () => applyProgress(trigger.progress);
  ScrollTrigger.addEventListener("refreshInit", onRefreshInit);

  return () => {
    ScrollTrigger.removeEventListener("refreshInit", onRefreshInit);
    trigger.kill();
  };
}

export function initReconstructionSectionTransition() {
  const section = document.querySelector<HTMLElement>("[data-reconstruction-section]");
  const visuals = gsap.utils.toArray<HTMLElement>("[data-reconstruction-visual]");
  const copy = document.querySelector<HTMLElement>("[data-reconstruction-copy]");

  if (!section || visuals.length === 0 || !copy) return () => {};

  return createStagedReveal({ section, visuals, copy });
}

export function initOpenSourceSectionTransition() {
  const section = document.querySelector<HTMLElement>("[data-open-section]");
  const visuals = gsap.utils.toArray<HTMLElement>("[data-open-visual]:not(video)");
  const copy = document.querySelector<HTMLElement>("[data-open-copy]");
  const video = document.querySelector<HTMLVideoElement>("[data-open-video]");

  if (!section || visuals.length === 0 || !copy) return () => {};

  return createStagedReveal({ section, visuals, copy, video });
}

export function initCommunitySectionTransition() {
  const section = document.querySelector<HTMLElement>("[data-community-section]");
  const visuals = gsap.utils.toArray<HTMLElement>("[data-community-visual]:not(video)");
  const copy = document.querySelector<HTMLElement>("[data-community-copy]");
  const video = document.querySelector<HTMLVideoElement>("[data-community-video]");

  if (!section || !copy) return () => {};
  if (visuals.length === 0 && !video) return () => {};

  return createStagedReveal({ section, visuals, copy, video });
}

export function refreshPageSectionsLayout() {
  ScrollTrigger.refresh();
}
