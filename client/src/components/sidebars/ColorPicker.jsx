import { useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";

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
    <div ref={pickerRef} className={`relative h-fit ${className ?? "w-28"}`}>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onBlur={handleCommit}
        onKeyDown={handleKeyDown}
        className="h-fit w-full rounded-lg border border-[#f5f5f5] bg-[#f5f5f5] px-2 py-1 pl-6 text-xs hover:border-[#e8e8e8]"
      />
      <div
        style={{ backgroundColor: inputValue }}
        onClick={() => setIsPickerOpen(!isPickerOpen)}
        className="absolute left-1.5 top-[50%] h-3.5 w-3.5 -translate-y-1/2 cursor-pointer rounded"
      />
      {isPickerOpen && (
        <div className="absolute right-0 z-10 mt-2 -translate-x-[125px]">
          <HexColorPicker color={inputValue} onChange={handleColorChange} />
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
