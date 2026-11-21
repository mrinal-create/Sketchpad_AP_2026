import { memo } from "react";
import { shallow, useOther } from "@liveblocks/react";
import { connectionIdToColor } from "../../utils";

function Cursor({ connectionId }) {
  const other = useOther(
    connectionId,
    (user) => ({
      cursor: user.presence?.cursor,
      info: user.info,
      message: user.presence?.message,
      cursorChat: user.presence?.cursorChat,
    }),
    shallow,
  );

  if (!other?.cursor) {
    return null;
  }

  const { x, y } = other.cursor;
  const color = connectionIdToColor(connectionId);
  const name =
    other.info?.name ||
    (other.info?.email ? other.info.email.split("@")[0] : `User ${connectionId}`);
  const chatMessage = other.message || other.cursorChat?.message;

  return (
    <g
      style={{
        transform: `translateX(${x}px) translateY(${y}px)`,
        transition: "transform 0.08s linear",
      }}
      className="pointer-events-none select-none"
    >
      {/* Sleek SVG Cursor Pointer */}
      <path
        d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
        fill={color}
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* User Name Badge & Remote Cursor Chat Bubble */}
      <foreignObject
        x={14}
        y={14}
        width={280}
        height={160}
        className="overflow-visible pointer-events-none"
      >
        <div className="flex flex-col items-start gap-1 select-none pointer-events-none">
          {/* User Name Badge Pill */}
          <div
            className="px-2 py-0.5 rounded-full text-[11px] font-semibold text-white shadow-md max-w-[150px] truncate"
            style={{ backgroundColor: color }}
          >
            {name}
          </div>

          {/* Remote Cursor Chat Bubble */}
          {chatMessage && (
            <div className="relative mt-1 px-3 py-1.5 rounded-xl bg-white text-gray-900 shadow-xl border border-gray-200/90 text-xs font-normal max-w-[220px] break-words pointer-events-none animate-in fade-in zoom-in-95 duration-150">
              <div className="absolute -top-1 left-2.5 w-2 h-2 bg-white rotate-45 border-l border-t border-gray-200/90" />
              {chatMessage}
            </div>
          )}
        </div>
      </foreignObject>
    </g>
  );
}

export default memo(Cursor);
