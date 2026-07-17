"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import Button from "@/components/Button";
import MediaBackup from "@/components/MediaBackup";
import { mediaBackups } from "@/assets/mediaBackups";
import { videos } from "@/assets/videos";
import type { Language } from "@/utils/language";

type JoinTeam = {
  id: string;
  title: string;
  image: string;
};

type AboutSection = {
  label: string;
  title: string;
  headline: string;
  body?: string;
  bodyLines?: string[];
};

export type JoinTabId = "team" | "about";

export type JoinUsHandle = {
  scrollToTab: (tab: JoinTabId) => void;
};

type JoinUsProps = {
  language: Language;
  activeTab: JoinTabId;
  onActiveTabChange: (tab: JoinTabId) => void;
  content: {
    tabs: {
      team: string;
      about: string;
    };
    teams: JoinTeam[];
    cta: string;
    ctaUrl: string;
    about: {
      sections: AboutSection[];
      closing: {
        title: string;
        body: string;
      };
    };
  };
};

const JoinUs = forwardRef<JoinUsHandle, JoinUsProps>(function JoinUs(
  { activeTab, onActiveTabChange, content },
  ref,
) {
  const teamRef = useRef<HTMLElement | null>(null);
  const aboutRef = useRef<HTMLElement | null>(null);
  const scrollingRef = useRef(false);

  useEffect(() => {
    const team = teamRef.current;
    const about = aboutRef.current;
    if (!team || !about) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollingRef.current) return;

        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;
        const next = visible.target === about ? "about" : "team";
        if (next !== activeTab) onActiveTabChange(next);
      },
      {
        root: null,
        threshold: [0.25, 0.4, 0.55],
        rootMargin: "-18% 0px -35% 0px",
      },
    );

    observer.observe(team);
    observer.observe(about);
    return () => observer.disconnect();
  }, [activeTab, onActiveTabChange]);

  const scrollToTab = useCallback(
    (tab: JoinTabId) => {
      const target = tab === "team" ? teamRef.current : aboutRef.current;
      if (!target) return;

      onActiveTabChange(tab);
      scrollingRef.current = true;
      target.scrollIntoView({ behavior: "smooth", block: "start" });

      window.setTimeout(() => {
        scrollingRef.current = false;
      }, 900);
    },
    [onActiveTabChange],
  );

  useImperativeHandle(ref, () => ({ scrollToTab }), [scrollToTab]);

  return (
    <div className="join-us-page">
      <section
        id="join-team"
        ref={teamRef}
        className="join-us-section join-us-team-section"
        aria-labelledby="join-team-title"
      >
        <h1 id="join-team-title" className="sr-only">
          {content.tabs.team}
        </h1>

        <div className="join-us-team-stage">
          <div className="join-us-team-grid">
            {content.teams.map((team, index) => (
              <article
                key={team.id}
                className={`join-us-team-card join-us-team-card--${(index % 5) + 1}`}
                data-join-card
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="join-us-team-card-image"
                  src={encodeURI(team.image)}
                  alt={team.title}
                  loading={index < 3 ? "eager" : "lazy"}
                  decoding="async"
                />
              </article>
            ))}
          </div>

          <div className="join-us-team-cta">
            <Button className="join-us-positions-button" href={content.ctaUrl} external>
              {content.cta}
            </Button>
          </div>
        </div>
      </section>

      <section
        id="join-about"
        ref={aboutRef}
        className="join-us-section join-us-about-section"
        aria-labelledby="join-about-title"
      >
        <h2 id="join-about-title" className="sr-only">
          {content.tabs.about}
        </h2>

        {content.about.sections.map((section) => (
          <div className="join-us-about-block" key={section.label}>
            <div className="join-us-about-copy">
              <p className="join-us-label">{section.label}</p>
              <h3 className="join-us-section-title">{section.title}</h3>
              <p className="join-us-headline" data-pointer-reveal>
                {section.headline}
              </p>
              {section.bodyLines ? (
                <p className="join-us-body" data-pointer-reveal>
                  {section.bodyLines.map((line, index) => (
                    <span key={`${section.label}-${index}`}>
                      {index > 0 && <br />}
                      {line}
                    </span>
                  ))}
                </p>
              ) : (
                section.body && (
                  <p className="join-us-body" data-pointer-reveal>
                    {section.body}
                  </p>
                )
              )}
            </div>
          </div>
        ))}

        <div className="join-us-about-closing">
          <div className="join-us-closing-video-shell" data-media-shell="open-video" aria-hidden="true">
            <MediaBackup
              src={mediaBackups.openVideo}
              scope="open-video"
              className="join-us-closing-video-backup"
            />
            <video
              className="join-us-closing-video"
              data-src={videos.cocreate}
              data-progressive-video
              muted
              loop
              playsInline
              preload="metadata"
            />
          </div>
          <div className="join-us-about-horizon" aria-hidden="true" />
          <h3 className="join-us-closing-title">{content.about.closing.title}</h3>
          <p className="join-us-closing-body" data-pointer-reveal>
            {content.about.closing.body}
          </p>
        </div>
      </section>
    </div>
  );
});

export default JoinUs;

export function JoinUsTabBar({
  tabs,
  activeTab,
  onSelect,
}: {
  tabs: { team: string; about: string };
  activeTab: JoinTabId;
  onSelect: (tab: JoinTabId) => void;
}) {
  return (
    <div className="join-us-tab-bar" role="tablist" aria-label="Join us sections">
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "team"}
        className={`join-us-tab join-us-tab--team${activeTab === "team" ? " is-active" : ""}`}
        onClick={() => onSelect("team")}
      >
        {tabs.team}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "about"}
        className={`join-us-tab join-us-tab--about${activeTab === "about" ? " is-active" : ""}`}
        onClick={() => onSelect("about")}
      >
        {tabs.about}
      </button>
    </div>
  );
}
