import type { ReactNode, SVGProps } from "react";

function Svg({ children, ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

export function TelegramIcon() {
  return (
    <Svg>
      <path
        fill="currentColor"
        d="M21.6 4.3 2.7 11.4c-1.2.5-1.2 1.1-.2 1.4l4.8 1.5 1.9 5.8c.2.7.1.9.8.9.5 0 .7-.2 1-.5l2.7-2.6 5.6 4.1c1 .6 1.8.3 2-1l3.4-15.8c.3-1.4-.5-2-1.6-1.5ZM8.8 14.2l9.5-6c.5-.3.9-.1.5.2l-7.8 7-.3 3.2-2-4.4Z"
      />
    </Svg>
  );
}

export function XIcon() {
  return (
    <Svg>
      <path
        fill="currentColor"
        d="M14.7 10.4 21.9 2h-1.7l-6.2 7.2L8.8 2H2.4l7.6 11.1L2.4 22h1.7l6.7-7.7L14.9 22h6.4l-6.6-11.6Zm-2.4 2.7-.8-1.1-6.2-8.8h2.7l5 7.1.8 1.1 6.5 9.3h-2.7l-5.3-7.6Z"
      />
    </Svg>
  );
}

export function DiscordIcon() {
  return (
    <Svg>
      <path
        fill="currentColor"
        d="M18.6 5.2A15 15 0 0 0 14.9 4l-.4.8a13 13 0 0 1 3.3 1.3 12 12 0 0 0-11.6 0A12 12 0 0 1 9.5 4.8L9.1 4a15 15 0 0 0-3.7 1.2C3.2 8.6 2.6 11.9 2.8 15.2A15 15 0 0 0 7.4 17l.8-1.1a10 10 0 0 1-1.3-.6l.3-.2c2.5 1.2 5.2 1.2 7.6 0l.3.2c-.4.2-.8.5-1.3.6l.8 1.1a15 15 0 0 0 4.6-1.8c.4-3.8-.5-7-1.6-10ZM9.3 13.6c-.8 0-1.5-.8-1.5-1.7s.7-1.7 1.5-1.7 1.5.8 1.5 1.7-.6 1.7-1.5 1.7Zm5.4 0c-.8 0-1.5-.8-1.5-1.7s.7-1.7 1.5-1.7 1.5.8 1.5 1.7-.7 1.7-1.5 1.7Z"
      />
    </Svg>
  );
}
