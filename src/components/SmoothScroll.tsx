"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect, type PropsWithChildren } from "react";
import { enterFreeBrowse, isFreeBrowse } from "@/utils/freeBrowse";
import { finishFreeBrowseAndSnap } from "@/utils/snapSection";

gsap.registerPlugin(ScrollTrigger);

declare global {
  interface Window {
    __siclinkLenis?: Lenis;
  }
}

function isScrollbarPointer(event: PointerEvent) {
  const doc = document.documentElement;
  if (event.clientX >= doc.clientWidth) return true;
  if (window.innerWidth - doc.clientWidth < 2 && event.clientX >= window.innerWidth - 12) {
    return true;
  }
  return false;
}

export default function SmoothScroll({ children }: PropsWithChildren) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
    });

    window.__siclinkLenis = lenis;

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    lenis.on("scroll", ScrollTrigger.update);

    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value) {
        if (arguments.length && value !== undefined) {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      pinType: document.documentElement.style.transform ? "transform" : "fixed",
    });

    let scrollbarDragging = false;
    let snapTimer = 0;

    const syncFromNativeScroll = () => {
      const nativeY = window.scrollY || document.documentElement.scrollTop || 0;
      if (Math.abs(lenis.scroll - nativeY) > 0.5) {
        lenis.scrollTo(nativeY, { immediate: true });
      }
      ScrollTrigger.update();
    };

    const beginFreeBrowse = () => {
      enterFreeBrowse();
      document.documentElement.classList.remove("is-scroll-locked");
      document.body.classList.remove("is-scroll-locked");
    };

    const scheduleSnap = () => {
      window.clearTimeout(snapTimer);
      snapTimer = window.setTimeout(() => {
        if (scrollbarDragging) return;
        if (!isFreeBrowse()) return;
        syncFromNativeScroll();
        lenis.start();
        finishFreeBrowseAndSnap();
      }, 140);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!isScrollbarPointer(event)) return;

      scrollbarDragging = true;
      window.clearTimeout(snapTimer);
      beginFreeBrowse();
      lenis.stop();
    };

    const onPointerUp = () => {
      if (!scrollbarDragging) return;
      scrollbarDragging = false;
      syncFromNativeScroll();
      lenis.start();
      // 松手后吸附到最近阶段，并恢复滚轮切页模式
      window.requestAnimationFrame(() => {
        finishFreeBrowseAndSnap();
      });
    };

    const onNativeScroll = () => {
      const nativeY = window.scrollY || document.documentElement.scrollTop || 0;

      if (scrollbarDragging) {
        syncFromNativeScroll();
        return;
      }

      if (
        document.documentElement.classList.contains("is-scroll-locked") &&
        Math.abs(nativeY - lenis.scroll) > 8
      ) {
        beginFreeBrowse();
        lenis.scrollTo(nativeY, { immediate: true });
        lenis.start();
        scheduleSnap();
        return;
      }

      // 已进入自由浏览但未再拖滑条：停滚后吸附回阶段模式
      if (isFreeBrowse()) {
        scheduleSnap();
      }
    };

    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("pointerup", onPointerUp, true);
    window.addEventListener("pointercancel", onPointerUp, true);
    window.addEventListener("scroll", onNativeScroll, { passive: true });

    const onLenisRefresh = () => {
      lenis.resize();
    };

    ScrollTrigger.addEventListener("refresh", onLenisRefresh);
    ScrollTrigger.refresh();

    return () => {
      window.clearTimeout(snapTimer);
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("pointerup", onPointerUp, true);
      window.removeEventListener("pointercancel", onPointerUp, true);
      window.removeEventListener("scroll", onNativeScroll);
      ScrollTrigger.removeEventListener("refresh", onLenisRefresh);
      delete window.__siclinkLenis;
      lenis.destroy();
      gsap.ticker.remove(raf);
    };
  }, []);

  return children;
}
