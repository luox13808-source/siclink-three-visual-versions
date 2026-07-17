"use client";

import { engageCommunityFromFooter, engageOpenSection, type OpenCommunityPhase } from "@/animations/openCommunityTransition";
import { isFreeBrowse } from "@/utils/freeBrowse";

export type { OpenCommunityPhase };

type LenisInstance = {
  stop: () => void;
  start: () => void;
  scrollTo: (target: number | string | HTMLElement, options?: { immediate?: boolean; duration?: number }) => void;
  scroll: number;
};

export type HeroPhase = "hero" | "playing" | "position";

export type StageHandlers = {
  heroGetPhase: () => HeroPhase;
  heroIsPinned: () => boolean;
  heroWheelDown: (rapidCount: number) => void;
  heroWheelUp: () => void;
  heroGoToCore: () => void;
  coreIsEngaged: () => boolean;
  coreWheelDown: () => void;
  coreWheelUp: () => void;
  openCommunityIsEngaged: () => boolean;
  openCommunityGetPhase: () => OpenCommunityPhase;
  openCommunityWheelDown: () => void;
  openCommunityWheelUp: () => void;
};

let handlers: StageHandlers | null = null;
let wheelReady = false;
let wheelCooldown = false;
let cooldownTimer = 0;
let readyTimer = 0;
let lastWheelAt = 0;
let rapidScrollCount = 0;

let touchStartY = 0;
let touchStartX = 0;
let touchActive = false;

const WHEEL_THRESHOLD = 6;
const TOUCH_THRESHOLD = 42;
const COOLDOWN_MS = 450;
const RAPID_WINDOW_MS = 650;
const READY_DELAY_MS = 60;

function getLenis(): LenisInstance | undefined {
  return typeof window !== "undefined" ? (window.__siclinkLenis as LenisInstance | undefined) : undefined;
}

export function lockPageScroll() {
  getLenis()?.stop();
  // 不设 overflow:hidden，保留右侧滚动条可拖；阶段内滚轮仍由 stageNavigation 拦截
  document.documentElement.classList.add("is-scroll-locked");
  document.body.classList.add("is-scroll-locked");
}

export function unlockPageScroll() {
  document.documentElement.classList.remove("is-scroll-locked");
  document.body.classList.remove("is-scroll-locked");
  getLenis()?.start();
}

export function snapScrollTo(target: HTMLElement) {
  const lenis = getLenis();
  if (lenis) {
    lenis.start();
    lenis.scrollTo(target, { immediate: true });
    lenis.stop();
    return;
  }

  target.scrollIntoView({ behavior: "auto", block: "start" });
}

function registerRapidScroll() {
  const now = performance.now();
  if (now - lastWheelAt < RAPID_WINDOW_MS) {
    rapidScrollCount += 1;
  } else {
    rapidScrollCount = 1;
  }
  lastWheelAt = now;
  return rapidScrollCount;
}

function startCooldown() {
  wheelCooldown = true;
  window.clearTimeout(cooldownTimer);
  cooldownTimer = window.setTimeout(() => {
    wheelCooldown = false;
  }, COOLDOWN_MS);
}

function armWheel() {
  window.clearTimeout(readyTimer);
  wheelReady = false;
  readyTimer = window.setTimeout(() => {
    wheelReady = true;
  }, READY_DELAY_MS);
}

export function registerStageHandlers(next: StageHandlers) {
  handlers = next;
  armWheel();
}

export function refreshStageWheel() {
  armWheel();
}

export function forceWheelReady() {
  window.clearTimeout(readyTimer);
  wheelReady = true;
}

function shouldAutoEngageCore() {
  const coreSection = document.querySelector<HTMLElement>("[data-core-section]");
  if (!coreSection) return false;

  const rect = coreSection.getBoundingClientRect();
  return rect.top <= 24 && rect.bottom > window.innerHeight * 0.45;
}

function shouldAutoEngageOpen() {
  const openSection = document.querySelector<HTMLElement>("[data-open-section]");
  if (!openSection) return false;

  const rect = openSection.getBoundingClientRect();
  return rect.top <= 24 && rect.bottom > window.innerHeight * 0.45;
}

function isNearFooter() {
  const footer = document.querySelector<HTMLElement>("#footer");
  if (!footer) return false;

  const rect = footer.getBoundingClientRect();
  return rect.top <= window.innerHeight * 0.92;
}

function isAtFooterTerminal() {
  const footer = document.querySelector<HTMLElement>("#footer");
  if (!footer) return false;

  const rect = footer.getBoundingClientRect();
  return rect.top <= window.innerHeight * 0.72 && rect.bottom <= window.innerHeight + 12;
}

function isCommunityLongPageActive() {
  const section = document.querySelector<HTMLElement>("[data-community-section].is-footer-flow");
  if (!section) return false;

  const rect = section.getBoundingClientRect();
  return rect.top <= 4 && rect.bottom > 0;
}

type StageContext = {
  coreEngaged: boolean;
  openCommunityEngaged: boolean;
  heroPinned: boolean;
  phase: HeroPhase;
  inHeroFlow: boolean;
  nearCore: boolean;
  nearOpen: boolean;
  nearFooter: boolean;
  atFooterTerminal: boolean;
};

