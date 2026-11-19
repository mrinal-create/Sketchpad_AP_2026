import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js"; 

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: req.user.id,
      },
      include: {
        ownedRooms: true,
        roomInvites: {
          include: {
            room: true,
          },
        },
      },
    });

    res.json({
      email: user.email,
      ownedRooms: user.ownedRooms,
      roomInvites: user.roomInvites.map((invite) => invite.room),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
});

export default router;
