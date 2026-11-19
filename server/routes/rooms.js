import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js"; 

const router = express.Router();

router.use(requireAuth);

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const room = await prisma.room.findUnique({
      where: { id },
      select: {
        title: true,
        ownerId: true,
        roomInvites: {
          select: { user: true },
        },
      },
    });

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const inviteeUserIds = room.roomInvites.map((invite) => invite.user.id);
    if (room.ownerId !== req.user.id && !inviteeUserIds.includes(req.user.id)) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json({
      roomName: room.title,
      roomId: id,
      othersWithAccessToRoom: room.roomInvites.map((x) => x.user),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch room" });
  }
});

router.post("/", async (req, res) => {
  try {
    const room = await prisma.room.create({
      data: {
        owner: {
          connect: { id: req.user.id },
        },
      },
      select: { id: true },
    });

    res.status(201).json({ id: room.id });
  } catch (error) {
    res.status(500).json({ error: "Failed to create room" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    await prisma.room.findUniqueOrThrow({
      where: {
        id,
        ownerId: req.user.id,
      },
    });

    const updated = await prisma.room.update({
      where: { id },
      data: { title },
    });

    res.json(updated);
  } catch (error) {
    res.status(404).json({ error: "Room not found or unauthorized" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.room.findUniqueOrThrow({
      where: {
        id,
        ownerId: req.user.id,
      },
    });

    await prisma.room.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(404).json({ error: "Room not found or unauthorized" });
  }
});

router.post("/:id/share", async (req, res) => {
  try {
    const { id } = req.params;
    const { inviteEmail } = req.body;

    await prisma.room.findUniqueOrThrow({
      where: {
        id,
        ownerId: req.user.id,
      },
    });

    const invitedUser = await prisma.user.findUnique({
      where: { email: inviteEmail },
      select: { id: true },
    });

    if (!invitedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    await prisma.roomInvite.create({
      data: {
        roomId: id,
        userId: invitedUser.id,
      },
    });

    res.status(201).json({ success: true });
  } catch (error) {
    res.status(400).json({ error: "Failed to share room" });
  }
});

router.delete("/:id/share", async (req, res) => {
  try {
    const { id } = req.params;
    const { inviteEmail } = req.body;

    await prisma.room.findUniqueOrThrow({
      where: {
        id,
        ownerId: req.user.id,
      },
    });

    await prisma.roomInvite.deleteMany({
      where: {
        roomId: id,
        user: {
          email: inviteEmail,
        },
      },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: "Failed to remove invitation" });
  }
});

export default router;
