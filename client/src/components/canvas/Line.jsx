/* === FEATURE 1: CREATING DIFFERENT SHAPES (Line Component) === */
import { colorToCss } from "../../utils";

export default function Line({ id, layer, onPointerDown }) {
  const { x, y, width, height, stroke, opacity, strokeWidth, strokeStyle } = layer;

  return (
    <g className="group">
      {/* Hover outline with rounded caps */}
      <line
        style={{ transform: `translate(${x}px, ${y}px)` }}
        x1={0}
        y1={0}
        x2={width}
        y2={height}
        stroke="#0b99ff"
        strokeWidth={(strokeWidth ?? 2) + 6}
        strokeLinecap="round"
        className="pointer-events-none opacity-0 group-hover:opacity-100"
      />
      {/* Main rendered line with customizable stroke, strokeWidth, style, opacity */}
      <line
        onPointerDown={(e) => onPointerDown(e, id)}
        style={{ transform: `translate(${x}px, ${y}px)` }}
        x1={0}
        y1={0}
        x2={width}
        y2={height}
        stroke={stroke ? colorToCss(stroke) : "#CCC"}
        strokeWidth={strokeWidth ?? 2}
        strokeLinecap="round"
        strokeDasharray={strokeStyle === "dashed" ? "8 6" : undefined}
        opacity={`${opacity ?? 100}%`}
      />
    </g>
  );
}
