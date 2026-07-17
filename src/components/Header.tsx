"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { navigateToSection } from "@/animations/sectionJump";
import type { Language } from "@/utils/language";

type NavItem = {
  label: string;
  href: string;
};

type HeaderProps = {
  language: Language;
  onLanguageChange: (language: Language) => void;
  navItems?: NavItem[];
  /** 居中内容（如加入我们页的分段切换），存在时替代主导航 */
  center?: ReactNode;
  logoHref?: string;
  variant?: "blend" | "solid";
};

export default function Header({
  language,
  onLanguageChange,
  navItems = [],
  center,
  logoHref = "#hero",
  variant = "blend",
}: HeaderProps) {
  const [activeHref, setActiveHref] = useState(navItems[0]?.href ?? "");

  useEffect(() => {
    if (center || navItems.length === 0) return;

    const hrefForSection = (sectionId: string) =>
      navItems.find((item) => item.href.endsWith(`#${sectionId}`))?.href;

    const syncActiveItem = () => {
      let sectionId = "hero";
      const communitySection = document.querySelector<HTMLElement>("[data-community-section]");
      const communityRect = communitySection?.getBoundingClientRect();
      const communityInView =
        !!communityRect &&
        communityRect.top < window.innerHeight * 0.82 &&
        communityRect.bottom > window.innerHeight * 0.12;
      const openSection = document.querySelector<HTMLElement>("[data-open-section]");
      const openRect = openSection?.getBoundingClientRect();
      const openInView =
        !!openRect &&
        openRect.top < window.innerHeight * 0.82 &&
        openRect.bottom > window.innerHeight * 0.18;

      if (document.querySelector("[data-community-section].is-engaged") || communityInView) {
        sectionId = "community";
      } else if (document.querySelector("[data-open-section].is-engaged") || openInView) {
        sectionId = "open-source";
      } else if (
        document.documentElement.classList.contains("is-core-active") ||
        document.querySelector("[data-core-section].is-engaged")
      ) {
        sectionId = "core";
      } else if (document.querySelector(".position-video-layer.is-visible")) {
        sectionId = "position";
      }

      const nextHref = hrefForSection(sectionId);
      if (nextHref) setActiveHref(nextHref);
    };

    const observer = new MutationObserver(syncActiveItem);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    document
      .querySelectorAll(
        ".position-video-layer, [data-core-section], [data-open-section], [data-community-section]",
      )
      .forEach((element) => {
        observer.observe(element, {
          attributes: true,
          attributeFilter: ["class"],
        });
      });

    window.addEventListener("hero-reset", syncActiveItem);
    window.addEventListener("hero-enter-position", syncActiveItem);
    window.addEventListener("scroll", syncActiveItem, { passive: true });
    syncActiveItem();

    return () => {
      observer.disconnect();
      window.removeEventListener("hero-reset", syncActiveItem);
      window.removeEventListener("hero-enter-position", syncActiveItem);
      window.removeEventListener("scroll", syncActiveItem);
    };
  }, [center, navItems]);

  const toggleLanguage = () => {
    onLanguageChange(language === "zh" ? "en" : "zh");
  };

  const handleLogoClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const isHome =
      typeof window !== "undefined" &&
      (window.location.pathname === "/" || window.location.pathname === "");

    if (!isHome) {
      // join-us 等子页：走默认跳转回首页
      return;
    }

    event.preventDefault();
    navigateToSection("hero");
  };

  const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const isHome =
      typeof window !== "undefined" &&
      (window.location.pathname === "/" || window.location.pathname === "");

    if (!isHome) return;

    const sectionId = href.startsWith("/#") ? href.slice(2) : href.startsWith("#") ? href.slice(1) : null;
    if (!sectionId) return;

    event.preventDefault();
    setActiveHref(href);
    navigateToSection(sectionId);
  };

  const resolvedLogoHref = logoHref === "#hero" ? "/" : logoHref;

  return (
    <header
      className={`site-header${variant === "solid" ? " site-header--solid" : ""}${center ? " site-header--with-center" : ""}`}
    >
      <a className="logo-link" href={resolvedLogoHref} aria-label="SiClink home" onClick={handleLogoClick}>
        <Image src="/images/logo.svg" alt="SiClink" width={105} height={30} priority />
      </a>

      {center ? (
        <div className="header-center">{center}</div>
      ) : (
        navItems.length > 0 && (
          <nav className="top-nav" aria-label="Section navigation">
            {navItems.map((item) => {
              const isActive = item.href === activeHref;

              return (
                <a
                  key={item.href}
                  className={isActive ? "is-active" : undefined}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  onClick={(event) => handleNavClick(event, item.href)}
                >
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>
        )
      )}

      <div className="header-right">
        <button
          type="button"
          className="lang-toggle"
          aria-label={language === "zh" ? "切换到 English" : "Switch to 中文"}
          onClick={toggleLanguage}
        >
          {language === "zh" ? "CN" : "EN"}
        </button>
      </div>
    </header>
  );
}
