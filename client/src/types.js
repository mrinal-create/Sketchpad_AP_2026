export const LayerType = Object.freeze({
  Rectangle: 0,
  Ellipse: 1,
  Path: 2,
  Text: 3,
});

export const Side = Object.freeze({
  Top: 1,
  Bottom: 2,
  Left: 4,
  Right: 8,
});

export const CanvasMode = Object.freeze({
  None: 0,
  Dragging: 1,
  Inserting: 2,
  Pencil: 3,
  Resizing: 4,
  Translating: 5,
  SelectionNet: 6,
  Pressing: 7,
  RightClick: 8,
});

// Factory helpers for creating plain objects with default shapes
export const createColor = (r = 0, g = 0, b = 0) => ({ r, g, b });

export const createCamera = (x = 0, y = 0, zoom = 1) => ({ x, y, zoom });

export const createPoint = (x = 0, y = 0) => ({ x, y });

export const createXYWH = (x = 0, y = 0, width = 0, height = 0) => ({
  x,
  y,
  width,
  height,
});

export const createRectangleLayer = ({
  x,
  y,
  width = 100,
  height = 100,
  fill = createColor(217, 217, 217),
  stroke = createColor(217, 217, 217),
  opacity = 100,
  cornerRadius = 0,
}) => ({
  type: LayerType.Rectangle,
  x,
  y,
  width,
  height,
  fill,
  stroke,
  opacity,
  cornerRadius,
});

export const createEllipseLayer = ({
  x,
  y,
  width = 100,
  height = 100,
  fill = createColor(217, 217, 217),
  stroke = createColor(217, 217, 217),
  opacity = 100,
}) => ({
  type: LayerType.Ellipse,
  x,
  y,
  width,
  height,
  fill,
  stroke,
  opacity,
});

export const createPathLayer = ({
  x,
  y,
  width,
  height,
  points,
  fill = createColor(0, 0, 0),
  stroke = createColor(0, 0, 0),
  opacity = 100,
}) => ({
  type: LayerType.Path,
  x,
  y,
  width,
  height,
  fill,
  stroke,
  opacity,
  points,
});

export const createTextLayer = ({
  x,
  y,
  width = 100,
  height = 100,
  text = "Text",
  fontSize = 16,
  fontWeight = 400,
  fontFamily = "Inter",
  fill = createColor(0, 0, 0),
  stroke = createColor(0, 0, 0),
  opacity = 100,
}) => ({
  type: LayerType.Text,
  x,
  y,
  width,
  height,
  text,
  fontSize,
  fontWeight,
  fontFamily,
  fill,
  stroke,
  opacity,
});
