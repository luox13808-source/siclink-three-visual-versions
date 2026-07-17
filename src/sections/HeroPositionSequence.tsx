"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { videos } from "@/assets/videos";
import { mediaBackups } from "@/assets/mediaBackups";
import MediaBackup from "@/components/MediaBackup";
import { useVisualVersion } from "@/components/VisualVersion";

type HeroPositionSequenceProps = {
  hero: {
    title?: string;
    titleLines?: string[];
    subtitleLines: string[];
    scrollCta: string;
    heroVideoAlt: string;
    positionVideoAlt: string;
  };
  position: {
    sectionTitle: string;
    headline: string;
    body: string;
  };
  language?: "zh" | "en";
};

export default function HeroPositionSequence({ hero, position, language = "zh" }: HeroPositionSequenceProps) {
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const positionVideoRef = useRef<HTMLVideoElement>(null);
  const sequenceRef = useRef<HTMLElement>(null);
  const { version } = useVisualVersion();
  const heroVideoSource = version === "starfield" ? videos.heroStarfield : videos.hero;
  const positionVideoSource = version === "starfield" ? videos.positionStarfield : videos.position;

  useEffect(() => {
    const boot = () => {
      const heroVideo = heroVideoRef.current;
      const positionVideo = positionVideoRef.current;
      if (!heroVideo || !positionVideo) return;

      if (heroVideo.dataset.src && !heroVideo.getAttribute("src")) {
        heroVideo.setAttribute("src", heroVideo.dataset.src);
        heroVideo.load();
      }

      positionVideo.pause();
      positionVideo.currentTime = 0;

      const revealHeroVideo = () => {
        heroVideo.classList.add("is-media-ready");
        heroVideo.play().catch(() => {});
      };

      if (heroVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        revealHeroVideo();
      } else {
        heroVideo.addEventListener("loadeddata", revealHeroVideo, { once: true });
      }
    };

    window.addEventListener("siclink-app-ready", boot);

    return () => {
      window.removeEventListener("siclink-app-ready", boot);
    };
  }, []);

  useEffect(() => {
    const swapSource = (video: HTMLVideoElement | null, source: string) => {
      if (!video || !video.getAttribute("src") || video.getAttribute("src") === source) return;

      const shouldResume = !video.paused || video.classList.contains("is-visible");
      video.setAttribute("src", source);
      video.load();

      if (shouldResume) {
        video.addEventListener("loadeddata", () => video.play().catch(() => {}), { once: true });
      }
    };

    swapSource(heroVideoRef.current, heroVideoSource);
    swapSource(positionVideoRef.current, positionVideoSource);
  }, [heroVideoSource, positionVideoSource]);

  return (
    <section
      id="hero"
      ref={sequenceRef}
      className="hero-position-sequence"
      data-hero-position-sequence
      aria-label="SiClink hero and application scenarios"
    >
      <div className="hero-position-pin" data-hero-position-pin>
        <div className="hero-media-shell" data-media-shell="hero">
          <MediaBackup src={mediaBackups.hero} scope="hero" className="hero-media-backup is-visible" data-hero-backup />
          <MediaBackup
            src={mediaBackups.position}
            scope="position"
            className="position-media-backup"
            data-position-backup
          />
          <video
            ref={heroVideoRef}
            className="sequence-video hero-video-layer is-visible"
            data-progressive-video
            data-src={heroVideoSource}
            muted
            loop
            playsInline
            preload="auto"
            aria-label={hero.heroVideoAlt}
          />
          <video
            ref={positionVideoRef}
            className="sequence-video position-video-layer"
            data-progressive-video
            data-src={positionVideoSource}
            muted
            playsInline
            preload="metadata"
            aria-label={hero.positionVideoAlt}
          />
          <div className="hero-diffuse-light" aria-hidden="true">
            <span className="hero-diffuse-spot hero-diffuse-spot--left" />
            <span className="hero-diffuse-spot hero-diffuse-spot--right" />
          </div>
          <div className="position-diffuse-light" aria-hidden="true">
            <span className="position-diffuse-spot position-diffuse-spot--left" />
            <span className="position-diffuse-spot position-diffuse-spot--right" />
          </div>
        </div>
        <div className="hero-vignette" />

        <div className="hero-content-shell">
          <div className="hero-inner">
            <div className="hero-text-offset">
              <div className={`hero-text-block${language === "en" ? " hero-text-block--en" : ""}`} data-hero-content>
                <Image
                  className="hero-wordmark"
                  src="/images/hero-wordmark.svg"
                  alt="SiClink"
                  width={370}
                  height={94}
                  priority
                />
                <h1>
                  {hero.titleLines
                    ? hero.titleLines.map((line, index) => (
                        <span key={line}>
                          {line}
                          {index < hero.titleLines!.length - 1 && <br />}
                        </span>
                      ))
                    : hero.title}
                </h1>
                <p className="hero-copy" data-pointer-reveal>
                  {hero.subtitleLines.map((line, index) => (
                    <span key={line}>
                      {line}
                      {index < hero.subtitleLines.length - 1 && <br />}
                    </span>
                  ))}
                </p>
              </div>
            </div>
            <div className="hero-bottom-cta" data-hero-buttons>
              <Image
                className="hero-slogan"
                src="/images/slogan.png"
                alt="Think it, Link it"
                width={460}
                height={80}
                priority
              />
              <a className="hero-scroll-cta" href="#position">
                {hero.scrollCta}
              </a>
            </div>
          </div>
        </div>

        <div className="position-copy-shell">
          <div className="position-copy" data-position-content id="position">
            <div className="position-intro position-intro--single">
              <h2 className="position-section-title">{position.sectionTitle}</h2>
              <p className="position-headline" data-pointer-reveal>{position.headline}</p>
              <p className="position-body" data-pointer-reveal>{position.body}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
