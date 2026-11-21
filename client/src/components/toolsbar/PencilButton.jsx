/* === FEATURE 4: FREEFORM DRAWING (Pencil Button & Brush Settings Popover) === */
import { useState, useRef, useEffect } from "react";
import IconButton from "./IconButton";
import { colorToCss } from "../../utils";

const PRESET_PEN_COLORS = [
  { r: 30, g: 30, b: 30 },     // Black/Dark
  { r: 239, g: 68, b: 68 },    // Red
  { r: 59, g: 130, b: 246 },   // Blue
  { r: 16, g: 185, b: 129 },   // Green
  { r: 168, g: 85, b: 247 },   // Purple
  { r: 245, g: 158, b: 11 },   // Amber
  { r: 255, g: 255, b: 255 },  // White
];

const PRESET_PEN_SIZES = [
  { label: "Fine", size: 4 },
  { label: "Medium", size: 10 },
  { label: "Thick", size: 18 },
  { label: "Marker", size: 28 },
];

export default function PencilButton({
  isActive,
  onClick,
  penColor,
  setPenColor,
  penSize,
  setPenSize,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative flex items-center" ref={menuRef}>
      <IconButton
        isActive={isActive}
        onClick={() => {
          onClick();
        }}
      >
        {/* Pencil icon with active color indicator */}
        <div className="relative flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 36 36" fill="none">
            <path
              d="M22.8538 10.1464C22.76 10.0527 22.6329 10 22.5003 10C22.3677 10 22.2406 10.0527 22.1468 10.1464L20.4998 11.7934L24.2068 15.5004L25.8538 13.8544C25.9004 13.8079 25.9373 13.7528 25.9625 13.692C25.9877 13.6313 26.0007 13.5662 26.0007 13.5004C26.0007 13.4346 25.9877 13.3695 25.9625 13.3088C25.9373 13.248 25.9004 13.1928 25.8538 13.1464L22.8538 10.1464ZM23.4998 16.2074L19.7928 12.5004L13.2928 19.0004H13.4998C13.6324 19.0004 13.7596 19.0531 13.8534 19.1468C13.9471 19.2406 13.9998 19.3678 13.9998 19.5004V20.0004H14.4998C14.6324 20.0004 14.7596 20.0531 14.8534 20.1468C14.9471 20.2406 14.9998 20.3678 14.9998 20.5004V21.0004H15.4998C15.6324 21.0004 15.7596 21.0531 15.8534 21.1468C15.9471 21.2406 15.9998 21.3678 15.9998 21.5004V22.0004H16.4998C16.6324 22.0004 16.7596 22.0531 16.8534 22.1468C16.9471 22.2406 16.9998 22.3678 16.9998 22.5004V22.7074L23.4998 16.2074ZM16.0318 23.6754C16.0108 23.6194 15.9999 23.5602 15.9998 23.5004V23.0004H15.4998C15.3672 23.0004 15.24 22.9477 15.1463 22.8539C15.0525 22.7602 14.9998 22.633 14.9998 22.5004V22.0004H14.4998C14.3672 22.0004 14.24 21.9477 14.1463 21.8539C14.0525 21.7602 13.9998 21.633 13.9998 21.5004V21.0004H13.4998C13.3672 21.0004 13.24 20.9477 13.1463 20.8539C13.0525 20.7602 12.9998 20.633 12.9998 20.5004V20.0004H12.4998C12.44 20.0003 12.3808 19.9895 12.3248 19.9684L12.1458 20.1464C12.0982 20.1944 12.0607 20.2515 12.0358 20.3144L10.0358 25.3144C9.99944 25.4053 9.99053 25.5048 10.0102 25.6007C10.0299 25.6966 10.0772 25.7845 10.1464 25.8538C10.2157 25.923 10.3036 25.9703 10.3995 25.99C10.4954 26.0097 10.5949 26.0008 10.6858 25.9644L15.6858 23.9644C15.7487 23.9395 15.8058 23.902 15.8538 23.8544L16.0318 23.6764V23.6754Z"
              fill="currentColor"
            />
          </svg>
          <span
            className="absolute -bottom-1 -right-1 h-2 w-2 rounded-full border border-white"
            style={{ backgroundColor: penColor ? colorToCss(penColor) : "#1e1e1e" }}
          />
        </div>
      </IconButton>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="ml-0.5 rotate-180 p-1 text-gray-600 hover:text-black"
        title="Pencil stroke options"
      >
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path
            d="M3.646 6.354l-3-3 .708-.708L4 5.293l2.646-2.647.708.708-3 3L4 6.707l-.354-.353z"
            fill="currentColor"
          />
        </svg>
      </button>

      {/* Popover for Pencil Drawing Customization (Colors & Thickness) */}
      {isOpen && (
        <div className="absolute -top-48 -left-12 min-w-[200px] rounded-xl bg-[#1e1e1e] p-3 shadow-xl z-50 text-white">
          <p className="mb-2 text-[11px] font-medium text-gray-300">Pencil Color</p>
          <div className="flex gap-1.5 mb-3">
            {PRESET_PEN_COLORS.map((col, idx) => {
              const hex = colorToCss(col);
              const isSelected =
                penColor &&
                penColor.r === col.r &&
                penColor.g === col.g &&
                penColor.b === col.b;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setPenColor(col);
                    onClick();
                  }}
                  className={`h-5 w-5 rounded-full border ${
                    isSelected ? "ring-2 ring-blue-500 scale-110" : "border-gray-600"
                  }`}
                  style={{ backgroundColor: hex }}
                  title={hex}
                />
              );
            })}
          </div>

          <p className="mb-2 text-[11px] font-medium text-gray-300">Brush Thickness</p>
          <div className="grid grid-cols-2 gap-1.5">
            {PRESET_PEN_SIZES.map(({ label, size }) => (
              <button
                key={size}
                onClick={() => {
                  setPenSize(size);
                  onClick();
                }}
                className={`rounded px-2 py-1 text-xs text-left ${
                  penSize === size ? "bg-blue-600 font-semibold" : "bg-neutral-800 hover:bg-neutral-700"
                }`}
              >
                {label} ({size}px)
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
