import { memo } from "react";
import { BsCheckLg, BsChatLeftTextFill } from "react-icons/bs";

function CommentPin({
  comment,
  isSelected,
  onClick,
}) {
  const { x, y, authorName, authorColor, resolved, messages } = comment;
  const replyCount = (messages?.length || 1) - 1;

  return (
    <div
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: "translate(-50%, -100%)",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(comment);
      }}
      className={`absolute z-20 cursor-pointer select-none transition-transform duration-150 hover:scale-115 ${
        isSelected ? "scale-115 z-30" : ""
      }`}
      title={`${authorName}: ${messages?.[0]?.text || "Comment"} (${resolved ? "Resolved" : "Open"})`}
    >
      <div className="relative flex flex-col items-center">
        {/* Pin Bubble */}
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-full text-white shadow-lg ring-2 ring-white transition-colors ${
            resolved
              ? "bg-gray-400 opacity-80 hover:opacity-100"
              : "hover:brightness-105"
          }`}
          style={{
            backgroundColor: resolved ? "#9ca3af" : authorColor || "#2563eb",
          }}
        >
          {resolved ? (
            <BsCheckLg className="h-3.5 w-3.5 text-white" />
          ) : (
            <span className="text-[11px] font-bold">
              {authorName ? authorName.charAt(0).toUpperCase() : <BsChatLeftTextFill className="h-3 w-3" />}
            </span>
          )}
        </div>

        {/* Pin pointer tip */}
        <div
          className="h-1.5 w-1.5 -translate-y-0.5 rotate-45 shadow-sm"
          style={{
            backgroundColor: resolved ? "#9ca3af" : authorColor || "#2563eb",
          }}
        />

        {/* Reply count badge */}
        {!resolved && replyCount > 0 && (
          <div className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-bold text-white ring-1 ring-white shadow">
            +{replyCount}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(CommentPin);
