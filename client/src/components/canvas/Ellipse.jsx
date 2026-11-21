/* === FEATURE 1: CREATING DIFFERENT SHAPES === */
/* === FEATURE 3: CUSTOMIZATION (Fill, Stroke, Width, Style, Opacity) === */
import { colorToCss } from "../../utils";

export default function Ellipse({ id, layer, onPointerDown }) {
  const { x, y, width, height, fill, stroke, opacity, strokeWidth, strokeStyle } = layer;

  return (
    <g className="group">
      <ellipse
        style={{ transform: `translate(${x}px, ${y}px)` }}
        cx={width / 2}
        cy={height / 2}
        rx={width / 2}
        ry={height / 2}
        fill="none"
        stroke="#0b99ff"
        strokeWidth="4"
        className="pointer-events-none opacity-0 group-hover:opacity-100"
      />
      <ellipse
        onPointerDown={(e) => onPointerDown(e, id)}
        style={{ transform: `translate(${x}px, ${y}px)` }}
        fill={fill ? colorToCss(fill) : "#CCC"}
        stroke={stroke ? colorToCss(stroke) : "#CCC"}
        strokeWidth={strokeWidth ?? 1}
        strokeDasharray={strokeStyle === "dashed" ? "6 4" : undefined}
        cx={width / 2}
        cy={height / 2}
        rx={width / 2}
        ry={height / 2}
        opacity={`${opacity ?? 100}%`}
      />
    </g>
  );
}
