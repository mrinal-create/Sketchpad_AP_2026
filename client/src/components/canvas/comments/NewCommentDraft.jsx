import { useEffect, useRef, useState } from "react";
import { BsSendFill } from "react-icons/bs";
import { IoCloseOutline } from "react-icons/io5";

export default function NewCommentDraft({
  draftPoint,
  authorColor,
  onPost,
  onCancel,
}) {
  const [text, setText] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onPost(text.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  if (!draftPoint) return null;

  return (
    <div
      style={{
        left: `${draftPoint.x}px`,
        top: `${draftPoint.y}px`,
      }}
      onClick={(e) => e.stopPropagation()}
      className="absolute z-50 select-none"
    >
      {/* Drafting Pin */}
      <div
        className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center"
      >
        <div
          className="flex h-6 w-6 items-center justify-center rounded-full text-white shadow-lg ring-2 ring-white animate-pulse"
          style={{ backgroundColor: authorColor || "#2563eb" }}
        >
          <span className="text-[10px] font-bold">✎</span>
        </div>
        <div
          className="h-1.5 w-1.5 -translate-y-0.5 rotate-45 shadow-sm"
          style={{ backgroundColor: authorColor || "#2563eb" }}
        />
      </div>

      {/* Input Card */}
      <form
        onSubmit={handleSubmit}
        className="absolute left-4 -top-3 w-64 rounded-xl border border-gray-200 bg-white p-2.5 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-100"
      >
        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-gray-100">
          <span className="text-[11px] font-semibold text-gray-700">
            Add Comment
          </span>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <IoCloseOutline className="h-4 w-4" />
          </button>
        </div>

        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a comment... (Enter to post, Esc to cancel)"
          className="w-full resize-none rounded-lg border border-gray-200 p-2 text-xs text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
          rows={3}
        />

        <div className="mt-2 flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!text.trim()}
            className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>Post</span>
            <BsSendFill className="h-2.5 w-2.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
