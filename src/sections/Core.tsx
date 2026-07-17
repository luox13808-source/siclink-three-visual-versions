"use client";

import Image from "next/image";
import { useState } from "react";
import { mediaBackups } from "@/assets/mediaBackups";
import MediaBackup from "@/components/MediaBackup";

type CoreModule = {
  title: string;
  body: string;
  image: string;
};

type CoreProps = {
  content: {
    title: string;
    modules: CoreModule[];
  };
};

const CORE_COPY_BACKDROP = {
  blue: "/images/blue boix.svg",
  orange: "/images/orange box.svg",
} as const;

function CorePanelMedia({
  module,
  index,
}: {
  module: CoreModule;
  index: number;
}) {
  const [hiresReady, setHiresReady] = useState(false);
  const backupSrc = mediaBackups.coreModules[index] ?? mediaBackups.coreModules[0];

  return (
    <div
      className={`core-panel-media${hiresReady ? " is-hires-ready" : ""}`}
      data-core-media
      data-media-shell="core"
    >
      <MediaBackup src={backupSrc} scope="core" className="core-panel-backup" />
      <Image
        className="core-panel-image"
        src={module.image}
        alt={module.title}
        fill
        sizes="(max-width: 980px) 94vw, min(980px, 62vw)"
        onLoadingComplete={() => setHiresReady(true)}
        onError={() => setHiresReady(false)}
      />
    </div>
  );
}

export default function Core({ content }: CoreProps) {
  return (
    <section id="core" className="section core-section" data-core-section aria-labelledby="core-title">
      <div className="core-pin" data-core-pin>
        <div className="core-diffuse-light" aria-hidden="true">
          <span className="core-diffuse-spot core-diffuse-spot--left" />
          <span className="core-diffuse-spot core-diffuse-spot--bottom" />
        </div>
        <div className="core-pages" data-core-pages>
          {content.modules.map((module, index) => {
            const tone = index === 1 ? "orange" : "blue";
            const backdropSrc = CORE_COPY_BACKDROP[tone];

            return (
              <article
                key={module.title}
                className={`core-panel ${index % 2 === 0 ? "core-panel--text-left" : "core-panel--text-right"}`}
                data-core-panel
                data-core-panel-index={index}
              >
                <div className={`core-panel-copy core-panel-copy--${tone}`} data-core-copy>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="core-panel-copy-backdrop"
                    src={backdropSrc}
                    alt=""
                    aria-hidden="true"
                    decoding="async"
                  />
                  <div className="core-panel-copy-inner">
                    <p className="core-panel-eyebrow">{content.title}</p>
                    <h2 id={index === 0 ? "core-title" : undefined} className="core-panel-title">
                      {module.title}
                    </h2>
                    <p className="core-panel-body">{module.body}</p>
                  </div>
                </div>
                <CorePanelMedia module={module} index={index} />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
