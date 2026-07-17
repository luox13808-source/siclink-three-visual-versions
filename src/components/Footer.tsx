"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";

type FooterLink = {
  label: string;
  href: string;
  external: boolean;
  icon: string;
  action?: string;
};

export type FooterProps = {
  tagline: string;
  motto: string;
  copyright: string;
  wechatModalTitle: string;
  wechatModalHint: string;
  links: FooterLink[];
  diffuseLights?: boolean;
};

const WECHAT_QR_SRC = "/images/qrcode_for_wechat.jpg";

export default function Footer({
  tagline,
  motto,
  copyright,
  wechatModalTitle,
  wechatModalHint,
  links,
  diffuseLights = false,
}: FooterProps) {
  const [wechatPinned, setWechatPinned] = useState(false);
  const wechatPopoverId = useId();
  const wechatOpen = wechatPinned;

  useEffect(() => {
    if (!wechatOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setWechatPinned(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [wechatOpen]);

  return (
    <footer id="footer" className="site-footer site-footer--simple">
      {diffuseLights ? (
        <div className="footer-diffuse-light" aria-hidden="true">
          <span className="section-diffuse-spot footer-diffuse-spot--upper-right" />
          <span className="section-diffuse-spot footer-diffuse-spot--lower-left" />
        </div>
      ) : null}
      <div className="footer-inner footer-inner--simple">
        <div className="footer-brand footer-brand--center">
          <Image className="footer-logo" src="/images/logo.svg" alt="SiClink" width={168} height={48} />
          <p className="footer-tagline">{tagline}</p>
          <p className="footer-motto">{motto}</p>
        </div>

        <nav className="footer-social" aria-label="Footer social links">
          {links.map((link) => {
            if (link.action === "wechat-qr") {
              return (
                <div
                  key={link.label}
                  className={`footer-social-wechat${wechatOpen ? " is-open" : ""}`}
                >
                  <button
                    type="button"
                    className="footer-social-link"
                    aria-label={link.label}
                    aria-expanded={wechatOpen}
                    aria-describedby={wechatPopoverId}
                    onClick={() => setWechatPinned((open) => !open)}
                  >
                    <Image
                      className="footer-social-icon"
                      src={link.icon}
                      alt=""
                      width={28}
                      height={28}
                      aria-hidden="true"
                    />
                    <span className="footer-social-label">{link.label}</span>
                  </button>

                  <div
                    id={wechatPopoverId}
                    className="footer-wechat-popover"
                    role="tooltip"
                    aria-label={wechatModalTitle}
                    aria-hidden={!wechatOpen}
                  >
                    <Image
                      className="footer-wechat-popover-qr"
                      src={WECHAT_QR_SRC}
                      alt="SiClink WeChat official account QR code"
                      width={112}
                      height={112}
                      priority
                    />
                    <p>{wechatModalHint}</p>
                  </div>
                </div>
              );
            }

            return (
              <a
                key={link.label}
                className="footer-social-link"
                href={link.href}
                aria-label={link.label}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
              >
                <Image
                  className="footer-social-icon"
                  src={link.icon}
                  alt=""
                  width={28}
                  height={28}
                  aria-hidden="true"
                />
                <span className="footer-social-label">{link.label}</span>
              </a>
            );
          })}
        </nav>

        <p className="copyright">{copyright}</p>
      </div>
    </footer>
  );
}
