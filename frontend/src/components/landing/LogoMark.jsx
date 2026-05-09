/**
 * Third Rail Systems — vector logo mark.
 *
 * Hand-traced from the cleaned PNG so each brand layer is a real path:
 *   • silver crossbar (linear gradient)
 *   • two metallic stems (purple → gold → purple)
 *   • cyan core line (animatable as a real SVG stroke-draw)
 *   • soft cyan halo (radial)
 *
 * Pass `animate` to trigger the entrance choreography:
 *   1. cyan core stroke-draws top→bottom,
 *   2. the metallic plinths fade in,
 *   3. the crossbar settles last.
 *
 * Honours `prefers-reduced-motion` automatically (CSS keyframes are gated
 * via the same media query in /app/frontend/src/index.css).
 */
export default function LogoMark({
  className = "",
  animate = false,
  ariaHidden = true,
  title = "Third Rail Systems OÜ",
}) {
  const animClass = animate ? " trs-svg-animate" : "";
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      role={ariaHidden ? "presentation" : "img"}
      aria-hidden={ariaHidden ? "true" : undefined}
      aria-label={ariaHidden ? undefined : title}
      className={`block h-full w-full${animClass} ${className}`.trim()}
    >
      <defs>
        <linearGradient id="trs-silver" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#A8ADB3" />
          <stop offset="20%" stopColor="#D7DBDF" />
          <stop offset="50%" stopColor="#EFF2F4" />
          <stop offset="80%" stopColor="#C7CBD0" />
          <stop offset="100%" stopColor="#9DA2A8" />
        </linearGradient>

        <linearGradient id="trs-stem" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5347A0" />
          <stop offset="22%" stopColor="#7A5E92" />
          <stop offset="42%" stopColor="#C68A50" />
          <stop offset="52%" stopColor="#E0A968" />
          <stop offset="62%" stopColor="#C68A50" />
          <stop offset="82%" stopColor="#6B528E" />
          <stop offset="100%" stopColor="#2E2750" />
        </linearGradient>

        <linearGradient id="trs-stem-mirror" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2E2750" />
          <stop offset="18%" stopColor="#6B528E" />
          <stop offset="38%" stopColor="#C68A50" />
          <stop offset="48%" stopColor="#E0A968" />
          <stop offset="58%" stopColor="#C68A50" />
          <stop offset="78%" stopColor="#7A5E92" />
          <stop offset="100%" stopColor="#5347A0" />
        </linearGradient>

        <radialGradient id="trs-halo" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.32" />
          <stop offset="55%" stopColor="#22D3EE" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
        </radialGradient>

        <filter id="trs-cyan-glow" x="-100%" y="-50%" width="300%" height="200%">
          <feGaussianBlur stdDeviation="2.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Soft halo behind the mark — anchors the cyan accent visually */}
      <rect
        className="trs-svg-halo"
        x="20"
        y="40"
        width="160"
        height="135"
        fill="url(#trs-halo)"
        rx="20"
      />

      {/* Silver crossbar */}
      <rect
        className="trs-svg-crossbar"
        x="54"
        y="50"
        width="92"
        height="18"
        rx="3"
        fill="url(#trs-silver)"
      />

      {/* Subtle highlight band on the crossbar */}
      <rect
        className="trs-svg-crossbar"
        x="56"
        y="52"
        width="88"
        height="2.4"
        rx="1.2"
        fill="#FFFFFF"
        opacity="0.45"
      />

      {/* Left stem */}
      <rect
        className="trs-svg-stem trs-svg-stem-left"
        x="78"
        y="72"
        width="18"
        height="88"
        rx="1"
        fill="url(#trs-stem)"
      />

      {/* Right stem (mirrored gradient for subtle asymmetry like the source) */}
      <rect
        className="trs-svg-stem trs-svg-stem-right"
        x="104"
        y="72"
        width="18"
        height="88"
        rx="1"
        fill="url(#trs-stem-mirror)"
      />

      {/* Cyan core beam — outer soft glow underlay (wider, low opacity) */}
      <line
        className="trs-svg-core-glow"
        x1="100"
        y1="68"
        x2="100"
        y2="164"
        stroke="#22D3EE"
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.28"
        filter="url(#trs-cyan-glow)"
      />

      {/* Cyan core beam — sharp inner line (true SVG stroke-draw target) */}
      <line
        className="trs-svg-core"
        x1="100"
        y1="68"
        x2="100"
        y2="164"
        stroke="#00E5FF"
        strokeWidth="3.2"
        strokeLinecap="round"
        // pathLength normalises stroke math so dasharray=1 == full path
        pathLength="1"
      />

      {/* Cyan core beam — bright white-cyan highlight (very thin, sits on top) */}
      <line
        className="trs-svg-core-highlight"
        x1="100"
        y1="70"
        x2="100"
        y2="162"
        stroke="#E6FBFF"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  );
}
