import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

type GlowButtonProps = {
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
  artSrc?: string;
  showArrow?: boolean;
  title?: string;
};

export function GlowButton({
  href = "",
  onClick,
  disabled = false,
  children,
  variant = "primary",
  className = "",
  artSrc,
  showArrow = false,
  title,
}: GlowButtonProps) {
  const destination = href.trim();
  const canNavigate = destination.length > 0 && !disabled;
  const classes = ["glow-btn", `glow-btn--${variant}`, artSrc ? "glow-btn--art" : "", className]
    .filter(Boolean)
    .join(" ");

  const inner = artSrc ? (
    <>
      <img src={artSrc} alt="" />
      <span className="sr-only">{children}</span>
    </>
  ) : (
    <>
      <span>{children}</span>
      {showArrow ? <ArrowUpRight aria-hidden="true" size={16} /> : null}
    </>
  );

  if (canNavigate) {
    return (
      <a className={classes} href={destination} target="_blank" rel="noopener noreferrer" title={title}>
        {inner}
      </a>
    );
  }

  return (
    <button type="button" className={classes} onClick={onClick} disabled={disabled || !onClick} title={title}>
      {inner}
    </button>
  );
}
