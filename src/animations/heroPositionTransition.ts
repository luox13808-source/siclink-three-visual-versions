"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { registerHeroStageHandlers } from "@/animations/stageRegistry";
import {
  forceWheelReady,
  lockPageScroll,
  refreshStageWheel,
  snapScrollTo,
  unlockPageScroll,
  type HeroPhase,
} from "@/animations/stageNavigation";
import { exitFreeBrowse } from "@/utils/freeBrowse";

gsap.registerPlugin(ScrollTrigger);

type HeroPositionElements = {
  sequence: HTMLElement;
  heroVideo: HTMLVideoElement;
  positionVideo: HTMLVideoElement;
  onEnterCore: () => void;
};

const TEXT_REVEAL_START = 0.45;
const PIN_SCROLL_LENGTH = 0.02;
const SKIP_SCROLL_COUNT = 3;
const BASE_PLAYBACK_RATE = 1.85;
const FAST_PLAYBACK_RATE = 3.2;

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function setVideoLayer(heroVideo: HTMLVideoElement, positionVideo: HTMLVideoElement, layer: "hero" | "position") {
  heroVideo.classList.toggle("is-visible", layer === "hero");
  positionVideo.classList.toggle("is-visible", layer === "position");

  document.querySelector<HTMLElement>("[data-hero-backup]")?.classList.toggle("is-visible", layer === "hero");
  document.querySelector<HTMLElement>("[data-position-backup]")?.classList.toggle("is-visible", layer === "position");
}

function setOpacity(element: HTMLElement, opacity: number) {
  element.style.opacity = String(opacity);
  element.style.visibility = opacity > 0.01 ? "visible" : "hidden";
}

