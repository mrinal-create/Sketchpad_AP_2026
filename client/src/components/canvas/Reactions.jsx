import { useEffect } from "react";
import { useEventListener } from "@liveblocks/react";

export default function Reactions({ reactions, setReactions }) {
  useEventListener(({ event }) => {
    if (event?.type === "REACTION") {
      setReactions((prev) => [
        ...prev.slice(-40),
        {
          id: event.id,
          emoji: event.emoji,
          x: event.x,
          y: event.y,
          createdAt: event.createdAt || Date.now(),
          offset: event.offset || 0,
        },
      ]);
    }
  });

  // Cleanup expired reactions
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setReactions((prev) => prev.filter((r) => now - r.createdAt < 2200));
    }, 1000);
    return () => clearInterval(interval);
  }, [setReactions]);

  if (!reactions?.length) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {reactions.map((r) => (
        <div
          key={r.id}
          style={{
            left: `${r.x + (r.offset || 0)}px`,
            top: `${r.y}px`,
          }}
          className="absolute -translate-x-1/2 select-none text-2xl animate-reaction-float pointer-events-none"
        >
          {r.emoji}
        </div>
      ))}
    </div>
  );
}
