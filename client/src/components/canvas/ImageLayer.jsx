/* === FEATURE 2: UPLOADING IMAGES (ImageLayer Component) === */
export default function ImageLayer({ id, layer, onPointerDown }) {
  const { x, y, width, height, src, opacity } = layer;

  return (
    <g className="group">
      {/* Hover outline */}
      <rect
        style={{ transform: `translate(${x}px, ${y}px)` }}
        width={width}
        height={height}
        fill="none"
        stroke="#0b99ff"
        strokeWidth="4"
        className="pointer-events-none opacity-0 group-hover:opacity-100"
      />
      {/* Render uploaded image with position, dimensions, and opacity */}
      <image
        onPointerDown={(e) => onPointerDown(e, id)}
        style={{ transform: `translate(${x}px, ${y}px)` }}
        href={src}
        width={width}
        height={height}
        preserveAspectRatio="none"
        opacity={`${(opacity ?? 100) / 100}`}
      />
    </g>
  );
}