export function initHeroPositionTransition({
  sequence,
  heroVideo,
  positionVideo,
  onEnterCore,
}: HeroPositionElements) {
  const pinPanel = sequence.querySelector<HTMLElement>("[data-hero-position-pin]");
  const heroContent = sequence.querySelector<HTMLElement>("[data-hero-content]");
  const heroButtons = sequence.querySelector<HTMLElement>("[data-hero-buttons]");
  const positionContent = sequence.querySelector<HTMLElement>("[data-position-content]");

  if (!pinPanel || !heroContent || !heroButtons || !positionContent) return () => {};

  let phase: HeroPhase = "hero";
  let transitionStarted = false;
  let revealFrame = 0;
  let displayedTextOpacity = 0;
  let pinTrigger: ScrollTrigger;

  const heroUi = [heroContent, heroButtons];

  gsap.killTweensOf([...heroUi, positionContent]);

  setVideoLayer(heroVideo, positionVideo, "hero");
  setOpacity(positionContent, 0);
  positionContent.style.pointerEvents = "none";
  heroUi.forEach((element) => setOpacity(element, 1));
  heroContent.style.pointerEvents = "auto";
  heroButtons.style.pointerEvents = "auto";
  unlockPageScroll();

  const emitProgress = (progress: number) => {
    window.dispatchEvent(
      new CustomEvent("hero-position-progress", {
        detail: { progress },
      }),
    );
  };

  const showPositionText = (opacity: number) => {
    displayedTextOpacity = opacity;
    setOpacity(positionContent, opacity);
    positionContent.style.pointerEvents = opacity > 0.65 ? "auto" : "none";
  };

  const smoothstep = (value: number) => value * value * (3 - 2 * value);

  const stopRevealLoop = () => {
    if (revealFrame) {
      window.cancelAnimationFrame(revealFrame);
      revealFrame = 0;
    }
  };

  const startRevealLoop = (textLerp = 0.2) => {
    stopRevealLoop();

    const tick = () => {
      if (phase !== "playing" || !positionVideo.duration) {
        revealFrame = 0;
        return;
      }

      const progress = positionVideo.currentTime / positionVideo.duration;
      emitProgress(Math.max(0.82, progress));

      if (progress >= TEXT_REVEAL_START) {
        const raw = clamp((progress - TEXT_REVEAL_START) / (1 - TEXT_REVEAL_START));
        const target = smoothstep(raw);
        displayedTextOpacity += (target - displayedTextOpacity) * textLerp;
        showPositionText(displayedTextOpacity);
      }

      revealFrame = window.requestAnimationFrame(tick);
    };

    revealFrame = window.requestAnimationFrame(tick);
  };

  const clearPositionListeners = () => {
    stopRevealLoop();
    positionVideo.removeEventListener("ended", onEnded);
    positionVideo.playbackRate = 1;
  };

  const finishPosition = () => {
    clearPositionListeners();

    if (positionVideo.duration) {
      positionVideo.pause();
      positionVideo.currentTime = Math.max(0, positionVideo.duration - 0.05);
    }

    showPositionText(1);
    phase = "position";
    transitionStarted = true;
    lockPageScroll();
    emitProgress(1);
    refreshStageWheel();
  };

  const onEnded = () => {
    finishPosition();
  };

  const resetToHero = () => {
    clearPositionListeners();
    transitionStarted = false;
    phase = "hero";

    document.documentElement.classList.remove("is-core-active");

    gsap.killTweensOf([...heroUi, positionContent, pinPanel]);

    positionVideo.pause();
    positionVideo.currentTime = 0;

    showPositionText(0);
    displayedTextOpacity = 0;
    setVideoLayer(heroVideo, positionVideo, "hero");
    heroUi.forEach((element) => setOpacity(element, 1));
    heroContent.style.pointerEvents = "auto";
    heroButtons.style.pointerEvents = "auto";

    gsap.set(pinPanel, { autoAlpha: 1, pointerEvents: "auto" });

    heroVideo.play().catch(() => {});
    lockPageScroll();
    emitProgress(0);
    forceWheelReady();
    refreshStageWheel();
  };

  const reversePlayingToHero = () => {
    clearPositionListeners();
    transitionStarted = false;

    gsap.killTweensOf([...heroUi, positionContent]);

    const timeline = gsap.timeline({
      onComplete: () => {
        phase = "hero";
        document.documentElement.classList.remove("is-core-active");
        showPositionText(0);
        displayedTextOpacity = 0;
        positionVideo.pause();
        positionVideo.currentTime = 0;
        setVideoLayer(heroVideo, positionVideo, "hero");
        heroUi.forEach((element) => setOpacity(element, 1));
        heroContent.style.pointerEvents = "auto";
        heroButtons.style.pointerEvents = "auto";
        gsap.set(pinPanel, { autoAlpha: 1, pointerEvents: "auto" });
        heroVideo.play().catch(() => {});
        unlockPageScroll();
        emitProgress(0);
        forceWheelReady();
        refreshStageWheel();
      },
    });

    timeline
      .to(positionContent, {
        opacity: 0,
        duration: 0.22,
        ease: "power2.in",
        onUpdate: () => {
          positionContent.style.visibility =
            Number(gsap.getProperty(positionContent, "opacity")) > 0.01 ? "visible" : "hidden";
        },
      })
      .call(() => {
        positionVideo.pause();
        setVideoLayer(heroVideo, positionVideo, "hero");
      })
      .to(heroContent, {
        opacity: 1,
        duration: 0.34,
        ease: "power2.out",
        onStart: () => {
          heroContent.style.visibility = "visible";
          heroContent.style.pointerEvents = "auto";
        },
      })
      .to(
        heroButtons,
        {
          opacity: 1,
          duration: 0.3,
          ease: "power2.out",
          onStart: () => {
            heroButtons.style.visibility = "visible";
            heroButtons.style.pointerEvents = "auto";
          },
        },
        "-=0.18",
      );
  };

  const reverseToHero = () => {
    if (phase === "hero") return;
    if (phase === "playing") {
      reversePlayingToHero();
      return;
    }

    clearPositionListeners();
    transitionStarted = false;

    gsap.killTweensOf([...heroUi, positionContent, pinPanel]);

    const timeline = gsap.timeline({
      onComplete: () => {
        phase = "hero";
        document.documentElement.classList.remove("is-core-active");
        showPositionText(0);
        displayedTextOpacity = 0;
        positionVideo.pause();
        positionVideo.currentTime = 0;
        setVideoLayer(heroVideo, positionVideo, "hero");
        positionContent.style.pointerEvents = "none";
        heroContent.style.pointerEvents = "auto";
        heroButtons.style.pointerEvents = "auto";
        gsap.set(pinPanel, { autoAlpha: 1, pointerEvents: "auto" });
        heroVideo.play().catch(() => {});
        unlockPageScroll();
        emitProgress(0);
        forceWheelReady();
        refreshStageWheel();
      },
    });

    timeline
      .to(positionContent, {
        opacity: 0,
        duration: 0.28,
        ease: "power2.in",
        onUpdate: () => {
          positionContent.style.visibility =
            Number(gsap.getProperty(positionContent, "opacity")) > 0.01 ? "visible" : "hidden";
        },
      })
      .call(() => {
        positionVideo.pause();
        positionVideo.currentTime = 0;
        setVideoLayer(heroVideo, positionVideo, "hero");
      })
      .to(heroContent, {
        opacity: 1,
        duration: 0.36,
        ease: "power2.out",
        onStart: () => {
          heroContent.style.visibility = "visible";
        },
      })
      .to(
        heroButtons,
        {
          opacity: 1,
          duration: 0.32,
          ease: "power2.out",
          onStart: () => {
            heroButtons.style.visibility = "visible";
          },
        },
        "-=0.2",
      );
  };

  const enterPositionFromCore = () => {
    clearPositionListeners();
    transitionStarted = true;
    phase = "playing";

    document.documentElement.classList.remove("is-core-active");
    lockPageScroll();

    gsap.killTweensOf([...heroUi, positionContent, pinPanel]);
    gsap.set(pinPanel, { autoAlpha: 1, pointerEvents: "auto" });
    snapScrollTo(sequence);

    heroUi.forEach((element) => setOpacity(element, 0));
    heroContent.style.pointerEvents = "none";
    heroButtons.style.pointerEvents = "none";

    showPositionText(0);
    displayedTextOpacity = 0;

    if (positionVideo.dataset.src && !positionVideo.getAttribute("src")) {
      positionVideo.setAttribute("src", positionVideo.dataset.src);
      positionVideo.load();
    }

    setVideoLayer(heroVideo, positionVideo, "position");
    heroVideo.pause();

    positionVideo.currentTime = 0;
    positionVideo.playbackRate = BASE_PLAYBACK_RATE;
    positionVideo.addEventListener("ended", onEnded);
    startRevealLoop(0.22);

    positionVideo.play().catch(() => finishPosition());
    emitProgress(0.82);
    forceWheelReady();
    refreshStageWheel();
  };

  const onEnterPosition = () => enterPositionFromCore();
  const onResetHero = () => resetToHero();

  const hideHeroUi = (fast = false) => {
    const duration = fast ? 0.18 : 0.32;

    gsap.to(heroContent, {
      opacity: 0,
      duration,
      ease: "power2.inOut",
      onUpdate: () => {
        heroContent.style.visibility = Number(gsap.getProperty(heroContent, "opacity")) > 0.01 ? "visible" : "hidden";
      },
      onComplete: () => {
        heroContent.style.pointerEvents = "none";
      },
    });
    gsap.to(heroButtons, {
      opacity: 0,
      duration: duration * 0.9,
      ease: "power2.inOut",
      onUpdate: () => {
        heroButtons.style.visibility = Number(gsap.getProperty(heroButtons, "opacity")) > 0.01 ? "visible" : "hidden";
      },
      onComplete: () => {
        heroButtons.style.pointerEvents = "none";
      },
    });
  };

  const acceleratePlayingTransition = (count: number) => {
    if (phase !== "playing") return;

    if (count >= SKIP_SCROLL_COUNT) {
      finishPosition();
      return;
    }

    const rate = count >= 2 ? FAST_PLAYBACK_RATE : BASE_PLAYBACK_RATE;
    positionVideo.playbackRate = rate;

    if (positionVideo.duration) {
      const skipStep = positionVideo.duration * (count >= 2 ? 0.22 : 0.12);
      positionVideo.currentTime = Math.min(positionVideo.duration - 0.08, positionVideo.currentTime + skipStep);
    }

    startRevealLoop(count >= 2 ? 0.34 : 0.24);
    positionVideo.play().catch(() => finishPosition());
  };

  const beginTransition = (fast = false) => {
    if (transitionStarted || phase !== "hero") return;

    transitionStarted = true;
    phase = "playing";
    lockPageScroll();

    if (positionVideo.dataset.src && !positionVideo.getAttribute("src")) {
      positionVideo.setAttribute("src", positionVideo.dataset.src);
      positionVideo.load();
    }

    hideHeroUi(fast);
    positionVideo.currentTime = 0;
    displayedTextOpacity = 0;
    positionVideo.playbackRate = fast ? FAST_PLAYBACK_RATE : BASE_PLAYBACK_RATE;

    positionVideo.addEventListener("ended", onEnded);
    startRevealLoop(fast ? 0.3 : 0.2);

    const swapToPosition = () => {
      setVideoLayer(heroVideo, positionVideo, "position");
      heroVideo.pause();
    };

    positionVideo.play().then(swapToPosition).catch(() => {
      swapToPosition();
      finishPosition();
    });
  };

  const goToCore = () => {
    if (phase !== "position") return;

    exitFreeBrowse();
    const coreSection = document.querySelector<HTMLElement>("#core");
    if (!coreSection) return;

    gsap.killTweensOf([positionContent, pinPanel]);
    gsap.to(positionContent, {
      opacity: 0,
      duration: 0.22,
      ease: "power2.in",
      onUpdate: () => {
        positionContent.style.visibility =
          Number(gsap.getProperty(positionContent, "opacity")) > 0.01 ? "visible" : "hidden";
      },
    });
    gsap.to(pinPanel, {
      autoAlpha: 0,
      duration: 0.28,
      ease: "power2.in",
      onComplete: () => {
        pinPanel.style.pointerEvents = "none";
      },
    });

    clearPositionListeners();
    positionVideo.pause();

    if (coreSection) snapScrollTo(coreSection);

    document.documentElement.classList.add("is-core-active");
    onEnterCore();
    forceWheelReady();
    refreshStageWheel();
  };

  pinTrigger = ScrollTrigger.create({
    trigger: sequence,
    start: "top top",
    end: () => `+=${window.innerHeight * PIN_SCROLL_LENGTH}`,
    pin: pinPanel,
    pinSpacing: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onEnter: () => {
      if (phase === "hero") heroVideo.play().catch(() => {});
    },
  });

  registerHeroStageHandlers({
    heroGetPhase: () => phase,
    heroIsPinned: () => {
      if (phase === "position" || phase === "playing") return true;
      const { top, bottom } = sequence.getBoundingClientRect();
      return Math.abs(top) <= 16 && bottom > window.innerHeight * 0.45;
    },
    heroWheelDown: (rapidCount) => {
      if (phase === "playing") {
        acceleratePlayingTransition(rapidCount);
        return;
      }
      if (phase === "hero") {
        beginTransition(rapidCount >= 2);
      }
    },
    heroWheelUp: () => {
      if (phase === "playing" || phase === "position") {
        reverseToHero();
      }
    },
    heroGoToCore: goToCore,
  });

  sequence.classList.add("is-layout-ready");
  emitProgress(0);
  refreshStageWheel();

  window.addEventListener("hero-enter-position", onEnterPosition);
  window.addEventListener("hero-reset", onResetHero);

  const onFreeBrowse = () => {
    document.documentElement.classList.remove("is-core-active");
    gsap.set(pinPanel, { autoAlpha: 1 });
    pinPanel.style.pointerEvents = "auto";
    unlockPageScroll();

    if (phase === "position" || phase === "playing") {
      setOpacity(positionContent, 1);
      positionContent.style.pointerEvents = "auto";
      setOpacity(heroContent, 0);
      setOpacity(heroButtons, 0);
      setVideoLayer(heroVideo, positionVideo, "position");
    } else {
      setOpacity(heroContent, 1);
      setOpacity(heroButtons, 1);
      setOpacity(positionContent, 0);
      heroContent.style.pointerEvents = "auto";
      heroButtons.style.pointerEvents = "auto";
      setVideoLayer(heroVideo, positionVideo, "hero");
    }
  };

  window.addEventListener("siclink-enter-free-browse", onFreeBrowse);

  return () => {
    window.removeEventListener("hero-enter-position", onEnterPosition);
    window.removeEventListener("hero-reset", onResetHero);
    window.removeEventListener("siclink-enter-free-browse", onFreeBrowse);
    sequence.classList.remove("is-layout-ready");
    unlockPageScroll();
    clearPositionListeners();
    stopRevealLoop();
    pinTrigger.kill();
    gsap.set([pinPanel, heroContent, heroButtons, positionContent], { clearProps: "all" });
    pinPanel.style.pointerEvents = "";
    positionContent.style.pointerEvents = "";
    heroContent.style.pointerEvents = "";
    heroButtons.style.pointerEvents = "";
    document.documentElement.classList.remove("is-core-active");
  };
}

export function refreshHeroPositionLayout() {
  ScrollTrigger.refresh();
}
