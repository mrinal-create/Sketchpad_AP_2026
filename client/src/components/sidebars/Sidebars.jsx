/* === FEATURE 1: CREATING DIFFERENT SHAPES === */
/* === FEATURE 2: UPLOADING IMAGES === */
/* === FEATURE 3: CUSTOMIZATION === */
/* === FEATURE 4: FREEFORM DRAWING === */

import { useMutation, useOthers, useSelf, useStorage } from "@liveblocks/react";
import { Link } from "react-router";
import { AiOutlineFontSize } from "react-icons/ai";
import { IoEllipseOutline, IoSquareOutline, IoTriangleOutline, IoStarOutline } from "react-icons/io5";
import { PiPathLight, PiSidebarSimpleThin } from "react-icons/pi";
import { BsCircleHalf, BsSlashLg, BsImage } from "react-icons/bs";
import { RiRoundedCorner } from "react-icons/ri";
import { LayerType } from "../../types";
import {
  colorToCss,
  connectionIdToColor,
  getLayer,
  hexToRgb,
} from "../../utils";
import LayerButton from "./LayerButton";
import NumberInput from "./NumberInput";
import ColorPicker from "./ColorPicker";
import Dropdown from "./Dropdown";
import UserAvatar from "./UserAvatar";
import ShareMenu from "./ShareMenu";
import ActiveUsers from "../canvas/ActiveUsers";

