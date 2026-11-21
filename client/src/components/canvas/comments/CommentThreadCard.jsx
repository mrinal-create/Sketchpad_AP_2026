import { useState } from "react";
import { formatRelativeTime } from "../../../utils";
import { BsCheckLg, BsTrash3, BsSendFill, BsArrowCounterclockwise } from "react-icons/bs";
import { IoCloseOutline } from "react-icons/io5";

export default function CommentThreadCard({
  comment,
  onClose,
  onResolve,
  onDelete,
  onAddReply,
  currentUser,
}) {
  const [replyText, setReplyText] = useState("");

  if (!comment) return null;

  const { id, x, y, resolved, messages = [] } = comment;
  const initialMessage = messages[0];
  const replies = messages.slice(1);

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    onAddReply(id, replyText.trim());
    setReplyText("");
  };

  return (
    <div
      style={{
        left: `${x + 16}px`,
        top: `${y - 12}px`,
      }}
      onClick={(e) => e.stopPropagation()}
      className="absolute z-40 w-72 rounded-xl border border-gray-200/90 bg-white shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-100 select-text"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
            style={{ backgroundColor: initialMessage?.authorColor || "#2563eb" }}
          >
            {initialMessage?.authorName?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-gray-900">
              {initialMessage?.authorName || "Anonymous"}
            </p>
            <p className="text-[10px] text-gray-400">
              {formatRelativeTime(initialMessage?.createdAt)}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onResolve(id)}
            className={`flex h-6 w-6 items-center justify-center rounded-md transition cursor-pointer ${
              resolved
                ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                : "text-gray-400 hover:bg-gray-100 hover:text-emerald-600"
            }`}
            title={resolved ? "Reopen thread" : "Mark as resolved"}
          >
            {resolved ? (
              <BsArrowCounterclockwise className="h-3.5 w-3.5" />
            ) : (
              <BsCheckLg className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            onClick={() => onDelete(id)}
            className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-500 transition cursor-pointer"
            title="Delete comment"
          >
            <BsTrash3 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer"
            title="Close"
          >
            <IoCloseOutline className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Comment Body */}
      <div className="p-3 text-xs text-gray-800 leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap break-words">
        {initialMessage?.text}
      </div>

      {/* Replies Thread */}
      {replies.length > 0 && (
        <div className="border-t border-gray-100 px-3 py-2 flex flex-col gap-2 max-h-44 overflow-y-auto bg-gray-50/50">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Replies ({replies.length})
          </span>
          {replies.map((reply) => (
            <div key={reply.id} className="flex flex-col gap-1 rounded-lg bg-white p-2 border border-gray-100 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div
                    className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
                    style={{ backgroundColor: reply.authorColor || "#2563eb" }}
                  >
                    {reply.authorName?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[11px] font-medium text-gray-800">
                    {reply.authorName}
                  </span>
                </div>
                <span className="text-[9px] text-gray-400">
                  {formatRelativeTime(reply.createdAt)}
                </span>
              </div>
              <p className="text-xs text-gray-700 pl-5 whitespace-pre-wrap break-words">
                {reply.text}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Reply Input Form */}
      <form onSubmit={handleSendReply} className="border-t border-gray-100 p-2 flex items-center gap-1.5">
        <input
          type="text"
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Reply to this thread..."
          className="flex-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!replyText.trim()}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          title="Send reply"
        >
          <BsSendFill className="h-3 w-3" />
        </button>
      </form>
    </div>
  );
}
