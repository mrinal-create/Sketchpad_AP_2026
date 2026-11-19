import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { Room } from "../components/liveblocks/Rooms.jsx";
import Canvas from "../components/canvas/Canvas.jsx";
import { API_URL } from "../lib/api-url.js";

export default function RoomPage() {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchRoom() {
      setRoom(null);
      setError("");

      try {
        const response = await fetch(`${API_URL}/api/rooms/${roomId}`, {
          credentials: "include",
          signal: controller.signal,
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Unable to open this design.");
        }

        setRoom(result);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message || "Unable to open this design.");
        }
      }
    }

    fetchRoom();
    return () => controller.abort();
  }, [roomId]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-6">
        <div className="max-w-sm text-center">
          <h1 className="text-lg font-semibold text-gray-900">
            Design unavailable
          </h1>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
          <Link
            to="/dashboard"
            className="mt-5 inline-flex rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
          >
            Back to workspace
          </Link>
        </div>
      </main>
    );
  }

  if (!room) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa]">
        <p className="text-sm text-gray-500">Opening your design…</p>
      </main>
    );
  }

  return (
    <Room roomId={room.roomId}>
      <Canvas
        roomName={room.roomName}
        roomId={room.roomId}
        othersWithAccessToRoom={room.othersWithAccessToRoom}
      />
    </Room>
  );
}
