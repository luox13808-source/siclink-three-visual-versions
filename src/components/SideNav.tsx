"use client";

import { useEffect, useState } from "react";

type SideNavProps = {
  items: string[];
};

const sectionIds = ["hero", "position", "vision", "core", "open-source", "community"];

export default function SideNav({ items }: SideNavProps) {
  const [activeId, setActiveId] = useState(sectionIds[0]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveId(visible.target.id);
        }
      },
      { threshold: [0.35, 0.55, 0.75] },
    );

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <nav
      className={`side-nav ${expanded ? "is-expanded" : ""}`}
      aria-label="Section navigation"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setExpanded(false);
        }
      }}
    >
      {items.map((item, index) => {
        const id = sectionIds[index];
        const active = activeId === id;
        return (
          <a className={active ? "active" : ""} href={`#${id}`} key={id} aria-label={item} title={item}>
            <span className="side-dot" />
            <span className="side-label">{item}</span>
          </a>
        );
      })}
    </nav>
  );
}
