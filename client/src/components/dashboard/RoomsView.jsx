import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { FiArrowUpRight, FiTrash2 } from "react-icons/fi";
import ConfirmationModal from "./ConfirmationModal";
import { deleteRoom, updateRoomTitle } from "../../lib/rooms-api";

const PASTEL_COLORS = [
  "#fce7f3",
  "#dbeafe",
  "#ede9fe",
  "#dcfce7",
  "#fef3c7",
  "#ffedd5",
  "#cffafe",
  "#f3e8ff",
];

export default function RoomsView({ ownedRooms, roomInvites, onUpdate }) {
  const [viewMode, setViewMode] = useState("owns");
  const navigate = useNavigate();

  const filteredRooms = useMemo(() => {
    if (viewMode === "owns") {
      return ownedRooms;
    } else if (viewMode === "shared") {
      return roomInvites;
    }
    return [];
  }, [viewMode, ownedRooms, roomInvites]);

  const roomColors = useMemo(() => {
    return filteredRooms.map((room, index) => ({
      id: room.id,
      color: PASTEL_COLORS[index % PASTEL_COLORS.length],
    }));
  }, [filteredRooms]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex w-fit gap-1 rounded-lg bg-gray-100 p-1">
        <ViewModeButton
          onSelect={() => setViewMode("owns")}
          active={viewMode === "owns"}
          text={`My designs (${ownedRooms.length})`}
        />
        <ViewModeButton
          onSelect={() => setViewMode("shared")}
          active={viewMode === "shared"}
          text={`Shared with me (${roomInvites.length})`}
        />
      </div>
      {filteredRooms.length === 0 ? (
        <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-5 text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <FiArrowUpRight className="h-5 w-5" />
          </div>
          <h2 className="text-sm font-semibold text-gray-900">
            {viewMode === "owns" ? "No designs yet" : "Nothing shared yet"}
          </h2>
          <p className="mt-1 max-w-xs text-sm text-gray-500">
            {viewMode === "owns"
              ? "Create a design to start sketching your next idea."
              : "Designs shared with you will show up here."}
          </p>
        </div>
      ) : (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {filteredRooms.map((room) => {
          const roomColor =
            roomColors.find((rc) => rc.id === room.id)?.color ??
            PASTEL_COLORS[0];

          return (
            <SingleRoom
              key={room.id}
              id={room.id}
              title={room.title}
              description={`Edited ${new Date(room.updatedAt || room.createdAt).toLocaleDateString()}`}
              color={roomColor}
              navigateTo={() => navigate(`/dashboard/${room.id}`)}
              canEdit={viewMode === "owns"}
              onUpdate={onUpdate}
            />
          );
        })}
      </div>
      )}
    </div>
  );
}

function SingleRoom({
  id,
  title,
  description,
  color,
  navigateTo,
  canEdit,
  onUpdate,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  async function saveTitle() {
    setIsEditing(false);
    const nextTitle = editedTitle.trim();
    if (nextTitle && nextTitle !== title) {
      await updateRoomTitle(nextTitle, id);
      if (onUpdate) onUpdate();
    } else {
      setEditedTitle(title);
    }
  }

  const confirmDelete = async () => {
    await deleteRoom(id);
    setShowConfirmationModal(false);
    if (onUpdate) onUpdate();
  };

  return (
    <article className="group min-w-0">
      <div
        className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md"
      >
        <button
          type="button"
          onClick={navigateTo}
          aria-label={`Open ${title}`}
          className="relative flex aspect-[1.55] w-full items-center justify-center overflow-hidden"
          style={{ backgroundColor: color }}
        >
          <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/40" />
          <div className="absolute -bottom-16 -left-8 h-40 w-40 rounded-full bg-white/35" />
          <span className="relative rounded-md bg-white/70 px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm backdrop-blur-sm">
            {title}
          </span>
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-md bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 opacity-0 shadow-sm transition group-hover:opacity-100">
            Open <FiArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </button>
        {canEdit && (
          <button
            type="button"
            aria-label={`Delete ${title}`}
            onClick={() => setShowConfirmationModal(true)}
            className="absolute right-2 top-2 rounded-md bg-white/90 p-2 text-gray-500 opacity-0 shadow-sm transition hover:text-red-600 focus:opacity-100 group-hover:opacity-100"
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="flex items-start justify-between gap-2 pt-3">
        {isEditing && canEdit ? (
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                event.currentTarget.blur();
              }
              if (event.key === "Escape") {
                setEditedTitle(title);
                setIsEditing(false);
              }
            }}
            autoFocus
            aria-label="Design name"
            className="min-w-0 flex-1 rounded border border-blue-300 bg-white px-2 py-1 text-sm font-medium outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => canEdit && setIsEditing(true)}
            className={`truncate text-left text-sm font-medium text-gray-900 ${canEdit ? "cursor-text hover:text-blue-700" : "cursor-default"}`}
            title={canEdit ? "Rename design" : title}
          >
            {title}
          </button>
        )}
      </div>
      <p className="mt-1 text-xs text-gray-500">{description}</p>
      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this room?"
      />
    </article>
  );
}

function ViewModeButton({ onSelect, active, text }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`select-none rounded-md px-3 py-2 text-xs font-medium transition ${active ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
    >
      {text}
    </button>
  );
}
