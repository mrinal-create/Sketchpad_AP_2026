import { useState } from "react";
import { useNavigate } from "react-router";
import { FiPlus } from "react-icons/fi";
import { createRoom } from "../../lib/rooms-api.js";

export default function CreateRoom({ onRoomCreated }) {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (isCreating) return;
    setIsCreating(true);
    setError("");

    try {
      const room = await createRoom();
      if (onRoomCreated) {
        await onRoomCreated();
      }
      navigate(`/dashboard/${room.id}`);
    } catch (error) {
      console.error("Failed to create room:", error);
      setError("Couldn't create a design. Please try again.");
      setIsCreating(false);
    }
  }

  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        onClick={handleCreate}
        disabled={isCreating}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-wait disabled:opacity-70"
      >
        <FiPlus className="h-4 w-4" />
        {isCreating ? "Creating…" : "New design"}
      </button>
      {error && (
        <span role="alert" className="absolute mt-11 text-xs text-red-600">
          {error}
        </span>
      )}
    </div>
  );
}
