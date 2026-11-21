/* === FEATURE 1: CREATING DIFFERENT SHAPES === */
/* === FEATURE 2: UPLOADING IMAGES === */
/* === FEATURE 4: FREEFORM DRAWING === */
import { useStorage } from "@liveblocks/react";
import { memo } from "react";
import { LayerType } from "../../types";
import Rectangle from "./Rectangle";
import Ellipse from "./Ellipse";
import Triangle from "./Triangle";
import Star from "./Star";
import Line from "./Line";
import ImageLayer from "./ImageLayer";
import Text from "./Text";
import Path from "./Path";
import { getLayer } from "../../utils";

const LayerComponent = memo(({ id, onLayerPointerDown }) => {
  const layer = useStorage((root) => getLayer(root.layers, id));
  if (!layer) {
    return null;
  }

  switch (layer.type) {
    /* === FEATURE 4: FREEFORM DRAWING === */
    case LayerType.Path:
      return (
        <Path
          id={id}
          layer={layer}
          onPointerDown={onLayerPointerDown}
        />
      );

    /* === FEATURE 1: CREATING DIFFERENT SHAPES === */
    case LayerType.Rectangle:
      return (
        <Rectangle onPointerDown={onLayerPointerDown} id={id} layer={layer} />
      );
    case LayerType.Ellipse:
      return (
        <Ellipse onPointerDown={onLayerPointerDown} id={id} layer={layer} />
      );
    case LayerType.Triangle:
      return (
        <Triangle onPointerDown={onLayerPointerDown} id={id} layer={layer} />
      );
    case LayerType.Star:
      return (
        <Star onPointerDown={onLayerPointerDown} id={id} layer={layer} />
      );
    case LayerType.Line:
      return (
        <Line onPointerDown={onLayerPointerDown} id={id} layer={layer} />
      );

    /* === FEATURE 2: UPLOADING IMAGES === */
    case LayerType.Image:
      return (
        <ImageLayer onPointerDown={onLayerPointerDown} id={id} layer={layer} />
      );

    case LayerType.Text:
      return <Text onPointerDown={onLayerPointerDown} id={id} layer={layer} />;

    default:
      return null;
  }
});

LayerComponent.displayName = "LayerComponent";

export default LayerComponent;