export default function Sidebars({
  roomName,
  roomId,
  othersWithAccessToRoom,
  leftIsMinimized,
  setLeftIsMinimized,
  onFocusUser,
}) {
  const me = useSelf();
  const others = useOthers();

  const selectedLayer = useSelf((me) => {
    const selection = me.presence.selection;
    return selection.length === 1 ? selection[0] : null;
  });

  const layer = useStorage((root) => {
    if (!selectedLayer) {
      return null;
    }
    return getLayer(root.layers, selectedLayer);
  });

  const roomColor = useStorage((root) => root.roomColor);

  const layers = useStorage((root) => root.layers);
  const layerIds = useStorage((root) => root.layerIds);
  const reversedLayerIds = [...(layerIds ?? [])].reverse();

  const selection = useSelf((me) => me.presence.selection);

  /* === FEATURE 3: CUSTOMIZATION (Canvas Background Color) === */
  const setRoomColor = useMutation(({ storage }, newColor) => {
    storage.set("roomColor", newColor);
  }, []);

  /* === FEATURE 3: CUSTOMIZATION (Update Any Layer Property Reactively) === */
  const updateLayer = useMutation(
    ({ storage }, updates) => {
      if (!selectedLayer) return;

      const liveLayers = storage.get("layers");
      const layer = liveLayers.get(selectedLayer);

      if (layer) {
        layer.update({
          ...(updates.x !== undefined && { x: updates.x }),
          ...(updates.y !== undefined && { y: updates.y }),
          ...(updates.width !== undefined && { width: updates.width }),
          ...(updates.height !== undefined && { height: updates.height }),
          ...(updates.opacity !== undefined && { opacity: updates.opacity }),
          ...(updates.cornerRadius !== undefined && {
            cornerRadius: updates.cornerRadius,
          }),
          ...(updates.strokeWidth !== undefined && {
            strokeWidth: updates.strokeWidth,
          }),
          ...(updates.strokeStyle !== undefined && {
            strokeStyle: updates.strokeStyle,
          }),
          ...(updates.fill !== undefined && { fill: hexToRgb(updates.fill) }),
          ...(updates.stroke !== undefined && {
            stroke: hexToRgb(updates.stroke),
          }),
          ...(updates.fontSize !== undefined && { fontSize: updates.fontSize }),
          ...(updates.fontWeight !== undefined && {
            fontWeight: updates.fontWeight,
          }),
          ...(updates.fontFamily !== undefined && {
            fontFamily: updates.fontFamily,
          }),
        });
      }
    },
    [selectedLayer],
  );

  return (
    <>
      {/* Left Sidebar: Layers Panel */}
      {!leftIsMinimized ? (
        <div className="fixed left-0 z-20 flex h-screen w-[240px] flex-col border-r border-gray-200 bg-white">
          <div className="p-4">
            <div className="flex justify-between">
              <Link to="/dashboard">
                <img
                  src="/figma-logo.svg"
                  alt="Figma logo"
                  className="h-[18px] w-[18px]"
                />
              </Link>
              <PiSidebarSimpleThin
                onClick={() => setLeftIsMinimized(true)}
                className="h-5 w-5 cursor-pointer text-gray-600 hover:text-black"
              />
            </div>
            <h2 className="mt-2 scroll-m-20 text-[13px] font-medium">
              {roomName}
            </h2>
          </div>
          <div className="border-b border-gray-200" />
          <div className="flex flex-col gap-1 p-4 overflow-y-auto">
            <span className="mb-2 text-[11px] font-medium text-gray-500">Layers</span>
            {layerIds &&
              reversedLayerIds.map((id) => {
                const layer = getLayer(layers, id);
                const isSelected = selection?.includes(id);

                /* === FEATURE 1: CREATING DIFFERENT SHAPES (Layer representation in left panel) === */
                if (layer?.type === LayerType.Rectangle) {
                  return (
                    <LayerButton
                      key={id}
                      layerId={id}
                      text="Rectangle"
                      isSelected={isSelected ?? false}
                      icon={<IoSquareOutline className="h-3 w-3 text-gray-500" />}
                    />
                  );
                } else if (layer?.type === LayerType.Ellipse) {
                  return (
                    <LayerButton
                      key={id}
                      layerId={id}
                      text="Ellipse"
                      isSelected={isSelected ?? false}
                      icon={<IoEllipseOutline className="h-3 w-3 text-gray-500" />}
                    />
                  );
                } else if (layer?.type === LayerType.Triangle) {
                  return (
                    <LayerButton
                      key={id}
                      layerId={id}
                      text="Triangle"
                      isSelected={isSelected ?? false}
                      icon={<IoTriangleOutline className="h-3 w-3 text-gray-500" />}
                    />
                  );
                } else if (layer?.type === LayerType.Star) {
                  return (
                    <LayerButton
                      key={id}
                      layerId={id}
                      text="Star"
                      isSelected={isSelected ?? false}
                      icon={<IoStarOutline className="h-3 w-3 text-gray-500" />}
                    />
                  );
                } else if (layer?.type === LayerType.Line) {
                  return (
                    <LayerButton
                      key={id}
                      layerId={id}
                      text="Line"
                      isSelected={isSelected ?? false}
                      icon={<BsSlashLg className="h-3 w-3 text-gray-500" />}
                    />
                  );
                }

                /* === FEATURE 2: UPLOADING IMAGES (Image layer item) === */
                else if (layer?.type === LayerType.Image) {
                  return (
                    <LayerButton
                      key={id}
                      layerId={id}
                      text="Image"
                      isSelected={isSelected ?? false}
                      icon={<BsImage className="h-3 w-3 text-gray-500" />}
                    />
                  );
                }

                /* === FEATURE 4: FREEFORM DRAWING (Drawing layer item) === */
                else if (layer?.type === LayerType.Path) {
                  return (
                    <LayerButton
                      key={id}
                      layerId={id}
                      text="Drawing"
                      isSelected={isSelected ?? false}
                      icon={<PiPathLight className="h-3 w-3 text-gray-500" />}
                    />
                  );
                } else if (layer?.type === LayerType.Text) {
                  return (
                    <LayerButton
                      key={id}
                      layerId={id}
                      text="Text"
                      isSelected={isSelected ?? false}
                      icon={<AiOutlineFontSize className="h-3 w-3 text-gray-500" />}
                    />
                  );
                }
                return null;
              })}
          </div>
        </div>
      ) : (
        <div className="fixed left-3 top-3 z-20 flex h-[48px] w-[250px] items-center justify-between rounded-xl border bg-white p-4">
          <Link to="/dashboard">
            <img
              src="/figma-logo.svg"
              alt="Figma logo"
              className="h-[18px] w-[18px]"
            />
          </Link>
          <h2 className="scroll-m-20 text-[13px] font-medium">{roomName}</h2>
          <PiSidebarSimpleThin
            onClick={() => setLeftIsMinimized(false)}
            className="h-5 w-5 cursor-pointer text-gray-600 hover:text-black"
          />
        </div>
      )}

      {/* Right Sidebar: Properties Customization Panel */}
      {!leftIsMinimized || layer ? (
        <div
          className={`fixed ${leftIsMinimized && layer ? "bottom-3 right-3 top-3 rounded-xl" : ""} ${!leftIsMinimized && !layer ? "h-screen" : ""} ${!leftIsMinimized && layer ? "bottom-0 top-0 h-screen" : ""} right-0 z-20 flex w-[240px] flex-col border-l border-gray-200 bg-white overflow-y-auto`}
        >
          {/* Header & Avatars */}
          <div className="flex items-center justify-between p-3 gap-2">
            <ActiveUsers onFocusUser={onFocusUser} />
            <ShareMenu
              roomId={roomId}
              othersWithAccessToRoom={othersWithAccessToRoom}
            />
          </div>
          <div className="border-b border-gray-200"></div>

          {/* === FEATURE 3: CUSTOMIZATION (Layer Customization Properties) === */}
          {layer ? (
            <>
              {/* Position (X, Y) */}
              <div className="flex flex-col gap-2 p-4">
                <span className="mb-2 text-[11px] font-medium">Position</span>
                <div className="flex flex-col gap-1">
                  <p className="text-[9px] font-medium text-gray-500">Position</p>
                  <div className="flex w-full gap-2">
                    <NumberInput
                      value={layer.x}
                      onChange={(number) => {
                        updateLayer({ x: number });
                      }}
                      classNames="w-1/2"
                      icon={<p>X</p>}
                    />
                    <NumberInput
                      value={layer.y}
                      onChange={(number) => {
                        updateLayer({ y: number });
                      }}
                      classNames="w-1/2"
                      icon={<p>Y</p>}
                    />
                  </div>
                </div>
              </div>

              {/* Dimensions (W, H) - Applicable to all except freeform Path */}
              {layer.type !== LayerType.Path && (
                <>
                  <div className="border-b border-gray-200"></div>
                  <div className="flex flex-col gap-2 p-4">
                    <span className="mb-2 text-[11px] font-medium">Layout</span>
                    <div className="flex flex-col gap-1">
                      <p className="text-[9px] font-medium text-gray-500">Dimensions</p>
                      <div className="flex w-full gap-2">
                        <NumberInput
                          value={layer.width}
                          onChange={(number) => {
                            updateLayer({ width: number });
                          }}
                          classNames="w-1/2"
                          icon={<p>W</p>}
                        />
                        <NumberInput
                          value={layer.height}
                          onChange={(number) => {
                            updateLayer({ height: number });
                          }}
                          classNames="w-1/2"
                          icon={<p>H</p>}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Appearance: Opacity & Corner Radius */}
              <div className="border-b border-gray-200"></div>
              <div className="flex flex-col gap-2 p-4">
                <span className="mb-2 text-[11px] font-medium">Appearance</span>
                <div className="flex w-full gap-2">
                  <div className="flex w-1/2 flex-col gap-1">
                    <p className="text-[9px] font-medium text-gray-500">Opacity</p>
                    <NumberInput
                      value={layer.opacity ?? 100}
                      min={0}
                      max={100}
                      onChange={(number) => {
                        updateLayer({ opacity: number });
                      }}
                      classNames="w-full"
                      icon={<BsCircleHalf />}
                    />
                  </div>
                  {layer.type === LayerType.Rectangle && (
                    <div className="flex w-1/2 flex-col gap-1">
                      <p className="text-[9px] font-medium text-gray-500">Corner radius</p>
                      <NumberInput
                        value={layer.cornerRadius ?? 0}
                        min={0}
                        max={100}
                        onChange={(number) => {
                          updateLayer({ cornerRadius: number });
                        }}
                        classNames="w-full"
                        icon={<RiRoundedCorner />}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* === FEATURE 4: FREEFORM DRAWING (Customization for Path Brush Thickness) === */}
              {layer.type === LayerType.Path && (
                <>
                  <div className="border-b border-gray-200"></div>
                  <div className="flex flex-col gap-2 p-4">
                    <span className="mb-2 text-[11px] font-medium">Brush Settings</span>
                    <div className="flex flex-col gap-1">
                      <p className="text-[9px] font-medium text-gray-500">Stroke Size</p>
                      <NumberInput
                        value={layer.strokeWidth ?? 16}
                        min={1}
                        max={64}
                        onChange={(number) => updateLayer({ strokeWidth: number })}
                        classNames="w-full"
                        icon={<p className="text-xs">px</p>}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* === FEATURE 3: CUSTOMIZATION (Fill Color) === */}
              {layer.type !== LayerType.Image && layer.type !== LayerType.Line && (
                <>
                  <div className="border-b border-gray-200" />
                  <div className="flex flex-col gap-2 p-4">
                    <span className="mb-2 text-[11px] font-medium">
                      {layer.type === LayerType.Path ? "Color" : "Fill"}
                    </span>
                    <ColorPicker
                      value={layer.fill ? colorToCss(layer.fill) : "#CCC"}
                      onChange={(color) => {
                        updateLayer({ fill: color, stroke: color });
                      }}
                    />
                  </div>
                </>
              )}

              {/* === FEATURE 3: CUSTOMIZATION (Stroke Color, Width & Style) === */}
              {layer.type !== LayerType.Image && (
                <>
                  <div className="border-b border-gray-200" />
                  <div className="flex flex-col gap-2 p-4">
                    <span className="mb-2 text-[11px] font-medium">Stroke</span>
                    <ColorPicker
                      value={layer.stroke ? colorToCss(layer.stroke) : "#CCC"}
                      onChange={(color) => {
                        updateLayer({ stroke: color });
                      }}
                    />

                    {layer.type !== LayerType.Path && (
                      <div className="mt-2 flex w-full gap-2">
                        <div className="flex w-1/2 flex-col gap-1">
                          <p className="text-[9px] font-medium text-gray-500">Width</p>
                          <NumberInput
                            value={layer.strokeWidth ?? 1}
                            min={0}
                            max={50}
                            onChange={(number) => updateLayer({ strokeWidth: number })}
                            classNames="w-full"
                            icon={<p className="text-xs">W</p>}
                          />
                        </div>
                        <div className="flex w-1/2 flex-col gap-1">
                          <p className="text-[9px] font-medium text-gray-500">Style</p>
                          <Dropdown
                            value={layer.strokeStyle ?? "solid"}
                            onChange={(val) => updateLayer({ strokeStyle: val })}
                            options={["solid", "dashed"]}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Typography for Text layer */}
              {layer.type === LayerType.Text && (
                <>
                  <div className="border-b border-gray-200" />
                  <div className="flex flex-col gap-2 p-4">
                    <span className="mb-2 text-[11px] font-medium">Typography</span>
                    <div className="flex flex-col gap-2">
                      <Dropdown
                        value={layer.fontFamily}
                        onChange={(value) => {
                          updateLayer({ fontFamily: value });
                        }}
                        options={["Inter", "Arial", "Times New Roman"]}
                      />
                      <div className="flex w-full gap-2">
                        <div className="flex w-full flex-col gap-1">
                          <p className="text-[9px] font-medium text-gray-500">Size</p>
                          <NumberInput
                            value={layer.fontSize}
                            onChange={(number) => {
                              updateLayer({ fontSize: number });
                            }}
                            classNames="w-full"
                            icon={<p>W</p>}
                          />
                        </div>
                        <div className="flex w-full flex-col gap-1">
                          <p className="text-[9px] font-medium text-gray-500">Weight</p>
                          <Dropdown
                            value={layer.fontWeight.toString()}
                            onChange={(value) => {
                              updateLayer({ fontWeight: Number(value) });
                            }}
                            options={[
                              "100",
                              "200",
                              "300",
                              "400",
                              "500",
                              "600",
                              "700",
                              "800",
                              "900",
                            ]}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            /* === FEATURE 3: CUSTOMIZATION (Page Background Color) === */
            <div className="flex flex-col gap-2 p-4">
              <span className="mb-2 text-[11px] font-medium">Page</span>
              <ColorPicker
                onChange={(color) => {
                  const rgbColor = hexToRgb(color);
                  setRoomColor(rgbColor);
                }}
                value={roomColor ? colorToCss(roomColor) : "#1e1e1e"}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="fixed right-3 top-3 z-20 flex h-[48px] min-w-[250px] items-center justify-between rounded-xl border border-gray-200 bg-white px-3 shadow-sm gap-3">
          <ActiveUsers onFocusUser={onFocusUser} />
          <ShareMenu
            roomId={roomId}
            othersWithAccessToRoom={othersWithAccessToRoom}
          />
        </div>
      )}
    </>
  );
}
