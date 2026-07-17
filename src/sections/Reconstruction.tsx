"use client";

import Image from "next/image";
import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initReconstructionSectionTransition } from "@/animations/pageSectionsTransition";

type ReconstructionProps = {
  content: {
    sectionTitle: string;
    headlineLines: string[];
    bodyLines: string[];
  };
};

export default function Reconstruction({ content }: ReconstructionProps) {
  useEffect(() => {
    let cleanup = initReconstructionSectionTransition();

    const refresh = () => {
      cleanup?.();
      cleanup = initReconstructionSectionTransition();
      window.requestAnimationFrame(() => ScrollTrigger.refresh());
    };

    window.addEventListener("siclink-app-ready", refresh);

    return () => {
      window.removeEventListener("siclink-app-ready", refresh);
      cleanup?.();
    };
  }, []);

  return (
    <section
      id="reconstruction"
      className="section reconstruction-section"
      data-reconstruction-section
      aria-labelledby="reconstruction-title"
    >
      <div className="reconstruction-frame">
        <div className="reconstruction-arc" aria-hidden="true">
          <div data-reconstruction-visual>
            <Image src="/images/rebuild-blue-arc.png" alt="Visual reconstruction background arc illustration" width={1040} height={720} />
          </div>
        </div>

        <div className="reconstruction-device" data-reconstruction-visual>
          <Image
            src="/images/rebuild-device.png"
            alt="Neural interface device illustration"
            width={520}
            height={680}
            unoptimized
            priority={false}
          />
        </div>

        <div className="reconstruction-monitor" data-reconstruction-visual>
          <Image
            src="/images/rebuild-monitor.png"
            alt="Visual reconstruction monitor display illustration"
            width={960}
            height={720}
            unoptimized
          />
        </div>

        <div className="reconstruction-copy" data-reconstruction-copy>
          <h2 id="reconstruction-title" className="section-eyebrow reconstruction-eyebrow">
            {content.sectionTitle}
          </h2>
          <p className="reconstruction-headline">
            {content.headlineLines.map((line, index) => (
              <span key={line}>
                {line}
                {index < content.headlineLines.length - 1 && <br />}
              </span>
            ))}
          </p>
          <div className="reconstruction-body">
            {content.bodyLines.map((line) => (
              <p key={line} data-pointer-reveal>
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
