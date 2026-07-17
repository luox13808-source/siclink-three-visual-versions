"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Background from "@/components/Background";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import JoinUs, { JoinUsTabBar, type JoinTabId, type JoinUsHandle } from "@/sections/JoinUs";
import en from "@/data/en.json";
import zh from "@/data/zh.json";
import { getInitialLanguage, saveLanguage, type Language } from "@/utils/language";

function clearHomepageStageClasses() {
  document.documentElement.classList.remove(
    "is-scroll-locked",
    "is-open-community-active",
    "is-core-active",
    "is-free-browse",
  );
  document.body.classList.remove("is-scroll-locked");
}

function JoinUsContent() {
  const [language, setLanguage] = useState<Language>("zh");
  const [activeTab, setActiveTab] = useState<JoinTabId>("team");
  const joinRef = useRef<JoinUsHandle>(null);

  useEffect(() => {
    setLanguage(getInitialLanguage());
  }, []);

  useEffect(() => {
    clearHomepageStageClasses();
    document.documentElement.dataset.language = language;
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);

  const content = useMemo(() => (language === "zh" ? zh : en), [language]);

  const changeLanguage = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
    saveLanguage(nextLanguage);
  };

  const handleActiveTabChange = useCallback((tab: JoinTabId) => {
    setActiveTab(tab);
  }, []);

  const handleSelectTab = useCallback((tab: JoinTabId) => {
    joinRef.current?.scrollToTab(tab);
  }, []);

  return (
    <>
      <Background />
      <Header
        language={language}
        onLanguageChange={changeLanguage}
        logoHref="/"
        variant="solid"
        center={
          <JoinUsTabBar
            tabs={content.joinUs.tabs}
            activeTab={activeTab}
            onSelect={handleSelectTab}
          />
        }
      />
      <main>
        <JoinUs
          ref={joinRef}
          language={language}
          activeTab={activeTab}
          onActiveTabChange={handleActiveTabChange}
          content={content.joinUs}
        />
      </main>
      <Footer {...content.footer} />
    </>
  );
}

export default function JoinUsPage() {
  return (
    <Providers>
      <JoinUsContent />
    </Providers>
  );
}
