/* === FEATURE 3: CUSTOMIZATION (ColorPicker Component) === */
import { useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";

const PRESET_SWATCHES = [
  "#000000",
  "#ffffff",
  "#6b7280",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#1e1e1e",
];

const ColorPicker = ({ value, onChange, className }) => {
  const [inputValue, setInputValue] = useState(value);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsPickerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [pickerRef]);

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleCommit = () => {
    if (/^#[0-9a-f]{6}$/i.test(inputValue)) {
      onChange(inputValue);
    } else {
      setInputValue(value);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleCommit();
      e.currentTarget.blur();
    }
  };

  const handleColorChange = (color) => {
    setInputValue(color);
    onChange(color);
  };

  return (
    <div ref={pickerRef} className={`relative h-fit ${className ?? "w-full max-w-[208px]"}`}>
      <div className="relative flex items-center">
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleCommit}
          onKeyDown={handleKeyDown}
          className="h-fit w-full rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-2 py-1 pl-7 text-xs font-mono text-gray-800 hover:border-gray-300 focus:border-blue-500 focus:outline-none"
        />
        <div
          style={{ backgroundColor: inputValue }}
          onClick={() => setIsPickerOpen(!isPickerOpen)}
          className="absolute left-2 h-3.5 w-3.5 cursor-pointer rounded border border-black/10 shadow-sm"
          title="Toggle Color Picker"
        />
      </div>

      {/* Popover stays cleanly inside the sidebar container and above all canvas elements */}
      {isPickerOpen && (
        <div className="absolute left-0 top-full mt-2 z-50 w-[208px] rounded-xl border border-gray-200 bg-white p-2.5 shadow-2xl">
          <HexColorPicker
            color={inputValue}
            onChange={handleColorChange}
            className="w-full"
          />

          {/* Quick preset color swatches */}
          <div className="mt-2.5 pt-2 border-t border-gray-100">
            <p className="mb-1.5 text-[10px] font-medium text-gray-400 uppercase tracking-wider">
              Presets
            </p>
            <div className="grid grid-cols-6 gap-1.5">
              {PRESET_SWATCHES.map((swatch) => (
                <button
                  key={swatch}
                  onClick={() => handleColorChange(swatch)}
                  className={`h-5 w-5 rounded-md border ${
                    inputValue.toLowerCase() === swatch.toLowerCase()
                      ? "ring-2 ring-blue-500 scale-105"
                      : "border-gray-200"
                  }`}
                  style={{ backgroundColor: swatch }}
                  title={swatch}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
