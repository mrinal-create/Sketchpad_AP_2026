import { useCallback, useState } from "react";
import { useMutation, useSelf, useStorage } from "@liveblocks/react";
import { LiveList, LiveObject } from "@liveblocks/client";
import { nanoid } from "nanoid";
import { connectionIdToColor } from "../../../utils";
import CommentPin from "./CommentPin";
import CommentThreadCard from "./CommentThreadCard";
import NewCommentDraft from "./NewCommentDraft";

export default function CommentsOverlay({
  draftPoint,
  setDraftPoint,
  filter = "all", // 'all' | 'unresolved' | 'hidden'
}) {
  const me = useSelf();
  const [selectedCommentId, setSelectedCommentId] = useState(null);

  // Safely retrieve comments from Liveblocks storage
  const comments = useStorage((root) => {
    const raw = root.comments;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw.map === "function") {
      return raw.map((c) =>
        typeof c?.toObject === "function"
          ? c.toObject()
          : typeof c?.toJSON === "function"
            ? c.toJSON()
            : c,
      );
    }
    return [];
  });

  const currentUserColor = connectionIdToColor(me?.connectionId ?? 0);
  const currentUserName =
    me?.info?.name ||
    (me?.info?.email ? me.info.email.split("@")[0] : `User ${me?.connectionId ?? 0}`);

  // Mutation to add new comment
  const addComment = useMutation(({ storage }, text) => {
    if (!draftPoint) return;

    let storageComments = storage.get("comments");
    if (!storageComments) {
      storage.set("comments", new LiveList([]));
      storageComments = storage.get("comments");
    }

    const commentId = nanoid();
    const newComment = new LiveObject({
      id: commentId,
      x: draftPoint.x,
      y: draftPoint.y,
      authorName: currentUserName,
      authorEmail: me?.info?.email || "",
      authorColor: currentUserColor,
      createdAt: new Date().toISOString(),
      resolved: false,
      messages: [
        {
          id: nanoid(),
          authorName: currentUserName,
          authorEmail: me?.info?.email || "",
          authorColor: currentUserColor,
          text,
          createdAt: new Date().toISOString(),
        },
      ],
    });

    storageComments.push(newComment);
    setDraftPoint(null);
    setSelectedCommentId(commentId);
  }, [draftPoint, currentUserName, currentUserColor, me]);

  // Mutation to toggle resolve status
  const resolveComment = useMutation(({ storage }, commentId) => {
    const storageComments = storage.get("comments");
    if (!storageComments) return;

    for (let i = 0; i < storageComments.length; i++) {
      const c = storageComments.get(i);
      const id = typeof c.get === "function" ? c.get("id") : c.id;
      if (id === commentId) {
        if (typeof c.set === "function") {
          c.set("resolved", !c.get("resolved"));
        } else {
          storageComments.set(i, { ...c, resolved: !c.resolved });
        }
        break;
      }
    }
  }, []);

  // Mutation to delete a comment thread
  const deleteComment = useMutation(({ storage }, commentId) => {
    const storageComments = storage.get("comments");
    if (!storageComments) return;

    for (let i = 0; i < storageComments.length; i++) {
      const c = storageComments.get(i);
      const id = typeof c?.get === "function" ? c.get("id") : c?.id;
      if (id === commentId) {
        storageComments.delete(i);
        break;
      }
    }
    if (selectedCommentId === commentId) {
      setSelectedCommentId(null);
    }
  }, [selectedCommentId]);

  // Mutation to add a reply to an existing comment
  const addReply = useMutation(({ storage }, { commentId, replyText }) => {
    const storageComments = storage.get("comments");
    if (!storageComments) return;

    for (let i = 0; i < storageComments.length; i++) {
      const c = storageComments.get(i);
      const id = typeof c?.get === "function" ? c.get("id") : c?.id;
      if (id === commentId) {
        const reply = {
          id: nanoid(),
          authorName: currentUserName,
          authorEmail: me?.info?.email || "",
          authorColor: currentUserColor,
          text: replyText,
          createdAt: new Date().toISOString(),
        };

        if (typeof c?.get === "function") {
          const msgs = c.get("messages") || [];
          c.set("messages", [...msgs, reply]);
        } else {
          storageComments.set(i, {
            ...c,
            messages: [...(c.messages || []), reply],
          });
        }
        break;
      }
    }
  }, [currentUserName, currentUserColor, me]);

  if (filter === "hidden") {
    // Only show draft if currently drafting
    if (draftPoint) {
      return (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          <NewCommentDraft
            draftPoint={draftPoint}
            authorColor={currentUserColor}
            onPost={(text) => addComment(text)}
            onCancel={() => setDraftPoint(null)}
          />
        </div>
      );
    }
    return null;
  }

  // Filter comments based on selected filter
  const visibleComments = comments.filter((c) => {
    if (filter === "unresolved") return !c.resolved;
    return true;
  });

  const selectedComment = comments.find((c) => c.id === selectedCommentId);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {/* Render all comment pins */}
      {visibleComments.map((comment) => (
        <CommentPin
          key={comment.id}
          comment={comment}
          isSelected={comment.id === selectedCommentId}
          onClick={(c) => {
            setSelectedCommentId((prev) => (prev === c.id ? null : c.id));
          }}
        />
      ))}

      {/* Render active expanded thread card */}
      {selectedComment && (
        <CommentThreadCard
          comment={selectedComment}
          currentUser={me}
          onClose={() => setSelectedCommentId(null)}
          onResolve={(id) => resolveComment(id)}
          onDelete={(id) => deleteComment(id)}
          onAddReply={(commentId, replyText) => addReply({ commentId, replyText })}
        />
      )}

      {/* Render drafting new comment card */}
      {draftPoint && (
        <NewCommentDraft
          draftPoint={draftPoint}
          authorColor={currentUserColor}
          onPost={(text) => addComment(text)}
          onCancel={() => setDraftPoint(null)}
        />
      )}
    </div>
  );
}
