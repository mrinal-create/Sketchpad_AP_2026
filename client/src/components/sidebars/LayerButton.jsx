import { useMutation } from "@liveblocks/react";

const LayerButton = ({ layerId, text, icon, isSelected }) => {
  const updateSelection = useMutation(({ setMyPresence }, layerId) => {
    setMyPresence({ selection: [layerId] }, { addToHistory: true });
  }, []);

  return (
    <button
      className={`flex items-center gap-2 rounded px-1.5 py-1 text-left text-[11px] hover:bg-gray-100 ${isSelected ? "bg-[#bce3ff]" : ""}`}
      onClick={() => updateSelection(layerId)}
    >w
      {icon}
      <span>{text}</span>
    </button>
  );
};

export default LayerButton;
