import { IoCloseOutline } from "react-icons/io5";

export const REACTION_EMOJIS = [
  "👍",
  "❤️",
  "🔥",
  "🎉",
  "😂",
  "👏",
  "🚀",
  "😍",
  "✨",
  "💡",
];

export default function ReactionSelector({
  onSelectEmoji,
  selectedEmoji,
  onFireReaction,
  onClose,
}) {
  return (
    <div className="fixed bottom-16 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 shadow-xl border border-gray-200/90 backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-2 duration-150">
      <span className="text-[11px] font-medium text-gray-500 mr-1 select-none">
        React:
      </span>
      {REACTION_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => {
            onSelectEmoji(emoji);
            if (onFireReaction) onFireReaction(emoji);
          }}
          className={`h-8 w-8 rounded-full text-lg hover:scale-125 transition-transform flex items-center justify-center cursor-pointer ${
            selectedEmoji === emoji
              ? "bg-blue-50 ring-2 ring-blue-500"
              : "hover:bg-gray-100"
          }`}
          title={`React with ${emoji} (Click anywhere on canvas to burst)`}
        >
          {emoji}
        </button>
      ))}
      <div className="w-[1px] h-4 bg-gray-200 mx-1" />
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 cursor-pointer"
        title="Close reactions (Esc)"
      >
        <IoCloseOutline className="h-4 w-4" />
      </button>
    </div>
  );
}
