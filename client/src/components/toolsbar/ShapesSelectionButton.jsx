/* === FEATURE 1: CREATING DIFFERENT SHAPES (Shapes Selector Button & Dropdown) === */
import { useState, useRef, useEffect } from "react";
import { CanvasMode, LayerType } from "../../types";
import IconButton from "./IconButton";
import { IoEllipseOutline, IoSquareOutline, IoTriangleOutline, IoStarOutline } from "react-icons/io5";
import { BsSlashLg } from "react-icons/bs";

export default function ShapesSelectionButton({
  isActive,
  canvasState,
  onClick,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedShape, setSelectedShape] = useState(LayerType.Rectangle);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClick = (layerType) => {
    setSelectedShape(layerType);
    onClick(layerType);
    setIsOpen(false);
  };

  // Render current shape icon
  const renderCurrentIcon = () => {
    const shape = canvasState.mode === CanvasMode.Inserting ? canvasState.layerType : selectedShape;
    switch (shape) {
      case LayerType.Ellipse:
        return <IoEllipseOutline className="h-5 w-5" />;
      case LayerType.Triangle:
        return <IoTriangleOutline className="h-5 w-5" />;
      case LayerType.Star:
        return <IoStarOutline className="h-5 w-5" />;
      case LayerType.Line:
        return <BsSlashLg className="h-5 w-5" />;
      case LayerType.Rectangle:
      default:
        return <IoSquareOutline className="h-5 w-5" />;
    }
  };

  return (
    <div className="relative flex" ref={menuRef}>
      <IconButton
        isActive={isActive}
        onClick={() => onClick(selectedShape)}
      >
        {renderCurrentIcon()}
      </IconButton>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="ml-1 rotate-180 p-1 text-gray-600 hover:text-black"
        title="More shapes"
      >
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path
            d="M3.646 6.354l-3-3 .708-.708L4 5.293l2.646-2.647.708.708-3 3L4 6.707l-.354-.353z"
            fill="currentColor"
          />
        </svg>
      </button>

      {/* Shapes Dropdown Menu */}
      {isOpen && (
        <div className="absolute -top-52 mt-1 min-w-[160px] rounded-xl bg-[#1e1e1e] p-2 shadow-xl z-50">
          {/* Rectangle */}
          <button
            className={`flex w-full items-center rounded-md p-1.5 text-white hover:bg-blue-500 ${
              canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Rectangle ? "bg-blue-500" : ""
            }`}
            onClick={() => handleClick(LayerType.Rectangle)}
          >
            <span className="w-4 text-xs">
              {canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Rectangle ? "✓" : ""}
            </span>
            <IoSquareOutline className="mr-2 h-4 w-4" />
            <span className="text-xs">Rectangle</span>
          </button>

          {/* Ellipse / Circle */}
          <button
            className={`flex w-full items-center rounded-md p-1.5 text-white hover:bg-blue-500 ${
              canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Ellipse ? "bg-blue-500" : ""
            }`}
            onClick={() => handleClick(LayerType.Ellipse)}
          >
            <span className="w-4 text-xs">
              {canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Ellipse ? "✓" : ""}
            </span>
            <IoEllipseOutline className="mr-2 h-4 w-4" />
            <span className="text-xs">Ellipse</span>
          </button>

          {/* Triangle */}
          <button
            className={`flex w-full items-center rounded-md p-1.5 text-white hover:bg-blue-500 ${
              canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Triangle ? "bg-blue-500" : ""
            }`}
            onClick={() => handleClick(LayerType.Triangle)}
          >
            <span className="w-4 text-xs">
              {canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Triangle ? "✓" : ""}
            </span>
            <IoTriangleOutline className="mr-2 h-4 w-4" />
            <span className="text-xs">Triangle</span>
          </button>

          {/* Star */}
          <button
            className={`flex w-full items-center rounded-md p-1.5 text-white hover:bg-blue-500 ${
              canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Star ? "bg-blue-500" : ""
            }`}
            onClick={() => handleClick(LayerType.Star)}
          >
            <span className="w-4 text-xs">
              {canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Star ? "✓" : ""}
            </span>
            <IoStarOutline className="mr-2 h-4 w-4" />
            <span className="text-xs">Star</span>
          </button>

          {/* Line */}
          <button
            className={`flex w-full items-center rounded-md p-1.5 text-white hover:bg-blue-500 ${
              canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Line ? "bg-blue-500" : ""
            }`}
            onClick={() => handleClick(LayerType.Line)}
          >
            <span className="w-4 text-xs">
              {canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Line ? "✓" : ""}
            </span>
            <BsSlashLg className="mr-2 h-4 w-4" />
            <span className="text-xs">Line</span>
          </button>
        </div>
      )}
    </div>
  );
}
