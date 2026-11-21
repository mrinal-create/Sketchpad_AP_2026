/* === FEATURE 4: FREEFORM DRAWING === */
/* === FEATURE 3: CUSTOMIZATION (Freeform Brush Color, Size & Opacity) === */
import { getStroke } from "perfect-freehand";
import { colorToCss, getSvgPathFromStroke } from "../../utils";

export default function Path({
  id,
  layer,
  x,
  y,
  stroke,
  fill,
  opacity,
  points,
  strokeWidth,
  onPointerDown,
}) {
  const actualPoints = points || layer?.points || [];
  const actualX = x !== undefined ? x : layer?.x ?? 0;
  const actualY = y !== undefined ? y : layer?.y ?? 0;
  const actualFill = fill || (layer?.fill ? colorToCss(layer.fill) : "#CCC");
  const actualStroke = stroke || (layer?.stroke ? colorToCss(layer.stroke) : actualFill);
  const actualOpacity = opacity !== undefined ? opacity : layer?.opacity ?? 100;
  const actualSize = strokeWidth || layer?.strokeWidth || 16;

  // Calculate smooth stroke path with variable pressure from perfect-freehand
  const pathData = getSvgPathFromStroke(
    getStroke(actualPoints, {
      size: actualSize,
      thinning: 0.5,
      smoothing: 0.5,
      streamline: 0.5,
    }),
  );

  return (
    <g className="group">
      <path
        className="pointer-events-none opacity-0 group-hover:opacity-100"
        style={{ transform: `translate(${actualX}px, ${actualY}px)` }}
        d={pathData}
        fill="none"
        stroke="#0b99ff"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        onPointerDown={(e) => onPointerDown && onPointerDown(e, id)}
        style={{ transform: `translate(${actualX}px, ${actualY}px)` }}
        d={pathData}
        fill={actualFill}
        stroke={actualStroke}
        strokeWidth={1}
        opacity={`${actualOpacity}%`}
      />
    </g>
  );
}
