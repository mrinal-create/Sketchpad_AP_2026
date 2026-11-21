import IconButton from "./IconButton";
import { BsChatDots } from "react-icons/bs";

export default function CursorChatButton({ isActive, onClick }) {
  return (
    <div title="Cursor Chat (/)">
      <IconButton isActive={isActive} onClick={onClick}>
        <BsChatDots className="h-4 w-4" />
      </IconButton>
    </div>
  );
}
