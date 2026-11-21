import IconButton from "./IconButton";
import { BsChatLeftText } from "react-icons/bs";

export default function CommentsButton({
  isActive,
  onClick,
  unresolvedCount = 0,
}) {
  return (
    <div className="relative" title="Comments (C)">
      <IconButton isActive={isActive} onClick={onClick}>
        <BsChatLeftText className="h-4 w-4" />
      </IconButton>
      {unresolvedCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-blue-600 px-1 text-[8px] font-bold text-white shadow-xs pointer-events-none">
          {unresolvedCount > 9 ? "9+" : unresolvedCount}
        </span>
      )}
    </div>
  );
}
