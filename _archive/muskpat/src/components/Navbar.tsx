import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { socialLinks } from "../config/socials";
import { tokenConfig } from "../config/token";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useScrollPosition } from "../hooks/useScrollPosition";
import { TelegramIcon, XIcon } from "./BrandIcons";
import { GlowButton } from "./GlowButton";
import { MobileMenu, navLinks } from "./MobileMenu";
import { asset } from "../config/assets";

export function Navbar() {
  const y = useScrollPosition();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");

  useEffect(() => {
    const elements = navLinks
      .map((link) => document.getElementById(link.id))
      .filter((element): element is HTMLElement => element !== null);
    const finale = document.querySelector(".final-cta");
    const ratios = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id || "finale";
          ratios.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        let best = "";
        let bestRatio = 0;
        for (const [id, ratio] of ratios) {
          if (ratio > bestRatio) {
            best = id === "finale" ? "community" : id;
            bestRatio = ratio;
          }
        }
        if (best) setActive(best);
      },
      { threshold: [0.2, 0.45, 0.7], rootMargin: "-18% 0px -40% 0px" },
    );
    elements.forEach((element) => observer.observe(element));
    if (finale) observer.observe(finale);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 1100) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function go(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
    setOpen(false);
  }

  return (
    <header className={y > 12 ? "site-header is-scrolled" : "site-header"}>
      <nav className="nav-bar" aria-label="Primary">
        <a
          className="brand"
          href="#home"
          aria-label="MUSK MOONSHOT PATTERN home"
          onClick={(event) => {
            event.preventDefault();
            go("home");
          }}
        >
          <img src={asset("images/muskpat-logo-icon-transparent.png")} alt="" width="42" height="40" />
          <span>
            <strong>MUSKPAT</strong>
            <small>MOONSHOT PATTERN</small>
          </span>
        </a>

        <ul className="nav-links">
          {navLinks.map((link) => (
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

        <div className="nav-tools">
          <IconLink href={socialLinks.telegram} label="Telegram">
            <TelegramIcon />
          </IconLink>
          <IconLink href={socialLinks.x} label="X">
            <XIcon />
          </IconLink>
          <GlowButton
            href={tokenConfig.uniswapUrl}
            variant="primary"
            showArrow
            className="nav-buy"
            disabled={!tokenConfig.uniswapUrl.trim()}
            title={tokenConfig.uniswapUrl.trim() ? "Buy $MUSKPAT" : "Swap link coming soon"}
          >
            BUY {tokenConfig.ticker}
          </GlowButton>
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>
      <MobileMenu open={open} active={active} onClose={() => setOpen(false)} />
    </header>
  );
}

function IconLink({ href, label, children }: { href: string; label: string; children: ReactNode }) {
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
