/* === FEATURE 1: CREATING DIFFERENT SHAPES (Triangle Component) === */
import { colorToCss } from "../../utils";

export default function Triangle({ id, layer, onPointerDown }) {
  const { x, y, width, height, fill, stroke, opacity, strokeWidth, strokeStyle } = layer;

  // Calculate coordinates for an isosceles triangle within the bounding box
  const points = `${width / 2},0 ${width},${height} 0,${height}`;

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
      {/* Main rendered triangle with customizable fill, stroke, strokeWidth, opacity */}
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
