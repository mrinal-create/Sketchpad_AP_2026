import IconButton from "./IconButton";
import { BsEmojiSmile } from "react-icons/bs";

export default function ReactionsButton({ isActive, onClick }) {
  return (
    <div title="Reactions (E)">
      <IconButton isActive={isActive} onClick={onClick}>
        <BsEmojiSmile className="h-4 w-4" />
      </IconButton>
    </div>
  );
}
