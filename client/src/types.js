/* === FEATURE 1: CREATING DIFFERENT SHAPES === */
/* === FEATURE 2: UPLOADING IMAGES === */
/* === FEATURE 3: CUSTOMIZATION === */
/* === FEATURE 4: FREEFORM DRAWING === */

export const LayerType = Object.freeze({
  Rectangle: 0,
  Ellipse: 1,
  Path: 2,       // Freeform Drawing
  Text: 3,
  Triangle: 4,   // Additional Shape
  Star: 5,       // Additional Shape
  Line: 6,       // Additional Shape
  Image: 7,      // Uploaded Image Layer
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
  Comment: 9,
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

/* === FEATURE 1: CREATING DIFFERENT SHAPES (Shape Factory Functions) === */
export const createRectangleLayer = ({
  x,
  y,
  width = 100,
  height = 100,
  fill = createColor(217, 217, 217),
  stroke = createColor(217, 217, 217),
  strokeWidth = 1,
  strokeStyle = "solid",
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
  strokeWidth,
  strokeStyle,
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
  strokeWidth = 1,
  strokeStyle = "solid",
  opacity = 100,
}) => ({
  type: LayerType.Ellipse,
  x,
  y,
  width,
  height,
  fill,
  stroke,
  strokeWidth,
  strokeStyle,
  opacity,
});

export const createTriangleLayer = ({
  x,
  y,
  width = 100,
  height = 100,
  fill = createColor(217, 217, 217),
  stroke = createColor(217, 217, 217),
  strokeWidth = 1,
  strokeStyle = "solid",
  opacity = 100,
}) => ({
  type: LayerType.Triangle,
  x,
  y,
  width,
  height,
  fill,
  stroke,
  strokeWidth,
  strokeStyle,
  opacity,
});

export const createStarLayer = ({
  x,
  y,
  width = 100,
  height = 100,
  fill = createColor(217, 217, 217),
  stroke = createColor(217, 217, 217),
  strokeWidth = 1,
  strokeStyle = "solid",
  opacity = 100,
}) => ({
  type: LayerType.Star,
  x,
  y,
  width,
  height,
  fill,
  stroke,
  strokeWidth,
  strokeStyle,
  opacity,
});

export const createLineLayer = ({
  x,
  y,
  width = 100,
  height = 100,
  stroke = createColor(217, 217, 217),
  strokeWidth = 2,
  strokeStyle = "solid",
  opacity = 100,
}) => ({
  type: LayerType.Line,
  x,
  y,
  width,
  height,
  stroke,
  strokeWidth,
  strokeStyle,
  opacity,
});

/* === FEATURE 2: UPLOADING IMAGES (Image Layer Factory) === */
export const createImageLayer = ({
  x,
  y,
  width = 300,
  height = 200,
  src,
  opacity = 100,
}) => ({
  type: LayerType.Image,
  x,
  y,
  width,
  height,
  src,
  opacity,
});

/* === FEATURE 4: FREEFORM DRAWING (Path Layer Factory) === */
export const createPathLayer = ({
  x,
  y,
  width,
  height,
  points,
  fill = createColor(0, 0, 0),
  stroke = createColor(0, 0, 0),
  strokeWidth = 16,
  opacity = 100,
}) => ({
  type: LayerType.Path,
  x,
  y,
  width,
  height,
  fill,
  stroke,
  strokeWidth,
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
