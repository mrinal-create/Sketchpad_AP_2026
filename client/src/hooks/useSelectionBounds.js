import { shallow, useSelf, useStorage } from "@liveblocks/react";
import { getLayer } from "../utils";

function boundingBox(layers) {
  const validLayers = layers.filter(
    (layer) =>
      Number.isFinite(layer?.x) &&
      Number.isFinite(layer?.y) &&
      Number.isFinite(layer?.width) &&
      Number.isFinite(layer?.height),
  );
  const first = validLayers[0];
  if (!first) return null;

  let left = first.x;
  let right = first.x + first.width;
  let top = first.y;
  let bottom = first.y + first.height;

  for (let i = 1; i < validLayers.length; i++) {
    const { x, y, width, height } = validLayers[i];
    if (left > x) {
      left = x;
    }
    if (right < x + width) {
      right = x + width;
    }
    if (top > y) {
      top = y;
    }
    if (bottom < y + height) {
      bottom = y + height;
    }
  }

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
}

export default function useSelectionBounds() {
  const selection = useSelf((me) => me.presence.selection);
  return useStorage((root) => {
    const selectedLayers = selection
      ?.map((layerId) => getLayer(root.layers, layerId))
      .filter(Boolean);

    return boundingBox(selectedLayers ?? []);
  }, shallow);
}
