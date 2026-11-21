/* === FEATURE 1: CREATING DIFFERENT SHAPES === */
/* === FEATURE 2: UPLOADING IMAGES === */
/* === FEATURE 3: CUSTOMIZATION === */
/* === FEATURE 4: FREEFORM DRAWING === */

import {
  useBroadcastEvent,
  useCanRedo,
  useCanUndo,
  useHistory,
  useMutation,
  useSelf,
  useStorage,
} from "@liveblocks/react";
import {
  colorToCss,
  exportSvgToPng,
  findIntersectionLayersWithRectangle,
  getLayerCount,
  penPointsToPathPayer,
  pointerEventToCanvasPoint,
  resizeBounds,
} from "../../utils";
import LayerComponent from "./LayerComponent";
import { CanvasMode, LayerType } from "../../types";
import { nanoid } from "nanoid";
import { LiveObject } from "@liveblocks/client";
import { useCallback, useEffect, useRef, useState } from "react";
import React from "react";
import ToolsBar from "../toolsbar/ToolsBar";
import Path from "./Path";
import SelectionBox from "./SelectionBox";
import useDeleteLayers from "../../hooks/useDeleteLayers";
import SelectionTools from "./SelectionTools";
import Sidebars from "../sidebars/Sidebars";
import MultiplayerGuides from "./MultiplayerGuides";
import CursorChat from "./CursorChat";
import Reactions from "./Reactions";
import ReactionSelector from "./ReactionSelector";
import CommentsOverlay from "./comments/CommentsOverlay";

const MAX_LAYERS = 100;

// Defined standard canvas board dimensions (like Figma / Sketch artboard)
const CANVAS_WIDTH = 1440;
const CANVAS_HEIGHT = 900;

// Helper to center the canvas artboard in the user's viewport
const getCenteredCamera = () => ({
  x: Math.round((window.innerWidth - CANVAS_WIDTH) / 2),
  y: Math.max(60, Math.round((window.innerHeight - CANVAS_HEIGHT) / 2)),
  zoom: 1,
});

// Clamp camera pan and zoom so user cannot scroll infinitely into the void
const clampCamera = (cam, nextX, nextY, nextZoom = cam.zoom) => {
  const margin = 250;
  const minX = -CANVAS_WIDTH * nextZoom + margin;
  const maxX = window.innerWidth - margin;
  const minY = -CANVAS_HEIGHT * nextZoom + margin;
  const maxY = window.innerHeight - margin;

  return {
    ...cam,
    zoom: nextZoom,
    x: Math.min(maxX, Math.max(minX, nextX)),
    y: Math.min(maxY, Math.max(minY, nextY)),
  };
};

