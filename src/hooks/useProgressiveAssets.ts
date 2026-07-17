"use client";

import { useEffect } from "react";
import { isLowBandwidth } from "@/utils/network";

function loadVideo(video: HTMLVideoElement) {
  const deferredSrc = video.dataset.src;
  if (deferredSrc && !video.getAttribute("src")) {
    video.setAttribute("src", deferredSrc);
  }

  video.preload = "auto";
  video.load();

  const markReady = () => {
    video.classList.add("is-media-ready");
  };

  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    markReady();
  } else {
    video.addEventListener("loadeddata", markReady, { once: true });
  }

  video.play().catch(() => {});
  video.addEventListener(
    "error",
    () => {
      video.classList.remove("is-media-ready");
    },
    { once: true },
  );
}

export function useProgressiveAssets() {
  useEffect(() => {
    const lowBandwidth = isLowBandwidth();
    document.documentElement.toggleAttribute("data-low-bandwidth", lowBandwidth);
    document.documentElement.classList.toggle("is-low-bandwidth", lowBandwidth);

    const videos = Array.from(document.querySelectorAll<HTMLVideoElement>("[data-progressive-video]"));
    const images = Array.from(document.querySelectorAll<HTMLImageElement>("[data-progressive-image]"));

    const hydrateImages = () => {
      images.forEach((image) => {
        const deferredSrc = image.dataset.src;
        if (!deferredSrc || image.getAttribute("src")) return;
        image.setAttribute("src", deferredSrc);
        image.addEventListener(
          "load",
          () => {
            image.classList.add("is-media-ready");
          },
          { once: true },
        );
        image.addEventListener(
          "error",
          () => {
            image.classList.remove("is-media-ready");
          },
          { once: true },
        );
      });
    };

    const hydrateVideos = (selector?: string) => {
      const targets = selector ? videos.filter((video) => video.matches(selector)) : videos;
      targets.forEach((video) => loadVideo(video));
    };

    // 备用图已通过 MediaBackup eager 加载；此处只负责视频/高清图
    hydrateImages();
    // 首页必须始终优先加载用户指定的星空视频，备用图只负责加载间隙。
    hydrateVideos(".hero-video-layer");

    if (!lowBandwidth) {
      const schedule = () => hydrateVideos(":not(.hero-video-layer)");
      if (typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(schedule, { timeout: 1200 });
      } else {
        setTimeout(schedule, 400);
      }
      return () => {
        document.documentElement.removeAttribute("data-low-bandwidth");
        document.documentElement.classList.remove("is-low-bandwidth");
      };
    }

    // 低带宽时只延后非首屏视频，首页星空视频仍立即加载。
    const onFirstInteraction = () => {
      hydrateVideos(":not(.hero-video-layer)");
      hydrateImages();
      window.removeEventListener("pointerdown", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
      window.removeEventListener("wheel", onFirstInteraction);
      window.removeEventListener("touchstart", onFirstInteraction);
    };

    window.addEventListener("pointerdown", onFirstInteraction, { passive: true });
    window.addEventListener("keydown", onFirstInteraction);
    window.addEventListener("wheel", onFirstInteraction, { passive: true });
    window.addEventListener("touchstart", onFirstInteraction, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
      window.removeEventListener("wheel", onFirstInteraction);
      window.removeEventListener("touchstart", onFirstInteraction);
      document.documentElement.removeAttribute("data-low-bandwidth");
      document.documentElement.classList.remove("is-low-bandwidth");
    };
  }, []);
}
