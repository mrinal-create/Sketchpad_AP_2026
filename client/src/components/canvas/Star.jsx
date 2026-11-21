/* === FEATURE 1: CREATING DIFFERENT SHAPES (Star Component) === */
import { colorToCss } from "../../utils";

export default function Star({ id, layer, onPointerDown }) {
  const { x, y, width, height, fill, stroke, opacity, strokeWidth, strokeStyle } = layer;

  // Calculate coordinates for a classic 5-point star fitting within width & height
  const cx = width / 2;
  const cy = height / 2;
  const outerR = Math.min(width, height) / 2;
  const innerR = outerR * 0.45;
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  const points = pts.join(" ");

  return (
    <g className="group">
      {/* Hover outline */}
      <polygon
        style={{ transform: `translate(${x}px, ${y}px)` }}
        points={points}
        fill="none"
        stroke="#0b99ff"
        strokeWidth="4"
        className="pointer-events-none opacity-0 group-hover:opacity-100"
      />
      {/* Main rendered star with customizable fill, stroke, strokeWidth, opacity */}
      <polygon
        onPointerDown={(e) => onPointerDown(e, id)}
        style={{ transform: `translate(${x}px, ${y}px)` }}
        points={points}
        fill={fill ? colorToCss(fill) : "#CCC"}
        stroke={stroke ? colorToCss(stroke) : "#CCC"}
        strokeWidth={strokeWidth ?? 1}
        strokeDasharray={strokeStyle === "dashed" ? "6 4" : undefined}
        opacity={`${opacity ?? 100}%`}
      />
    </g>
  );
}
