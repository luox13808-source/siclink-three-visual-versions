"use client";

import { useEffect, useState } from "react";

export default function Cursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const move = (event: PointerEvent) => setPosition({ x: event.clientX, y: event.clientY });
    const over = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      setHovering(Boolean(target.closest("a, button, [data-cursor='hover']")));
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerover", over);

    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
    };
  }, []);

  return (
    <div
      className={`custom-cursor ${hovering ? "hovering" : ""}`}
      style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
    />
  );
}