function getStageContext(): StageContext | null {
  if (!handlers) return null;

  const coreEngaged = handlers.coreIsEngaged();
  const openCommunityEngaged = handlers.openCommunityIsEngaged();
  const heroPinned = handlers.heroIsPinned();
  const phase = handlers.heroGetPhase();
  const inHeroFlow = heroPinned && (phase === "hero" || phase === "playing" || phase === "position");

  return {
    coreEngaged,
    openCommunityEngaged,
    heroPinned,
    phase,
    inHeroFlow,
    nearCore: shouldAutoEngageCore(),
    nearOpen: shouldAutoEngageOpen(),
    nearFooter: isNearFooter(),
    atFooterTerminal: isAtFooterTerminal(),
  };
}

function shouldInterceptStageScroll(context: StageContext, deltaY = 0) {
  // 自由浏览（滑块拖动）时不拦截，保持原生滚动可见内容
  if (isFreeBrowse()) return false;

  // 共创与页脚是一张连续长页面，进入后完全交还原生滚动。
  if (isCommunityLongPageActive()) return false;

  if (context.atFooterTerminal && !context.openCommunityEngaged && !context.coreEngaged) {
    return false;
  }

  return (
    context.inHeroFlow ||
    context.coreEngaged ||
    context.openCommunityEngaged ||
    context.nearCore ||
    context.nearOpen ||
    context.nearFooter
  );
}

function processStageDelta(deltaY: number) {
  if (!handlers || !wheelReady || wheelCooldown) return false;

  const context = getStageContext();
  if (!context) return false;

  if (!shouldInterceptStageScroll(context, deltaY)) return false;

  const rapidCount = registerRapidScroll();

  if (deltaY > WHEEL_THRESHOLD) {
    if (!context.coreEngaged && context.nearCore && context.phase === "position") {
      handlers.heroGoToCore();
      startCooldown();
      return true;
    }

    if (context.openCommunityEngaged) {
      handlers.openCommunityWheelDown();
      startCooldown();
      return true;
    }

    if (!context.openCommunityEngaged && context.nearOpen && !context.coreEngaged && !context.inHeroFlow) {
      engageOpenSection();
      startCooldown();
      return true;
    }

    if (context.coreEngaged) {
      handlers.coreWheelDown();
      startCooldown();
      return true;
    }

    if (context.inHeroFlow) {
      if (context.phase === "position") {
        handlers.heroGoToCore();
        startCooldown();
        return true;
      }

      handlers.heroWheelDown(rapidCount);
      startCooldown();
      return true;
    }
  }

  if (deltaY < -WHEEL_THRESHOLD) {
    if (!context.openCommunityEngaged && !context.coreEngaged && context.nearFooter) {
      engageCommunityFromFooter();
      startCooldown();
      return true;
    }

    if (context.openCommunityEngaged) {
      handlers.openCommunityWheelUp();
      startCooldown();
      return true;
    }

    if (context.coreEngaged) {
      handlers.coreWheelUp();
      startCooldown();
      return true;
    }

    if (context.inHeroFlow && (context.phase === "position" || context.phase === "playing")) {
      handlers.heroWheelUp();
      startCooldown();
      return true;
    }
  }

  return false;
}

function onWheel(event: WheelEvent) {
  const context = getStageContext();
  if (!context || !shouldInterceptStageScroll(context, event.deltaY)) return;

  event.preventDefault();
  event.stopImmediatePropagation();
  processStageDelta(event.deltaY);
}

function onTouchStart(event: TouchEvent) {
  if (event.touches.length !== 1) return;

  touchActive = true;
  touchStartY = event.touches[0].clientY;
  touchStartX = event.touches[0].clientX;
}

function onTouchMove(event: TouchEvent) {
  if (!touchActive || event.touches.length !== 1) return;

  const deltaY = touchStartY - event.touches[0].clientY;
  const deltaX = touchStartX - event.touches[0].clientX;

  if (Math.abs(deltaX) > Math.abs(deltaY)) return;

  const context = getStageContext();
  if (!context || !shouldInterceptStageScroll(context, deltaY)) return;

  event.preventDefault();
  event.stopImmediatePropagation();
}

function onTouchEnd(event: TouchEvent) {
  if (!touchActive) return;

  touchActive = false;
  const touch = event.changedTouches[0];
  if (!touch) return;

  const deltaY = touchStartY - touch.clientY;
  const deltaX = touchStartX - touch.clientX;

  if (Math.abs(deltaX) > Math.abs(deltaY)) return;
  if (Math.abs(deltaY) < TOUCH_THRESHOLD) return;

  const context = getStageContext();
  if (!context || !shouldInterceptStageScroll(context, deltaY)) return;

  event.preventDefault();
  event.stopImmediatePropagation();

  const syntheticDelta = deltaY > 0 ? WHEEL_THRESHOLD + 10 : -(WHEEL_THRESHOLD + 10);
  processStageDelta(syntheticDelta);
}

export function initStageNavigation() {
  armWheel();
  window.addEventListener("wheel", onWheel, { passive: false, capture: true });
  window.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
  window.addEventListener("touchend", onTouchEnd, { passive: false, capture: true });
  window.addEventListener("touchcancel", onTouchEnd, { passive: false, capture: true });

  return () => {
    window.clearTimeout(readyTimer);
    window.clearTimeout(cooldownTimer);
    wheelReady = false;
    wheelCooldown = false;
    touchActive = false;
    handlers = null;
    window.removeEventListener("wheel", onWheel, { capture: true });
    window.removeEventListener("touchstart", onTouchStart, { capture: true });
    window.removeEventListener("touchmove", onTouchMove, { capture: true });
    window.removeEventListener("touchend", onTouchEnd, { capture: true });
    window.removeEventListener("touchcancel", onTouchEnd, { capture: true });
    unlockPageScroll();
  };
}
