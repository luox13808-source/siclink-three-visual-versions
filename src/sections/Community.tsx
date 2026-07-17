"use client";

import Button from "@/components/Button";
import { videos } from "@/assets/videos";
import { mediaBackups } from "@/assets/mediaBackups";
import MediaBackup from "@/components/MediaBackup";
import Footer, { type FooterProps } from "@/components/Footer";

type CommunityProps = {
  content: {
    sectionTitle: string;
    bodyLines: string[];
    videoAlt: string;
    cta: string;
    ctaUrl: string;
  };
  footer: FooterProps;
};

export default function Community({ content, footer }: CommunityProps) {
  return (
    <section
      id="community"
      className="section community-section"
      data-community-section
      aria-labelledby="community-title"
    >
      <div className="community-frame">
        <div className="community-bg" data-community-visual data-media-shell="community">
          <MediaBackup src={mediaBackups.cooperate} scope="community" className="community-media-backup" />
          <video
            className="community-bg-video"
            data-community-video
            data-progressive-video
            data-src={videos.cooperate}
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={content.videoAlt}
          />
        </div>

        <div className="community-diffuse-light" aria-hidden="true">
          <span className="section-diffuse-spot community-diffuse-spot--upper-right" />
          <span className="section-diffuse-spot community-diffuse-spot--lower-left" />
        </div>

        <div className="community-copy" data-community-copy>
          <h2 id="community-title" className="section-eyebrow">
            {content.sectionTitle}
          </h2>
          <div className="community-body" data-pointer-reveal>
            {content.bodyLines.map((line, index) => (
              <p key={`${line}-${index}`}>{line}</p>
            ))}
          </div>
          <Button
            className="community-cta glow"
            href={content.ctaUrl}
            hardNavigate
            target="_blank"
            rel="noopener noreferrer"
          >
            {content.cta}
          </Button>
        </div>
      </div>

      <Footer {...footer} diffuseLights />
    </section>
  );
}
