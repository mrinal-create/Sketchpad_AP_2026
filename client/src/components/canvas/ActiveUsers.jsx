import { useState } from "react";
import { useOthers, useSelf } from "@liveblocks/react";
import { connectionIdToColor } from "../../utils";
import { IoLocateOutline } from "react-icons/io5";

export default function ActiveUsers({ onFocusUser }) {
  const me = useSelf();
  const others = useOthers();
  const [showRoster, setShowRoster] = useState(false);

  const allUsers = [];
  if (me) {
    allUsers.push({
      connectionId: me.connectionId,
      name: me.info?.name || "You",
      email: me.info?.email,
      isSelf: true,
      cursor: me.presence?.cursor,
      color: connectionIdToColor(me.connectionId),
    });
  }
  others.forEach((other) => {
    allUsers.push({
      connectionId: other.connectionId,
      name:
        other.info?.name ||
        (other.info?.email
          ? other.info.email.split("@")[0]
          : `User ${other.connectionId}`),
      email: other.info?.email,
      isSelf: false,
      cursor: other.presence?.cursor,
      color: connectionIdToColor(other.connectionId),
    });
  });

  const totalCount = allUsers.length;
  const visibleUsers = allUsers.slice(0, 4);
  const remainingCount = totalCount - visibleUsers.length;

  return (
    <div className="relative flex items-center gap-2">
      {/* Active Count Chip */}
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[10px] font-medium text-emerald-700">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span>{totalCount} active</span>
      </div>

      {/* Avatar Stack */}
      <div className="flex items-center -space-x-1.5">
        {visibleUsers.map((user) => (
          <div
            key={user.connectionId}
            className="group relative cursor-pointer"
            onClick={() => {
              if (!user.isSelf && user.cursor && onFocusUser) {
                onFocusUser(user);
              }
            }}
          >
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white ring-2 ring-white shadow-sm transition-transform hover:scale-110 hover:z-20 ${
                user.isSelf ? "ring-offset-1 ring-offset-blue-500" : ""
              }`}
              style={{ backgroundColor: user.color }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>

            {/* Hover Tooltip Card */}
            <div className="absolute right-0 top-9 hidden group-hover:flex z-50 min-w-[160px] flex-col rounded-lg bg-gray-900 p-2 text-white shadow-xl">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium truncate">
                  {user.name} {user.isSelf && "(You)"}
                </span>
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: user.color }}
                />
              </div>
              {user.email && (
                <span className="text-[10px] text-gray-400 truncate">
                  {user.email}
                </span>
              )}
              {!user.isSelf && user.cursor && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onFocusUser) onFocusUser(user);
                  }}
                  className="mt-1.5 flex items-center justify-center gap-1 rounded bg-white/10 px-1.5 py-0.5 text-[10px] hover:bg-white/20 transition cursor-pointer"
                >
                  <IoLocateOutline className="h-3 w-3" />
                  <span>Jump to cursor</span>
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Overflow Pill */}
        {remainingCount > 0 && (
          <button
            onClick={() => setShowRoster((prev) => !prev)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-700 ring-2 ring-white hover:bg-gray-200 transition cursor-pointer"
            title="View all active collaborators"
          >
            +{remainingCount}
          </button>
        )}
      </div>

      {/* Roster Popover */}
      {showRoster && (
        <div className="absolute right-0 top-10 z-50 w-56 rounded-xl border border-gray-200 bg-white p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-800">
              Active Collaborators ({totalCount})
            </span>
            <button
              onClick={() => setShowRoster(false)}
              className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="mt-2 flex flex-col gap-1.5 max-h-48 overflow-y-auto">
            {allUsers.map((u) => (
              <div
                key={u.connectionId}
                className="flex items-center justify-between rounded-lg p-1.5 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: u.color }}
                  >
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-gray-800">
                      {u.name} {u.isSelf && "(You)"}
                    </p>
                    {u.email && (
                      <p className="truncate text-[10px] text-gray-400">
                        {u.email}
                      </p>
                    )}
                  </div>
                </div>
                {!u.isSelf && u.cursor && onFocusUser && (
                  <button
                    onClick={() => {
                      onFocusUser(u);
                      setShowRoster(false);
                    }}
                    className="rounded p-1 text-gray-500 hover:bg-gray-200 hover:text-black cursor-pointer"
                    title="Jump to cursor"
                  >
                    <IoLocateOutline className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
