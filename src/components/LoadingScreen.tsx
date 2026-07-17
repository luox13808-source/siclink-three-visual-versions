"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type LoadingScreenProps = {
  onComplete: () => void;
};

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [phase, setPhase] = useState<"visible" | "exit" | "done">("visible");

  useEffect(() => {
    const exitTimer = window.setTimeout(() => setPhase("exit"), 2200);
    const doneTimer = window.setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 2800);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
    };
  }, [onComplete]);

  if (phase === "done") return null;

  return (
    <div className={`loading-screen ${phase === "exit" ? "loading-screen--exit" : ""}`} aria-hidden="true">
      <div className="loading-core">
        <Image src="/images/logo.svg" alt="SiClink" width={140} height={40} priority />
        <p>Initializing Neural Interface...</p>
        <div className="loading-bar">
          <span />
        </div>
      </div>
    </div>
  );
}