export default function Canvas({
  roomName,
  roomId,
  othersWithAccessToRoom,
}) {
  const [leftIsMinimized, setLeftIsMinimized] = useState(false);
  const roomColor = useStorage((root) => root.roomColor);
  const layerIds = useStorage((root) => root.layerIds);
  const pencilDraft = useSelf((me) => me.presence.pencilDraft);
  const deleteLayers = useDeleteLayers();
  const [canvasState, setState] = useState({
    mode: CanvasMode.None,
  });

  // Start with canvas centered on screen
  const [camera, setCamera] = useState(getCenteredCamera);
  const history = useHistory();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  /* === FEATURE 4: FREEFORM DRAWING (Customizable Pen Color and Brush Size) === */
  const [penColor, setPenColor] = useState({ r: 30, g: 30, b: 30 });
  const [penSize, setPenSize] = useState(16);

  /* === COLLABORATIVE FEATURES: Cursor Chat, Reactions, Comments === */
  const [cursorScreen, setCursorScreen] = useState(null);
  const [isCursorChatActive, setIsCursorChatActive] = useState(false);
  const [isReactionsActive, setIsReactionsActive] = useState(false);
  const [selectedReactionEmoji, setSelectedReactionEmoji] = useState("👍");
  const [reactions, setReactions] = useState([]);
  const [draftCommentPoint, setDraftCommentPoint] = useState(null);

  const broadcast = useBroadcastEvent();

  const unresolvedCommentsCount = useStorage((root) => {
    const raw = root.comments;
    if (!raw) return 0;
    if (Array.isArray(raw)) {
      return raw.filter((c) => !c?.resolved).length;
    }
    if (typeof raw.filter === "function") {
      return raw.filter((c) => {
        const res =
          typeof c?.get === "function" ? c.get("resolved") : c?.resolved;
        return !res;
      }).length;
    }
    return 0;
  });

  const fireReaction = useCallback(
    (emoji = selectedReactionEmoji, targetPoint) => {
      const pt =
        targetPoint ||
        (cursorScreen
          ? pointerEventToCanvasPoint(
              { clientX: cursorScreen.x, clientY: cursorScreen.y },
              camera,
            )
          : { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 });

      const reaction = {
        id: nanoid(),
        emoji,
        x: pt.x,
        y: pt.y,
        createdAt: Date.now(),
        offset: (Math.random() - 0.5) * 36,
      };

      broadcast({ type: "REACTION", ...reaction });
      setReactions((prev) => [...prev.slice(-40), reaction]);
    },
    [broadcast, camera, cursorScreen, selectedReactionEmoji],
  );

  const focusOnUser = useCallback(
    (user) => {
      if (user?.cursor) {
        const nextX = Math.round(
          window.innerWidth / 2 - user.cursor.x * camera.zoom,
        );
        const nextY = Math.round(
          window.innerHeight / 2 - user.cursor.y * camera.zoom,
        );
        setCamera((cam) => clampCamera(cam, nextX, nextY, cam.zoom));
      }
    },
    [camera.zoom],
  );

  const selectAllLayers = useMutation(
    ({ setMyPresence }) => {
      if (layerIds) {
        setMyPresence({ selection: [...layerIds] }, { addToHistory: true });
      }
    },
    [layerIds],
  );
  useEffect(() => {
    function onKeyDown(e) {
      const activeElement = document.activeElement;
      const isInputField =
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA");
      if (isInputField) return;
      switch (e.key) {
        case "/":
          e.preventDefault();
          setIsCursorChatActive(true);
          break;
        case "e":
        case "E":
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            setIsReactionsActive((prev) => !prev);
          }
          break;
        case "c":
        case "C":
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            setState((prev) =>
              prev.mode === CanvasMode.Comment
                ? { mode: CanvasMode.None }
                : { mode: CanvasMode.Comment },
            );
          }
          break;
        case "Escape":
          setIsCursorChatActive(false);
          setIsReactionsActive(false);
          setDraftCommentPoint(null);
          setState({ mode: CanvasMode.None });
          break;
        case "Backspace":
        case "Delete":
          deleteLayers();
          break;
        case "z":
          if (e.ctrlKey || e.metaKey) {
            if (e.shiftKey) {
              history.redo();
            } else {
              history.undo();
            }
          }
          break;
        case "a":
          if (e.ctrlKey || e.metaKey) {
            selectAllLayers();
            break;
          }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [deleteLayers, history, selectAllLayers]);
  const onLayerPointerDown = useMutation(
    ({ self, setMyPresence }, e, layerId) => {
      if (
        canvasState.mode === CanvasMode.Pencil ||
        canvasState.mode === CanvasMode.Inserting
      ) {
        return;
      }
      history.pause();
      e.stopPropagation();
      if (!self.presence.selection.includes(layerId)) {
        setMyPresence(
          {
            selection: [layerId],
          },
          { addToHistory: true },
        );
      }
      if (e.nativeEvent.button === 2) {
        setState({ mode: CanvasMode.RightClick });
      } else {
        const point = pointerEventToCanvasPoint(e, camera);
        setState({ mode: CanvasMode.Translating, current: point });
      }
    },
    [camera, canvasState.mode, history],
  );
  const onResizeHandlePointerDown = useCallback(
    (corner, initialBounds) => {
      history.pause();
      setState({
        mode: CanvasMode.Resizing,
        initialBounds,
        corner,
      });
    },
    [history],
  );
  const insertLayer = useMutation(
    ({ storage, setMyPresence }, layerType, position) => {
      const liveLayers = storage.get("layers");
      if (getLayerCount(liveLayers) >= MAX_LAYERS) {
        return;
      }
      const liveLayerIds = storage.get("layerIds");
      const layerId = nanoid();
      let layer = null;
      if (layerType === LayerType.Rectangle) {
        layer = new LiveObject({
          type: LayerType.Rectangle,
          x: position.x,
          y: position.y,
          height: 100,
          width: 100,
          fill: { r: 217, g: 217, b: 217 },
          stroke: { r: 217, g: 217, b: 217 },
          strokeWidth: 1,
          strokeStyle: "solid",
          opacity: 100,
          cornerRadius: 0,
        });
      } else if (layerType === LayerType.Ellipse) {
        layer = new LiveObject({
          type: LayerType.Ellipse,
          x: position.x,
          y: position.y,
          height: 100,
          width: 100,
          fill: { r: 217, g: 217, b: 217 },
          stroke: { r: 217, g: 217, b: 217 },
          strokeWidth: 1,
          strokeStyle: "solid",
          opacity: 100,
        });
      } else if (layerType === LayerType.Triangle) {
        layer = new LiveObject({
          type: LayerType.Triangle,
          x: position.x,
          y: position.y,
          height: 100,
          width: 100,
          fill: { r: 217, g: 217, b: 217 },
          stroke: { r: 217, g: 217, b: 217 },
          strokeWidth: 1,
          strokeStyle: "solid",
          opacity: 100,
        });
      } else if (layerType === LayerType.Star) {
        layer = new LiveObject({
          type: LayerType.Star,
          x: position.x,
          y: position.y,
          height: 100,
          width: 100,
          fill: { r: 217, g: 217, b: 217 },
          stroke: { r: 217, g: 217, b: 217 },
          strokeWidth: 1,
          strokeStyle: "solid",
          opacity: 100,
        });
      } else if (layerType === LayerType.Line) {
        layer = new LiveObject({
          type: LayerType.Line,
          x: position.x,
          y: position.y,
          height: 100,
          width: 100,
          stroke: { r: 217, g: 217, b: 217 },
          strokeWidth: 2,
          strokeStyle: "solid",
          opacity: 100,
        });
      } else if (layerType === LayerType.Text) {
        layer = new LiveObject({
          type: LayerType.Text,
          x: position.x,
          y: position.y,
          height: 100,
          width: 100,
          fontSize: 16,
          text: "Text",
          fontWeight: 400,
          fontFamily: "Inter",
          stroke: { r: 0, g: 0, b: 0 },
          fill: { r: 0, g: 0, b: 0 },
          opacity: 100,
        });
      }
      if (layer) {
        liveLayerIds.push(layerId);
        liveLayers.set(layerId, layer);
        setMyPresence({ selection: [layerId] }, { addToHistory: true });
        setState({ mode: CanvasMode.None });
      }
    },
    [],
  );

  /* === FEATURE 2: UPLOADING IMAGES (Insert Image Layer into Canvas) === */
  const insertImage = useMutation(
    ({ storage, setMyPresence }, { src, width, height, position }) => {
      const liveLayers = storage.get("layers");
      if (getLayerCount(liveLayers) >= MAX_LAYERS) {
        return;
      }

      const liveLayerIds = storage.get("layerIds");
      const layerId = nanoid();

      // Position image at given position or centered in canvas artboard
      const x =
        position?.x ??
        Math.round(CANVAS_WIDTH / 2 - width / 2);
      const y =
        position?.y ??
        Math.round(CANVAS_HEIGHT / 2 - height / 2);

      const layer = new LiveObject({
        type: LayerType.Image,
        x,
        y,
        width,
        height,
        src,
        opacity: 100,
      });

      liveLayerIds.push(layerId);
      liveLayers.set(layerId, layer);

      setMyPresence({ selection: [layerId] }, { addToHistory: true });
      setState({ mode: CanvasMode.None });
    },
    [],
  );

  /* === FEATURE 2: UPLOADING IMAGES (Paste Image from Clipboard) === */
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (!file) continue;

          const reader = new FileReader();
          reader.onload = (event) => {
            const src = event.target?.result;
            if (!src) return;
            const img = new Image();
            img.onload = () => {
              let width = img.naturalWidth || 300;
              let height = img.naturalHeight || 200;
              const maxDim = 400;
              if (width > maxDim || height > maxDim) {
                if (width > height) {
                  height = Math.round((height / width) * maxDim);
                  width = maxDim;
                } else {
                  width = Math.round((width / height) * maxDim);
                  height = maxDim;
                }
              }
              insertImage({ src, width, height });
            };
            img.src = src;
          };
          reader.readAsDataURL(file);
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [insertImage]);

  /* === FEATURE 4: FREEFORM DRAWING (Insert Finished Stroke to LiveLayers) === */
  const insertPath = useMutation(({ storage, self, setMyPresence }) => {
    const liveLayers = storage.get("layers");
    const { pencilDraft } = self.presence;
    if (
      pencilDraft === null ||
      pencilDraft.length < 2 ||
      getLayerCount(liveLayers) >= MAX_LAYERS
    ) {
      setMyPresence({ pencilDraft: null });
      return;
    }
    const id = nanoid();
    liveLayers.set(
      id,
      new LiveObject(
        penPointsToPathPayer(pencilDraft, penColor, penSize),
      ),
    );
    const liveLayerIds = storage.get("layerIds");
    liveLayerIds.push(id);
    setMyPresence({ pencilDraft: null });
    setState({ mode: CanvasMode.Pencil });
  }, [penColor, penSize]);

  const translateSelectedLayers = useMutation(
    ({ storage, self }, point) => {
      if (canvasState.mode !== CanvasMode.Translating) {
        return;
      }
      const offset = {
        x: point.x - canvasState.current.x,
        y: point.y - canvasState.current.y,
      };
      const liveLayers = storage.get("layers");
      for (const id of self.presence.selection) {
        const layer = liveLayers.get(id);
        if (layer) {
          layer.update({
            x: layer.get("x") + offset.x,
            y: layer.get("y") + offset.y,
          });
        }
      }
      setState({ mode: CanvasMode.Translating, current: point });
    },
    [canvasState],
  );
  const resizeSelectedLayer = useMutation(
    ({ storage, self }, point) => {
      if (canvasState.mode !== CanvasMode.Resizing) {
        return;
      }
      const bounds = resizeBounds(
        canvasState.initialBounds,
        canvasState.corner,
        point,
      );
      const liveLayers = storage.get("layers");
      if (self.presence.selection.length > 0) {
        const layer = liveLayers.get(self.presence.selection[0]);
        if (layer) {
          layer.update(bounds);
        }
      }
    },
    [canvasState],
  );
  const clearCanvas = useMutation(({ storage, setMyPresence }) => {
    const liveLayers = storage.get("layers");
    const liveLayerIds = storage.get("layerIds");
    const ids = liveLayerIds.toArray();
    for (let i = ids.length - 1; i >= 0; i--) {
      liveLayerIds.delete(i);
      liveLayers.delete(ids[i]);
    }
    setMyPresence({ selection: [], pencilDraft: null }, { addToHistory: true });
  }, []);
  const exportCanvas = async () => {
    if (!svgRef.current) return;
    const safeName = (roomName || "sketchpad").replace(/[^\w.-]+/g, "_");
    await exportSvgToPng(
      svgRef.current,
      roomColor ? colorToCss(roomColor) : "#1e1e1e",
      `${safeName}.png`,
    );
  };
  const unselectLayers = useMutation(({ self, setMyPresence }) => {
    if (self.presence.selection.length > 0) {
      setMyPresence({ selection: [] }, { addToHistory: true });
    }
  }, []);

  /* === FEATURE 4: FREEFORM DRAWING (Start Freeform Stroke) === */
  const startDrawing = useMutation(({ setMyPresence }, point, pressure) => {
    setMyPresence({
      pencilDraft: [[point.x, point.y, pressure]],
      penColor: penColor,
    });
  }, [penColor]);

  /* === FEATURE 4: FREEFORM DRAWING (Continue Freeform Stroke) === */
  const continueDrawing = useMutation(
    ({ self, setMyPresence }, point, e) => {
      const { pencilDraft } = self.presence;
      if (
        canvasState.mode !== CanvasMode.Pencil ||
        e.buttons !== 1 ||
        pencilDraft === null
      ) {
        return;
      }
      setMyPresence({
        cursor: point,
        pencilDraft: [...pencilDraft, [point.x, point.y, e.pressure]],
      });
    },
    [canvasState.mode],
  );

  // Bounded mouse wheel scrolling and pinch-zooming
  const onWheel = useCallback((e) => {
    // Pinch zoom with trackpad or Ctrl/Cmd + wheel
    if (e.ctrlKey || e.metaKey) {
      const zoomDelta = e.deltaY < 0 ? 1.05 : 0.95;
      setCamera((cam) => {
        const newZoom = Math.min(2.5, Math.max(0.4, Number((cam.zoom * zoomDelta).toFixed(2))));
        return clampCamera(cam, cam.x, cam.y, newZoom);
      });
      return;
    }

    // Normal scroll / pan clamped to canvas bounds
    setCamera((cam) => clampCamera(cam, cam.x - e.deltaX, cam.y - e.deltaY));
  }, []);
  const onPointerDown = useMutation(
    ({}, e) => {
      const point = pointerEventToCanvasPoint(e, camera);

      if (isReactionsActive) {
        fireReaction(selectedReactionEmoji, point);
        return;
      }

      if (canvasState.mode === CanvasMode.Comment) {
        setDraftCommentPoint(point);
        return;
      }

      if (canvasState.mode === CanvasMode.Dragging) {
        setState({ mode: CanvasMode.Dragging, origin: point });
        return;
      }
      if (canvasState.mode === CanvasMode.Inserting) return;
      if (canvasState.mode === CanvasMode.Pencil) {
        startDrawing(point, e.pressure);
        return;
      }
      setState({ origin: point, mode: CanvasMode.Pressing });
    },
    [
      camera,
      canvasState.mode,
      isReactionsActive,
      fireReaction,
      selectedReactionEmoji,
      setState,
      startDrawing,
    ],
  );
  const startMultiSelection = useCallback((current, origin) => {
    if (Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) > 5) {
      setState({ mode: CanvasMode.SelectionNet, origin, current });
    }
  }, []);
  const updateSelectionNet = useMutation(
    ({ storage, setMyPresence }, current, origin) => {
      if (layerIds) {
        const layers = storage.get("layers");
        setState({
          mode: CanvasMode.SelectionNet,
          origin,
          current,
        });
        const ids = findIntersectionLayersWithRectangle(
          layerIds,
          layers,
          origin,
          current,
        );
        setMyPresence({ selection: ids });
      }
    },
    [layerIds],
  );
  const onPointerMove = useMutation(
    ({ setMyPresence }, e) => {
      setCursorScreen({ x: e.clientX, y: e.clientY });
      const point = pointerEventToCanvasPoint(e, camera);
      if (canvasState.mode === CanvasMode.Pressing) {
        startMultiSelection(point, canvasState.origin);
      } else if (canvasState.mode === CanvasMode.SelectionNet) {
        updateSelectionNet(point, canvasState.origin);
      } else if (
        canvasState.mode === CanvasMode.Dragging &&
        canvasState.origin !== null
      ) {
        const deltaX = e.movementX;
        const deltaY = e.movementY;
        setCamera((cam) => clampCamera(cam, cam.x + deltaX, cam.y + deltaY));
      } else if (canvasState.mode === CanvasMode.Translating) {
        translateSelectedLayers(point);
      } else if (canvasState.mode === CanvasMode.Pencil) {
        continueDrawing(point, e);
      } else if (canvasState.mode === CanvasMode.Resizing) {
        resizeSelectedLayer(point);
      }
      setMyPresence({ cursor: point });
    },
    [
      camera,
      canvasState,
      translateSelectedLayers,
      continueDrawing,
      resizeSelectedLayer,
      updateSelectionNet,
      startMultiSelection,
    ],
  );
  const onPointerLeave = useMutation(({ setMyPresence }) => {
    setMyPresence({ cursor: null });
  }, []);
  const onPointerUp = useMutation(
    ({}, e) => {
      if (canvasState.mode === CanvasMode.RightClick) return;
      if (canvasState.mode === CanvasMode.Comment) return;

      const point = pointerEventToCanvasPoint(e, camera);
      if (
        canvasState.mode === CanvasMode.None ||
        canvasState.mode === CanvasMode.Pressing
      ) {
        unselectLayers();
        setState({ mode: CanvasMode.None });
      } else if (canvasState.mode === CanvasMode.Inserting) {
        insertLayer(canvasState.layerType, point);
      } else if (canvasState.mode === CanvasMode.Dragging) {
        setState({ mode: CanvasMode.Dragging, origin: null });
      } else if (canvasState.mode === CanvasMode.Pencil) {
        insertPath();
      } else {
        setState({ mode: CanvasMode.None });
      }
      history.resume();
    },
    [canvasState, setState, insertLayer, unselectLayers, history, insertPath],
  );

  // Reset view to center the canvas at 100% zoom
  const resetView = useCallback(() => {
    setCamera(getCenteredCamera());
  }, []);

  return (
    <div className="flex h-screen w-full relative">
      <main className="fixed left-0 right-0 h-screen overflow-hidden select-none">
        <div
          className={`h-full w-full touch-none bg-[#f1f3f5] ${
            canvasState.mode === CanvasMode.Comment ? "cursor-crosshair" : ""
          }`}
        >
          <SelectionTools camera={camera} canvasMode={canvasState.mode} />
          <svg
            ref={svgRef}
            onWheel={onWheel}
            onPointerUp={onPointerUp}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}
            className="h-full w-full"
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* SVG Definitions for Grid and Drop Shadows */}
            <defs>
              <pattern
                id="workspace-dot-grid"
                width="24"
                height="24"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="12" cy="12" r="1" fill="#cbd5e1" opacity="0.8" />
              </pattern>
              <filter id="canvas-sheet-shadow" x="-3%" y="-3%" width="106%" height="108%">
                <feDropShadow dx="0" dy="6" stdDeviation="12" floodColor="#000000" floodOpacity="0.08" />
              </filter>
            </defs>

            {/* Workspace Desk Background with subtle dot grid */}
            <rect
              x="-10000"
              y="-10000"
              width="20000"
              height="20000"
              fill="#f1f3f5"
            />
            <rect
              x="-10000"
              y="-10000"
              width="20000"
              height="20000"
              fill="url(#workspace-dot-grid)"
            />

            {/* Transformed Canvas Content */}
            <g
              style={{
                transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})`,
              }}
            >
              {/* Defined Canvas Artboard / Sheet */}
              <g filter="url(#canvas-sheet-shadow)">
                <text
                  x={2}
                  y={-10}
                  fill="#64748b"
                  fontSize="12"
                  fontFamily="Inter, sans-serif"
                  fontWeight="500"
                >
                  Canvas (1440 × 900)
                </text>
                <rect
                  x={0}
                  y={0}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  fill={roomColor ? colorToCss(roomColor) : "#ffffff"}
                  stroke="#cbd5e1"
                  strokeWidth="1"
                  rx="6"
                  ry="6"
                />
              </g>

              {/* Rendered Layers */}
              {layerIds?.map((layerId) => (
                <LayerComponent
                  key={layerId}
                  id={layerId}
                  onLayerPointerDown={onLayerPointerDown}
                />
              ))}

              <SelectionBox
                onResizeHandlePointerDown={onResizeHandlePointerDown}
              />

              {canvasState.mode === CanvasMode.SelectionNet &&
                canvasState.current != null && (
                  <rect
                    className="fill-blue-600/5 stroke-blue-600 stroke-[0.5]"
                    x={Math.min(canvasState.origin.x, canvasState.current.x)}
                    y={Math.min(canvasState.origin.y, canvasState.current.y)}
                    width={Math.abs(
                      canvasState.origin.x - canvasState.current.x,
                    )}
                    height={Math.abs(
                      canvasState.origin.y - canvasState.current.y,
                    )}
                  />
                )}

              <MultiplayerGuides />

              {/* === FEATURE 4: FREEFORM DRAWING (Live Draft Path) === */}
              {pencilDraft !== null && pencilDraft?.length > 0 && (
                <Path
                  x={0}
                  y={0}
                  opacity={100}
                  fill={colorToCss(penColor)}
                  strokeWidth={penSize}
                  points={pencilDraft}
                />
              )}
            </g>
          </svg>

          {/* Transformed HTML Overlay for Comments & Floating Reactions */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              style={{
                transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})`,
                transformOrigin: "0 0",
                position: "absolute",
                left: 0,
                top: 0,
                width: "100%",
                height: "100%",
              }}
              className="pointer-events-none"
            >
              {/* Comment Pins & Threads */}
              <CommentsOverlay
                draftPoint={draftCommentPoint}
                setDraftPoint={setDraftCommentPoint}
                filter="all"
              />

              {/* Collaborative Reactions Firework Burst */}
              <Reactions reactions={reactions} setReactions={setReactions} />
            </div>
          </div>
        </div>
      </main>

      {/* Local Cursor Chat Floating Input */}
      <CursorChat
        cursorScreen={cursorScreen}
        isActive={isCursorChatActive}
        onClose={() => setIsCursorChatActive(false)}
      />

      {/* Floating Reaction Selector Bar */}
      {isReactionsActive && (
        <ReactionSelector
          selectedEmoji={selectedReactionEmoji}
          onSelectEmoji={(emoji) => setSelectedReactionEmoji(emoji)}
          onFireReaction={(emoji) => fireReaction(emoji)}
          onClose={() => setIsReactionsActive(false)}
        />
      )}

      {/* Toolbar with Shapes, Image Upload, Pencil, and Zoom Controls */}
      <ToolsBar
        canvasState={canvasState}
        setCanvasState={(newState) => setState(newState)}
        zoom={camera.zoom}
        resetView={resetView}
        zoomIn={() => {
          setCamera((cam) =>
            clampCamera(
              cam,
              cam.x,
              cam.y,
              Math.min(2.5, Number((cam.zoom + 0.1).toFixed(2))),
            ),
          );
        }}
        zoomOut={() => {
          setCamera((cam) =>
            clampCamera(
              cam,
              cam.x,
              cam.y,
              Math.max(0.4, Number((cam.zoom - 0.1).toFixed(2))),
            ),
          );
        }}
        canZoomIn={camera.zoom < 2.5}
        canZoomOut={camera.zoom > 0.4}
        redo={() => history.redo()}
        undo={() => history.undo()}
        canRedo={canRedo}
        canUndo={canUndo}
        onInsertImage={insertImage}
        penColor={penColor}
        setPenColor={setPenColor}
        penSize={penSize}
        setPenSize={setPenSize}
        isCursorChatActive={isCursorChatActive}
        setIsCursorChatActive={setIsCursorChatActive}
        isReactionsActive={isReactionsActive}
        setIsReactionsActive={setIsReactionsActive}
        unresolvedCommentsCount={unresolvedCommentsCount}
      />

      <Sidebars
        roomName={roomName}
        roomId={roomId}
        othersWithAccessToRoom={othersWithAccessToRoom}
        leftIsMinimized={leftIsMinimized}
        setLeftIsMinimized={setLeftIsMinimized}
        onFocusUser={focusOnUser}
      />
    </div>
  );
}