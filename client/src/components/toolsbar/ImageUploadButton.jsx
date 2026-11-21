/* === FEATURE 2: UPLOADING IMAGES (Image Upload Toolbar Button) === */
import { useRef } from "react";
import IconButton from "./IconButton";
import { BsImage } from "react-icons/bs";

export default function ImageUploadButton({ onInsertImage }) {
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read image file as data URL (Base64)
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result;
      if (!src) return;

      // Create an in-memory image to measure natural dimensions
      const img = new Image();
      img.onload = () => {
        let width = img.naturalWidth || 300;
        let height = img.naturalHeight || 200;

        // Auto-scale large images to fit nicely on the canvas
        const maxDimension = 400;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height / width) * maxDimension);
            width = maxDimension;
          } else {
            width = Math.round((width / height) * maxDimension);
            height = maxDimension;
          }
        }

        onInsertImage({
          src,
          width,
          height,
        });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);

    // Reset input value so re-selecting the same file also triggers onChange
    e.target.value = "";
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml, image/gif"
        onChange={handleFileChange}
        className="hidden"
      />
      <IconButton
        isActive={false}
        onClick={handleButtonClick}
      >
        <BsImage className="h-4 w-4" title="Upload Image" />
      </IconButton>
    </>
  );
}
