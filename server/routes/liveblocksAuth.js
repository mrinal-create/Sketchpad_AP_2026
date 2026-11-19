import express from "express";
import { Liveblocks } from "@liveblocks/node";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js"; // Adjust path to your Prisma instance

const router = express.Router();

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY,
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const roomId = req.body?.room;
    if (typeof roomId !== "string" || roomId.length === 0) {
      return res.status(400).json({ error: "Room ID is required" });
    }

    const room = await prisma.room.findFirst({
      where: {
        id: roomId,
        OR: [
          { ownerId: req.user.id },
          { roomInvites: { some: { userId: req.user.id } } },
        ],
      },
      select: { id: true },
    });

    if (!room) {
      return res
        .status(403)
        .json({ error: "You do not have access to this room" });
    }

    const session = liveblocks.prepareSession(req.user.id, {
      userInfo: {
        name: req.user.email ?? "Anonymous",
      },
    });

    session.allow(room.id, session.FULL_ACCESS);

    const { status, body } = await session.authorize();

    res.status(status).send(body);
  } catch (error) {
    console.error("Liveblocks auth error:", error);
    res.status(500).json({ error: "Failed to authorize Liveblocks session" });
  }
});

export default router;
