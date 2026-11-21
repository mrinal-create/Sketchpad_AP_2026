import { useState } from "react";
import { LiveList, LiveMap } from "@liveblocks/client";
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
  useErrorListener,
  useStatus,
} from "@liveblocks/react";
import { API_URL } from "../../lib/api-url.js";

export function Room({ children, roomId }) {
  return (
    <LiveblocksProvider
      authEndpoint={async (room) => {
        const response = await fetch(`${API_URL}/api/liveblocksAuth`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Sends Better Auth session cookie to Express
          body: JSON.stringify({ room }),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Failed to authorize this room");
        }
        return result;
      }}
    >
      <RoomProvider
        id={roomId}
        initialPresence={{
          selection: [],
          cursor: null,
          penColor: null,
          pencilDraft: null,
          message: "",
          cursorChat: null,
        }}
        initialStorage={{
          roomColor: { r: 30, g: 30, b: 30 },
          layers: new LiveMap(),
          layerIds: new LiveList([]),
          comments: new LiveList([]),
        }}
      >
        <ClientSideSuspense
          fallback={
            <div className="flex h-screen flex-col items-center justify-center gap-2">
              <img
                src="/figma-logo.svg"
                alt="Figma logo"
                className="h-[50px] w-[50px] animate-bounce"
              />
              <h1 className="text-sm font-normal">Loading</h1>
            </div>
          }
        >
          <RoomConnection>{children}</RoomConnection>
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}

function RoomConnection({ children }) {
  const status = useStatus();
  const [connectionError, setConnectionError] = useState("");

  useErrorListener((error) => {
    console.error("Liveblocks connection error:", error);
    setConnectionError(error.message);
  });

  if (status !== "connected") {
    return (
      <div
        role={connectionError ? "alert" : undefined}
        className="flex h-screen items-center justify-center bg-[#f7f8fa] px-6 text-center"
      >
        <div className="max-w-sm">
          <p className="text-sm font-medium text-gray-900">
            {connectionError
              ? "Couldn't connect to this design"
              : "Connecting to your design…"}
          </p>
          {connectionError && (
            <p className="mt-2 text-sm text-gray-500">{connectionError}</p>
          )}
        </div>
      </div>
    );
  }

  return children;
}
