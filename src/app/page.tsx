"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Background from "@/components/Background";
import Header from "@/components/Header";
import { initSiteScroll } from "@/animations/initSiteScroll";
import { initScrollAnimations } from "@/animations/scrollAnimation";
import { refreshPageSectionsLayout } from "@/animations/pageSectionsTransition";
import en from "@/data/en.json";
import zh from "@/data/zh.json";
import { getInitialLanguage, saveLanguage, type Language } from "@/utils/language";
import Providers from "@/components/Providers";
import Community from "@/sections/Community";
import Core from "@/sections/Core";
import HeroPositionSequence from "@/sections/HeroPositionSequence";
import OpenSource from "@/sections/OpenSource";
import { refreshPointerReveal } from "@/utils/pointerReveal";

import { buildNavItems, sectionIds } from "@/constants/navigation";
import { navigateToSection } from "@/animations/sectionJump";

function HomeContent() {
  const [language, setLanguage] = useState<Language>("zh");
  const isFirstLanguageEffect = useRef(true);

  useEffect(() => {
    setLanguage(getInitialLanguage());
  }, []);

  useEffect(() => {
    const setup = () => {
      const cleanupScroll = initSiteScroll();
      const cleanupAnim = initScrollAnimations();
      refreshPageSectionsLayout();
      return () => {
        cleanupScroll();
        cleanupAnim();
      };
    };

    let cleanup = setup();

    const onReady = () => {
      cleanup();
      cleanup = setup();
    };

    window.addEventListener("siclink-app-ready", onReady);

    return () => {
      window.removeEventListener("siclink-app-ready", onReady);
      cleanup();
    };
  }, []);

  const content = useMemo(() => (language === "zh" ? zh : en), [language]);

  const navItems = useMemo(
    () => buildNavItems(content.sideNav),
    [content.sideNav],
  );

  useEffect(() => {
    document.documentElement.dataset.language = language;
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";

    if (isFirstLanguageEffect.current) {
      isFirstLanguageEffect.current = false;
      return;
    }

    window.requestAnimationFrame(() => {
      refreshPointerReveal();
    });
  }, [language]);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash || !sectionIds.includes(hash as (typeof sectionIds)[number])) return;

    const timer = window.setTimeout(() => {
      navigateToSection(hash);
    }, 280);

    return () => window.clearTimeout(timer);
  }, []);

  const changeLanguage = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
    saveLanguage(nextLanguage);
  };

  return (
    <>
      <Background />
      <Header language={language} onLanguageChange={changeLanguage} navItems={navItems} />
      <main>
        <HeroPositionSequence hero={content.hero} position={content.position} language={language} />
        <Core content={content.core} />
        <OpenSource content={content.openSource} />
        <Community content={content.community} footer={content.footer} />
      </main>
    </>
  );
}

export default function Home() {
  return (
    <Providers>
      <HomeContent />
    </Providers>
  );
}
