"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes, PropsWithChildren } from "react";

type ButtonProps = PropsWithChildren<
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    external?: boolean;
    /** 强制整页跳转，避免客户端软路由看起来像叠在主页上 */
    hardNavigate?: boolean;
    href?: string;
  }
>;

export default function Button({
  children,
  className = "",
  external = false,
  hardNavigate = false,
  href = "#",
  ...props
}: ButtonProps) {
  const classNames = `quantum-button ${className}`.trim();
  const content = (
    <>
      <span>{children}</span>
      <span className="quantum-button-arrow" aria-hidden="true">
        {external ? "↗" : "→"}
      </span>
    </>
  );

  if (!external && !hardNavigate && href.startsWith("/")) {
    return (
      <Link href={href} className={classNames} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <a
      className={classNames}
      href={href}
      {...props}
      target={props.target ?? (external ? "_blank" : undefined)}
      rel={props.rel ?? (external ? "noopener noreferrer" : undefined)}
    >
      {content}
    </a>
  );
}
