import Image from "next/image";
import Button from "@/components/Button";
import { videos } from "@/assets/videos";
import { mediaBackups } from "@/assets/mediaBackups";
import MediaBackup from "@/components/MediaBackup";

const OPEN_SOURCE_DIAGRAM_SRC = "/images/open source.png";

type OpenSourceProps = {
  content: {
    sectionTitle: string;
    bodyLines: string[];
    diagramAlt: string;
    videoAlt: string;
    cta: string;
    ctaUrl: string;
  };
};

export default function OpenSource({ content }: OpenSourceProps) {
  return (
    <section
      id="open-source"
      className="section open-source-section"
      data-open-section
      aria-labelledby="open-source-title"
    >
      <div className="open-source-frame open-source-frame--simple">
        <div className="open-source-diffuse-light" aria-hidden="true">
          <span className="section-diffuse-spot open-source-diffuse-spot--upper-left" />
          <span className="section-diffuse-spot open-source-diffuse-spot--lower-right" />
        </div>
        <div className="open-source-video-shell" data-media-shell="open-video" data-open-video-shell>
          <MediaBackup src={mediaBackups.openVideo} scope="open-video" className="open-source-video-backup" />
          <video
            className="open-source-horizon"
            data-open-video
            data-src={videos.cocreate}
            data-progressive-video
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={content.videoAlt}
          />
        </div>

        <div className="open-source-layout">
          <div className="open-source-diagram" data-open-placeholder data-media-shell="open-diagram">
            <MediaBackup
              src={mediaBackups.openSourceDiagram}
              scope="open-diagram"
              className="open-source-diagram-backup"
            />
            <Image
              src={OPEN_SOURCE_DIAGRAM_SRC}
              alt={content.diagramAlt}
              width={1600}
              height={1056}
              className="open-source-diagram-image"
              sizes="(max-width: 980px) 92vw, min(820px, 55vw)"
              priority={false}
            />
          </div>

          <div className="open-source-copy" data-open-copy>
            <h2 id="open-source-title" className="section-eyebrow">
              {content.sectionTitle}
            </h2>
            <div className="open-source-body" data-pointer-reveal>
              {content.bodyLines.map((line, index) => (
                <p key={`${line}-${index}`}>{line}</p>
              ))}
            </div>
            <Button href={content.ctaUrl} external>
              {content.cta}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
