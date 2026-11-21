import { LayerType, Side } from "./types";
export function colorToCss(color) {
  return `#${color.r.toString(16).padStart(2, "0")}${color.g.toString(16).padStart(2, "0")}${color.b.toString(16).padStart(2, "0")}`;
}
export function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

const COLORS = [
  "#E11D48", // Rose
  "#2563EB", // Blue
  "#059669", // Emerald
  "#D97706", // Amber
  "#7C3AED", // Violet
  "#0891B2", // Cyan
  "#DB2777", // Pink
  "#EA580C", // Orange
  "#4F46E5", // Indigo
];

export function connectionIdToColor(connectionId) {
  if (connectionId == null || isNaN(connectionId)) return COLORS[0];
  const idx = Math.abs(connectionId) % COLORS.length;
  return COLORS[idx];
}

export function formatRelativeTime(dateString) {
  if (!dateString) return "just now";
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSec = Math.floor((now - date) / 1000);
    if (diffInSec < 60) return "just now";
    const diffInMin = Math.floor(diffInSec / 60);
    if (diffInMin < 60) return `${diffInMin}m ago`;
    const diffInHours = Math.floor(diffInMin / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  } catch {
    return "just now";
  }
}
export function getLayer(layers, layerId) {
  if (!layers) return null;
  return typeof layers.get === "function"
    ? (layers.get(layerId) ?? null)
    : (layers[layerId] ?? null);
}
export function getLayerCount(layers) {
  if (typeof layers?.size === "number") return layers.size;
  if (typeof layers?.toObject === "function") {
    return Object.keys(layers.toObject()).length;
  }
  return Object.keys(layers ?? {}).length;
}
export function resizeBounds(bounds, corner, point) {
  const result = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
  };
  if (corner === Side.Left || (corner & Side.Left) !== 0) {
    result.x = Math.min(point.x, bounds.x + bounds.width);
    result.width = Math.abs(bounds.x + bounds.width - point.x);
  }
  if (corner === Side.Right || (corner & Side.Right) !== 0) {
    result.x = Math.min(point.x, bounds.x);
    result.width = Math.abs(point.x - bounds.x);
  }
  if (corner === Side.Top || (corner & Side.Top) !== 0) {
    result.y = Math.min(point.y, bounds.y + bounds.height);
    result.height = Math.abs(bounds.y + bounds.height - point.y);
  }
  if (corner === Side.Bottom || (corner & Side.Bottom) !== 0) {
    result.y = Math.min(point.y, bounds.y);
    result.height = Math.abs(point.y - bounds.y);
  }
  return result;
}

/* === FEATURE 4: FREEFORM DRAWING === */
export function penPointsToPathPayer(points, color, strokeWidth = 16) {
  let left = Number.POSITIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;
  for (const point of points) {
    const [x, y] = point;
    if (x === undefined || y === undefined) continue;
    if (left > x) {
      left = x;
    }
    if (top > y) {
      top = y;
    }
    if (right < x) {
      right = x;
    }
    if (bottom < y) {
      bottom = y;
    }
  }
  return {
    type: LayerType.Path,
    x: left,
    y: top,
    height: Math.max(bottom - top, 1),
    width: Math.max(right - left, 1),
    fill: color,
    stroke: color,
    strokeWidth,
    opacity: 100,
    points: points
      .filter(
        (point) =>
          point[0] !== undefined &&
          point[1] !== undefined &&
          point[2] !== undefined,
      )
      .map(([x, y, pressure]) => [x - left, y - top, pressure]),
  };
}
export function getSvgPathFromStroke(stroke) {
  if (!stroke.length) return "";
  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const nextPoint = arr[(i + 1) % arr.length];
      if (!nextPoint) return acc;
      const [x1, y1] = nextPoint;
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...(stroke[0] ?? []), "Q"],
  );
  d.push("Z");
  return d.join(" ");
}
export const pointerEventToCanvasPoint = (e, camera) => {
  const zoom = camera?.zoom || 1;
  return {
    x: Math.round((e.clientX - camera.x) / zoom),
    y: Math.round((e.clientY - camera.y) / zoom),
  };
};
export function findIntersectionLayersWithRectangle(layerIds, layers, a, b) {
  const rect = {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(a.x - b.x),
    height: Math.abs(a.y - b.y),
  };
  const ids = [];
  for (const layerId of layerIds) {
    const layer = getLayer(layers, layerId);
    if (layer == null) continue;
    const { x, y, height, width } = layer;
    if (
      rect.x + rect.width > x &&
      rect.x < x + width &&
      rect.y + rect.height > y &&
      rect.y < y + height
    ) {
      ids.push(layerId);
    }
  }
  return ids;
}
export async function exportSvgToPng(svgElement, backgroundColor, fileName) {
  const { width, height } = svgElement.getBoundingClientRect();
  const clone = svgElement.cloneNode(true);
  clone.querySelectorAll("[data-export-ignore], .opacity-0").forEach((node) => {
    node.remove();
  });
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(Math.round(width)));
  clone.setAttribute("height", String(Math.round(height)));
  const background = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "rect",
  );
  background.setAttribute("width", "100%");
  background.setAttribute("height", "100%");
  background.setAttribute("fill", backgroundColor);
  clone.insertBefore(background, clone.firstChild);
  const blob = new Blob([new XMLSerializer().serializeToString(clone)], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * 2));
    canvas.height = Math.max(1, Math.round(height * 2));
    const context = canvas.getContext("2d");
    context.scale(2, 2);
    context.drawImage(image, 0, 0, width, height);
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = fileName;
    link.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}