import { useEffect, useRef, useState } from "react";
import { useMutation, useSelf } from "@liveblocks/react";
import { connectionIdToColor } from "../../utils";
import { BsChatDots } from "react-icons/bs";
import { IoCloseOutline } from "react-icons/io5";

export default function CursorChat({
  cursorScreen,
  isActive,
  onClose,
}) {
  const me = useSelf();
  const inputRef = useRef(null);
  const [message, setMessage] = useState("");
  const [committedMessage, setCommittedMessage] = useState(null);

  const updatePresenceMessage = useMutation(({ setMyPresence }, text) => {
    setMyPresence({
      message: text,
      cursorChat: text ? { mode: "chat", message: text } : null,
    });
  }, []);

  useEffect(() => {
    if (isActive) {
      setMessage("");
      setCommittedMessage(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      updatePresenceMessage("");
    }
  }, [isActive, updatePresenceMessage]);

  const handleChange = (e) => {
    const val = e.target.value;
    setMessage(val);
    updatePresenceMessage(val);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (message.trim()) {
        const text = message.trim();
        setCommittedMessage(text);
        setTimeout(() => {
          setCommittedMessage((prev) => (prev === text ? null : prev));
          updatePresenceMessage("");
        }, 4000);
      }
      onClose();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setMessage("");
      setCommittedMessage(null);
      updatePresenceMessage("");
      onClose();
    }
  };

  if (!isActive && !committedMessage) return null;
  if (!cursorScreen) return null;

  const color = connectionIdToColor(me?.connectionId ?? 0);

  return (
    <div
      style={{
        position: "fixed",
        left: `${cursorScreen.x + 16}px`,
        top: `${cursorScreen.y + 16}px`,
        transformOrigin: "top left",
        zIndex: 50,
      }}
      className="pointer-events-auto select-none"
    >
      {isActive ? (
        <div className="flex items-center gap-2 rounded-2xl bg-white/95 px-3 py-1.5 shadow-2xl border border-gray-200 backdrop-blur-md transition-all animate-in fade-in zoom-in-95 duration-100">
          <div
            className="flex h-5 w-5 items-center justify-center rounded-full text-white shrink-0 shadow-sm"
            style={{ backgroundColor: color }}
          >
            <BsChatDots className="h-3 w-3" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Say something... (Enter to send, Esc to cancel)"
            className="w-56 text-xs text-gray-800 placeholder:text-gray-400 bg-transparent focus:outline-none"
            maxLength={100}
          />
          <button
            onClick={() => {
              setMessage("");
              updatePresenceMessage("");
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <IoCloseOutline className="h-4 w-4" />
          </button>
        </div>
      ) : committedMessage ? (
        <div className="relative px-3 py-1.5 rounded-xl bg-white text-gray-900 shadow-xl border border-gray-200/90 text-xs font-normal max-w-[220px] break-words animate-in fade-in zoom-in-95 duration-150">
          <div className="absolute -top-1 left-2.5 w-2 h-2 bg-white rotate-45 border-l border-t border-gray-200/90" />
          {committedMessage}
        </div>
      ) : null}
    </div>
  );
}
