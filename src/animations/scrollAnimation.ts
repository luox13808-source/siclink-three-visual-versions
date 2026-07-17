"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function sectionReveal() {
  return gsap.utils.toArray<HTMLElement>("[data-reveal]:not([data-position-content])").map((element) =>
    gsap.fromTo(
      element,
      { opacity: 0, y: 70, filter: "blur(10px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: element,
          start: "top 82%",
        },
      },
    ),
  );
}

export function cardFloat() {
  return gsap.utils.toArray<HTMLElement>("[data-float-card]").map((element, index) =>
    gsap.fromTo(
      element,
      { opacity: 0, y: 80, z: -180, rotateX: 18 },
      {
        opacity: 1,
        y: 0,
        z: 0,
        rotateX: 0,
        duration: 1.1,
        delay: index * 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: element,
          start: "top 86%",
        },
      },
    ),
  );
}

export function initScrollAnimations() {
  const contexts = [...sectionReveal(), ...cardFloat()];
  ScrollTrigger.refresh();

  return () => {
    contexts.forEach((context) => {
      if (Array.isArray(context)) context.forEach((item) => item?.kill());
      else context?.kill();
    });
  };
}
