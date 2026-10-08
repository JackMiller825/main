import { useEffect, useRef, useState } from "react";
import { asset } from "../config/assets";
import { useReducedMotion } from "../hooks/useReducedMotion";

const candles = [
  { h: 28, up: true },
  { h: 18, up: false },
  { h: 36, up: true },
  { h: 24, up: true },
  { h: 16, up: false },
  { h: 42, up: true },
  { h: 30, up: false },
  { h: 48, up: true },
  { h: 38, up: true },
  { h: 26, up: false },
  { h: 58, up: true },
  { h: 44, up: true },
  { h: 34, up: false },
  { h: 70, up: true },
  { h: 62, up: true },
];

const chartLine = "M12 132 C 50 128, 70 118, 100 110 S 160 92, 190 78 S 250 58, 290 36 S 330 22, 348 14";
const flightLine = `${chartLine} C 356 -8, 348 -90, 336 -190 C 322 -280, 308 -380, 292 -500`;
const PIN_X = 0.3;
const PIN_Y = 0.7;
const NOSE_OFFSET = 48;

export function FloatingChart({ className = "" }: { className?: string }) {
  const width = 360;
  const height = 180;
  const gap = width / candles.length;
  const svgRef = useRef<SVGSVGElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const flightRef = useRef<SVGPathElement>(null);
  const rocketRef = useRef<HTMLButtonElement>(null);
  const busy = useRef(false);
  const [flying, setFlying] = useState(false);
  const reduced = useReducedMotion();

  function place(progress: number, opacity: number) {
    const svg = svgRef.current;
    const flight = flightRef.current;
    const rocket = rocketRef.current;
    const stage = rocket?.offsetParent;
    if (!svg || !flight || !rocket || !(stage instanceof HTMLElement)) return;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const length = flight.getTotalLength();
    const distance = Math.min(length, Math.max(0, progress) * length);
    const point = flight.getPointAtLength(distance);
    const ahead = flight.getPointAtLength(Math.min(length, distance + 6));
    const screen = new DOMPoint(point.x, point.y).matrixTransform(ctm);
    const stageRect = stage.getBoundingClientRect();
    const angle = (Math.atan2(ahead.y - point.y, ahead.x - point.x) * 180) / Math.PI;
    rocket.style.left = `${screen.x - stageRect.left - rocket.offsetWidth * PIN_X}px`;
    rocket.style.top = `${screen.y - stageRect.top - rocket.offsetHeight * PIN_Y}px`;
    rocket.style.transform = `rotate(${angle + NOSE_OFFSET}deg)`;
    rocket.style.opacity = String(opacity);
  }

  function park() {
    if (busy.current) return;
    place(0, 1);
  }

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    park();
    const observer = new ResizeObserver(() => park());
    observer.observe(svg);
    svg.addEventListener("animationend", park);
    const started = performance.now();
    let frame = 0;
    const followRise = (now: number) => {
      park();
      if (now - started < 2600) frame = requestAnimationFrame(followRise);
    };
    frame = requestAnimationFrame(followRise);
    window.addEventListener("resize", park);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      svg.removeEventListener("animationend", park);
      window.removeEventListener("resize", park);
    };
  }, []);

  function launch() {
    const flight = flightRef.current;
    const line = lineRef.current;
    const rocket = rocketRef.current;
    if (!flight || !line || !rocket || busy.current || reduced) return;
    const ctm = svgRef.current?.getScreenCTM();
    const stage = rocket.offsetParent;
    if (!ctm || !(stage instanceof HTMLElement)) return;

    busy.current = true;
    setFlying(true);
    const length = flight.getTotalLength();
    const steps = 56;
    const stageRect = stage.getBoundingClientRect();
    const frames = Array.from({ length: steps + 1 }, (_, index) => {
      const distance = (index / steps) * length;
      const point = flight.getPointAtLength(distance);
      const ahead = flight.getPointAtLength(Math.min(length, distance + 6));
      const screen = new DOMPoint(point.x, point.y).matrixTransform(ctm);
      const angle = (Math.atan2(ahead.y - point.y, ahead.x - point.x) * 180) / Math.PI;
      const fade = index < steps * 0.82 ? 1 : 1 - (index - steps * 0.82) / (steps * 0.18);
      return {
        left: `${screen.x - stageRect.left - rocket.offsetWidth * PIN_X}px`,
        top: `${screen.y - stageRect.top - rocket.offsetHeight * PIN_Y}px`,
        transform: `rotate(${angle + NOSE_OFFSET}deg)`,
        opacity: Math.max(0, fade),
      };
    });
    const duration = (length / line.getTotalLength()) * 1700;
    const motion = rocket.animate(frames, { duration, easing: "linear", fill: "forwards" });
    motion.onfinish = () => {
      rocket.style.opacity = "0";
      motion.cancel();
      window.setTimeout(() => {
        busy.current = false;
        setFlying(false);
        place(0, 1);
      }, 700);
    };
  }

  return (
    <>
      <svg
        ref={svgRef}
        className={`floating-chart ${className}`.trim()}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Decorative rising candlestick pattern. No price data."
      >
        <line x1="0" y1="168" x2="360" y2="168" className="chart-axis" />
        {candles.map((candle, index) => {
          const x = index * gap + gap * 0.28;
          const barWidth = gap * 0.44;
          const y = 160 - candle.h;
          return (
            <g key={index} className="candle" style={{ animationDelay: `${0.85 + index * 0.04}s` }}>
              <line
                x1={x + barWidth / 2}
                y1={y - 8}
                x2={x + barWidth / 2}
                y2={y + candle.h + 8}
                className={candle.up ? "wick wick-up" : "wick wick-down"}
              />
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={candle.h}
                rx="1.5"
                className={candle.up ? "body body-up" : "body body-down"}
              />
            </g>
          );
        })}
        <path ref={lineRef} d={chartLine} className="chart-path" />
        <path ref={flightRef} d={flightLine} fill="none" />
      </svg>
      <button
        ref={rocketRef}
        className="chart-rocket"
        type="button"
        aria-label="Launch the rocket up the green line toward Mars"
        disabled={flying || reduced}
        onClick={launch}
      >
        <img src={asset("images/muskpat-sticker-rocket.png")} alt="" width="110" height="110" />
      </button>
    </>
  );
}
