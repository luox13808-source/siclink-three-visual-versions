import type { HTMLAttributes } from "react";

type MediaBackupProps = {
  src: string;
  className?: string;
  /** 标识所属区块，用于样式隔离，避免串到其他页面 */
  scope: "hero" | "position" | "core" | "open-diagram" | "open-video" | "community" | "join";
} & Omit<HTMLAttributes<HTMLImageElement>, "src" | "alt" | "className">;

export default function MediaBackup({ src, className = "", scope, ...rest }: MediaBackupProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...rest}
      src={src}
      alt=""
      aria-hidden="true"
      data-media-backup={scope}
      className={`media-backup-layer media-backup--${scope} ${className}`.trim()}
      loading="eager"
      decoding="async"
      fetchPriority="high"
    />
  );
}
