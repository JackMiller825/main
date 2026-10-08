import { useEffect, useState } from "react";

export function useClipboard(value: string) {
  const [copied, setCopied] = useState(false);
  const available = value.trim().length > 0;

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copy() {
    if (!available) return;
    const text = value.trim();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      return;
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      setCopied(ok);
    }
  }

  return { available, copied, copy };
}
