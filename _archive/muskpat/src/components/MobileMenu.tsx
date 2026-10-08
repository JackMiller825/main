import { useEffect } from "react";
import type { ReactNode } from "react";
import { socialLinks } from "../config/socials";
import { tokenConfig } from "../config/token";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { DiscordIcon, TelegramIcon, XIcon } from "./BrandIcons";
import { GlowButton } from "./GlowButton";

const links = [
  { id: "home", label: "HOME" },
  { id: "about", label: "ABOUT" },
  { id: "pattern", label: "PATTERN" },
  { id: "tokenomics", label: "TOKENOMICS" },
  { id: "roadmap", label: "ROADMAP" },
  { id: "how-to-buy", label: "HOW TO BUY" },
  { id: "community", label: "COMMUNITY" },
];

type MobileMenuProps = {
  open: boolean;
  active: string;
  onClose: () => void;
};

export function MobileMenu({ open, active, onClose }: MobileMenuProps) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  function go(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
    onClose();
  }

  return (
    <div className="mobile-menu" id="mobile-menu" role="dialog" aria-modal="true" aria-label="Sections">
      <ul>
        {links.map((link) => (
          <li key={link.id}>
            <a
              href={`#${link.id}`}
              aria-current={active === link.id ? "true" : undefined}
              onClick={(event) => {
                event.preventDefault();
                go(link.id);
              }}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
      <div className="mobile-menu-actions">
        <SocialButton href={socialLinks.telegram} label="Telegram">
          <TelegramIcon />
        </SocialButton>
        <SocialButton href={socialLinks.x} label="X">
          <XIcon />
        </SocialButton>
        <SocialButton href={socialLinks.discord} label="Discord">
          <DiscordIcon />
        </SocialButton>
        <GlowButton
          href={tokenConfig.uniswapUrl}
          variant="primary"
          showArrow
          disabled={!tokenConfig.uniswapUrl.trim()}
          title={tokenConfig.uniswapUrl.trim() ? "Buy $MUSKPAT" : "Swap link coming soon"}
        >
          BUY {tokenConfig.ticker}
        </GlowButton>
      </div>
    </div>
  );
}

function SocialButton({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  if (!href.trim()) {
    return (
      <button type="button" className="icon-btn" disabled aria-label={`${label} coming soon`}>
        {children}
      </button>
    );
  }
  return (
    <a className="icon-btn" href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
      {children}
    </a>
  );
}

export { links as navLinks };
