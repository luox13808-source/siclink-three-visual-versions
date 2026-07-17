"use client";

import Image from "next/image";

type HeroProps = {
  content: {
    brand: string;
    title: string;
    subtitle: string;
    tagline: string;
    scrollCta: string;
  };
};

export default function Hero({ content }: HeroProps) {
  return (
    <section id="hero" className="section hero-section" data-section="hero">
      <div className="hero-inner" data-hero-content>
        <Image
          className="hero-wordmark"
          src="/images/hero-wordmark.svg"
          alt={content.brand}
          width={370}
          height={94}
          priority
        />
        <h1>{content.title}</h1>
        <p className="hero-copy">{content.subtitle}</p>
        <p className="hero-tagline">{content.tagline}</p>
        <a className="hero-scroll-cta" href="#position">
          {content.scrollCta}
        </a>
      </div>
    </section>
  );
}
